"""Tests for kb-orphan-images.py / kb_io.find_orphan_images.

Builds a throwaway knowledge base and checks which images count as referenced:
markdown and HTML refs in .md bodies, refs in any .json field, URL-encoded names,
dotfiles ignored; and that only --delete removes files.

Run: pixi run python tests/orphan_images_test.py
"""

import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from kb_io import find_orphan_images  # noqa: E402

PASS = FAIL = 0


def eq(actual, expected, msg):
    global PASS, FAIL
    if actual == expected:
        PASS += 1
        print(f"  ✓ {msg}")
    else:
        FAIL += 1
        print(f"  ✗ {msg}\n      expected {expected!r}\n      actual   {actual!r}")


def make_kb(d):
    os.makedirs(os.path.join(d, "entries"))
    os.makedirs(os.path.join(d, "images"))
    for n in ["md.png", "html.png", "titled.png", "json.png", "a b.png", "orphan.png",
              "orphan2.jpg", ".DS_Store"]:
        open(os.path.join(d, "images", n), "wb").close()
    with open(os.path.join(d, "entries", "e1.md"), "w") as f:
        f.write('text ![x](images/md.png)\n<img src="images/html.png" width=200>\n'
                '![t](images/titled.png "a title")\n![s](images/a%20b.png)\n')
    with open(os.path.join(d, "entries", "e1.json"), "w") as f:
        json.dump({"id": "e1", "source": "see images/json.png"}, f)


def run(d, *args):
    return subprocess.run([sys.executable, os.path.join(ROOT, "kb-orphan-images.py"), d, *args],
                          capture_output=True, text=True, check=True).stdout


print("find_orphan_images")
with tempfile.TemporaryDirectory() as d:
    make_kb(d)
    orphaned, kept = find_orphan_images(d)
    eq(orphaned, ["orphan.png", "orphan2.jpg"], "only unreferenced images are orphans")
    eq(kept, 5, "md, html, titled, json-field and url-encoded refs all count")

with tempfile.TemporaryDirectory() as d:
    eq(find_orphan_images(d), ([], 0), "missing images/ folder -> nothing")

print("kb-orphan-images.py")
with tempfile.TemporaryDirectory() as d:
    make_kb(d)
    out = run(d)
    eq("orphan: images/orphan.png" in out, True, "lists orphans")
    eq(os.path.exists(os.path.join(d, "images", "orphan.png")), True, "no --delete -> file kept")
    out = run(d, "--delete")
    eq("deleted: images/orphan2.jpg" in out, True, "--delete reports deletions")
    eq(sorted(os.listdir(os.path.join(d, "images"))),
       [".DS_Store", "a b.png", "html.png", "json.png", "md.png", "titled.png"],
       "--delete removes orphans only")
    eq("No orphaned images" in run(d), True, "second run finds nothing")

print(f"\n{PASS} passed, {FAIL} failed")
sys.exit(1 if FAIL else 0)
