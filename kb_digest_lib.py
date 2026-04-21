"""Shared helpers for generating per-repo digests with fingerprint-based caching."""

import hashlib
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone


DIGEST_SCHEMA_VERSION = 1


SYSTEM_PROMPT = """\
You are a research assistant helping a scientist stay on top of one of their GitHub projects. \
Given recent activity for a single repository, write a short briefing entry. \
Scale detail inversely with recency: \
a repo touched today or yesterday needs only a one-liner (the work is fresh in memory). \
A repo untouched for a week or more needs the most context: what was the last thing done, \
what is pending, what needs attention, enough to jog memory. \
A repo in between gets moderate detail. \
Be specific - mention commit messages, issue titles. \
Issue labels like "bug", "enhancement", "documentation" indicate the issue type. \
Use this to characterize work (e.g. "2 open bugs", "a feature request for X"). \
Format as markdown. Output exactly the bolded project name on its own line with two trailing spaces, \
then the summary prose on the next line (no blank line between them). Do not output anything else. \
Express all dates as relative time in prose (e.g. "two days ago", "about a month ago"), never as absolute dates or abbreviated parenthetical timestamps. \
Do not use long dashes (em dashes). Use periods or commas instead."""


USER_PROMPT_TEMPLATE = """\
Here is recent activity for a single GitHub project. Write the briefing entry for it.

{activity}"""


def fmt_date(iso):
    if not iso:
        return ""
    return iso[:10]


def filter_card_activity(card, days=None):
    """Return (commits, issues) after applying the --days cutoff. Empty lists if nothing qualifies."""
    commits = card.get("_ghCommits", []) or []
    issues = card.get("_ghIssuesRecent", []) or []
    if days:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        commits = [c for c in commits if (c.get("date", "") >= cutoff)]
        issues = [i for i in issues if (i.get("date", "") >= cutoff)]
    return commits, issues


def build_activity_for_card(card, commits, issues):
    """Render the activity block for a single card (same format as the original monolithic prompt)."""
    lines = [f"### {card.get('title', card.get('_ghFullName', '?'))}"]
    lines.append(f"URL: {card.get('source', '')}")
    if card.get("content"):
        lines.append(f"Description: {card['content']}")

    if commits:
        lines.append("\nRecent commits:")
        for c in commits:
            lines.append(f"  - [{c['sha']}] {c['msg']} ({fmt_date(c['date'])})")

    open_issues = [i for i in issues if i.get("state") == "open"]
    closed_issues = [i for i in issues if i.get("state") == "closed"]

    if closed_issues:
        lines.append("\nRecently closed issues:")
        for i in closed_issues:
            labels = ", ".join(i.get("labels", []))
            label_str = f" [{labels}]" if labels else ""
            lines.append(f"  - #{i['number']} {i['title']}{label_str} ({fmt_date(i['date'])})")

    if open_issues:
        lines.append("\nOpen issues:")
        for i in open_issues:
            labels = ", ".join(i.get("labels", []))
            label_str = f" [{labels}]" if labels else ""
            lines.append(f"  - #{i['number']} {i['title']}{label_str} ({fmt_date(i['date'])})")

    return "\n".join(lines)


def fingerprint_card(card, commits, issues, days):
    """Stable hash of the inputs the model sees, so unchanged repos can skip regeneration."""
    payload = {
        "v": DIGEST_SCHEMA_VERSION,
        "days": days,
        "commits": [c.get("sha", "") for c in commits],
        "issues": [
            (i.get("number"), i.get("state"), i.get("date"))
            for i in issues
        ],
        "title": card.get("title", ""),
        "source": card.get("source", ""),
        "content": card.get("content", ""),
    }
    blob = json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha1(blob).hexdigest()


def _summarize_one(card, activity_block, client, model):
    """Call Claude for a single repo. Returns markdown string."""
    response = client.messages.create(
        model=model,
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": USER_PROMPT_TEMPLATE.format(activity=activity_block)}],
    )
    return response.content[0].text.strip()


def _placeholder(card):
    title = card.get("title", card.get("_ghFullName", "?"))
    return f"**{title}**  \n(summary unavailable)"


def refresh_digests(cards, client, model, days=None, max_workers=5, log=None):
    """Ensure each card with activity has an up-to-date `_ghDigest`.

    Returns (ordered_markdown_blocks, stats_dict). `ordered_markdown_blocks` is the list of
    per-repo digest entries in the same order cards were given, already filtered to those with
    activity passing `--days`. Cards are mutated in place: stale `_ghDigest` fields are refreshed.
    """
    log = log or (lambda msg: None)

    active = []
    for card in cards:
        commits, issues = filter_card_activity(card, days=days)
        if not commits and not issues:
            continue
        fp = fingerprint_card(card, commits, issues, days)
        cached = card.get("_ghDigest") or {}
        needs_refresh = cached.get("fingerprint") != fp
        active.append((card, commits, issues, fp, needs_refresh))

    stale = [entry for entry in active if entry[4]]
    log(f"{len(stale)}/{len(active)} repos need re-summarization ({len(active) - len(stale)} cached).")

    if stale:
        def work(entry):
            card, commits, issues, fp, _ = entry
            activity_block = build_activity_for_card(card, commits, issues)
            try:
                md = _summarize_one(card, activity_block, client, model)
            except Exception as e:
                log(f"  Failed {card.get('id', '?')}: {e}")
                prior = (card.get("_ghDigest") or {}).get("markdown")
                md = prior if prior else _placeholder(card)
                return card, fp, md, False
            return card, fp, md, True

        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = [pool.submit(work, e) for e in stale]
            done = 0
            for fut in as_completed(futures):
                card, fp, md, ok = fut.result()
                done += 1
                if ok:
                    card["_ghDigest"] = {
                        "markdown": md,
                        "fingerprint": fp,
                        "generated_at": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
                    }
                if done % 10 == 0:
                    log(f"  summarized {done}/{len(stale)}…")

    blocks = []
    for card, _commits, _issues, _fp, _needs in active:
        digest = card.get("_ghDigest") or {}
        md = digest.get("markdown") or _placeholder(card)
        blocks.append(md)

    stats = {
        "active": len(active),
        "refreshed": len(stale),
        "cached": len(active) - len(stale),
    }
    return blocks, stats


def assemble_markdown(blocks):
    return "\n\n".join(b.strip() for b in blocks if b and b.strip())
