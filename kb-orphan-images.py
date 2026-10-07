#!/usr/bin/env python3
"""
kb-orphan-images.py -- list images in knowledge-base/images/ that no card references.

Lists only by default; pass --delete to remove them. A card references an image when
`images/<name>` appears anywhere in its entries/<id>.md or entries/<id>.json.

    python kb-orphan-images.py knowledge-base/            # list orphans
    python kb-orphan-images.py knowledge-base/ --delete   # list and delete them
"""

import os

import click

from kb_io import find_orphan_images


@click.command()
@click.argument("kb_dir", type=click.Path(exists=True, file_okay=False))
@click.option("--delete", is_flag=True, help="Delete the orphaned images.")
def main(kb_dir, delete):
    if not os.path.isdir(os.path.join(kb_dir, "images")):
        click.echo("No images/ subfolder found.")
        return
    orphaned, kept = find_orphan_images(kb_dir)
    if not orphaned:
        click.echo(f"No orphaned images. All {kept} images are referenced.")
        return
    for name in orphaned:
        if delete:
            os.remove(os.path.join(kb_dir, "images", name))
        click.echo(f"  {'deleted' if delete else 'orphan'}: images/{name}")
    verb = "Deleted" if delete else "Found"
    click.echo(f"\n{verb} {len(orphaned)} orphaned images ({kept} referenced).")
    if not delete:
        click.echo("Run again with --delete to remove them.")


if __name__ == "__main__":
    main()
