#!/usr/bin/env python3
"""Generate a morning digest from GitHub activity stored in knowledge-base JSON."""

import os
import sys
from datetime import datetime, timezone

import anthropic
import click

from kb_io import load_all, save_entry
from kb_digest_lib import refresh_digests, assemble_markdown


@click.command()
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.option("--days", type=int, default=None, help="Only include activity from the last N days")
@click.option("--model", default="claude-sonnet-4-20250514", help="Claude model to use")
def digest(kb_dir, days, model):
    """Generate a morning digest from GitHub activity in the knowledge base."""
    entries = load_all(kb_dir)
    gh_cards = [e for e in entries if e.get("type") == "github" and (e.get("_ghCommits") or e.get("_ghIssuesRecent"))]

    if not gh_cards:
        click.echo("No GitHub cards with activity data found. Run a GitHub sync in the web app first.")
        sys.exit(1)

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

    # Persist cards so _ghDigest cache is saved
    for card in gh_cards:
        save_entry(kb_dir, card)

    if not blocks:
        click.echo("No activity found" + (f" in the last {days} days" if days else "") + ".")
        sys.exit(0)

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
    digest()
