#!/usr/bin/env python3
"""Sync GitHub activity and generate a morning digest for the knowledge base."""

import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

import anthropic
import click
import urllib.request

from kb_io import load_all, save_entry
from kb_digest_lib import refresh_digests, assemble_markdown


def gh_get(url, token):
    """Make a GitHub API GET request."""
    req = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except Exception:
        return None


def sync_card(card, token):
    """Fetch commits and issues for a single GitHub card. Returns updated card fields."""
    fn = card["_ghFullName"]
    commits_raw = gh_get(f"https://api.github.com/repos/{fn}/commits?per_page=10", token) or []
    issues_raw = gh_get(f"https://api.github.com/repos/{fn}/issues?state=all&sort=updated&direction=desc&per_page=10", token) or []
    latest_raw = gh_get(f"https://api.github.com/repos/{fn}/issues?state=open&per_page=1&sort=created&direction=desc", token) or []

    gh_commits = [
        {"sha": c["sha"][:7], "msg": c["commit"]["message"].split("\n")[0], "date": c["commit"]["author"]["date"]}
        for c in commits_raw if isinstance(c, dict) and "sha" in c
    ]
    issues_no_prs = [i for i in issues_raw if isinstance(i, dict) and not i.get("pull_request")]
    gh_issues = [
        {
            "number": i["number"], "title": i["title"], "state": i["state"],
            "date": i["updated_at"],
            "labels": [l["name"] for l in (i.get("labels") or [])],
            "url": i["html_url"],
        }
        for i in issues_no_prs
    ]
    latest_real = [i for i in latest_raw if isinstance(i, dict) and not i.get("pull_request")]
    latest_issue_date = latest_real[0]["created_at"] if latest_real else None

    return card["id"], gh_commits, gh_issues, latest_issue_date


@click.command()
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.option("--days", type=int, default=None, help="Only include activity from the last N days")
@click.option("--model", default="claude-sonnet-4-20250514", help="Claude model to use")
@click.option("--sync-only", is_flag=True, help="Only sync GitHub data, skip digest generation")
def main(kb_dir, days, model, sync_only):
    """Sync GitHub activity and generate a morning digest."""
    gh_token = os.environ.get("GITHUB_TOKEN")
    if not gh_token:
        click.echo("Error: GITHUB_TOKEN environment variable not set.", err=True)
        sys.exit(1)

    entries = load_all(kb_dir)
    gh_cards = [e for e in entries if e.get("type") == "github" and e.get("_ghFullName")]

    if not gh_cards:
        click.echo("No GitHub cards found in JSON. Run a GitHub sync in the web app first to create them.")
        sys.exit(1)

    # Step 1: Sync GitHub activity
    click.echo(f"Syncing {len(gh_cards)} repos…", err=True)
    card_map = {c["id"]: c for c in gh_cards}
    mtime_updated = 0

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(sync_card, card, gh_token): card["id"] for card in gh_cards}
        done = 0
        for future in as_completed(futures):
            done += 1
            try:
                card_id, commits, issues, latest_date = future.result()
                card = card_map[card_id]
                card["_ghCommits"] = commits
                card["_ghIssuesRecent"] = issues
                if latest_date and latest_date > (card.get("date") or ""):
                    card["date"] = latest_date
                    mtime_updated += 1
            except Exception as e:
                click.echo(f"  Failed {futures[future]}: {e}", err=True)
            if done % 20 == 0:
                click.echo(f"  {done}/{len(gh_cards)}…", err=True)

    click.echo(f"Synced {len(gh_cards)} repos ({mtime_updated} dates updated from issues)", err=True)

    if sync_only:
        for card in gh_cards:
            save_entry(kb_dir, card)
        return

    # Step 2: Refresh per-repo digests (only for repos whose fingerprint changed)
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        click.echo("Error: ANTHROPIC_API_KEY environment variable not set.", err=True)
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    click.echo("Refreshing per-repo digests…", err=True)

    blocks, stats = refresh_digests(
        gh_cards, client, model, days=days,
        log=lambda msg: click.echo(msg, err=True),
    )

    # Persist all cards (captures both sync updates and _ghDigest cache updates)
    for card in gh_cards:
        save_entry(kb_dir, card)

    if not blocks:
        click.echo("No activity found" + (f" in the last {days} days" if days else "") + ".")
        return

    markdown = assemble_markdown(blocks)
    click.echo(markdown)

    # Save _digest entry
    digest_entry = {
        "id": "_digest",
        "type": "_digest",
        "date": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
        "markdown": markdown,
    }
    save_entry(kb_dir, digest_entry)
    click.echo(
        f"\nDigest saved to {kb_dir}/entries/_digest.* "
        f"({stats['refreshed']} regenerated, {stats['cached']} cached)",
        err=True,
    )


if __name__ == "__main__":
    main()
