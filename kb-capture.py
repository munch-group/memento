#!/usr/bin/env python3
# @raycast.schemaVersion 1
# @raycast.title KB Quick Capture
# @raycast.mode compact
# @raycast.icon 🧠
# @raycast.packageName Knowledge Base
# @raycast.shortcut ⌥⌘K

import json, os, subprocess, random, string, time
from datetime import datetime, timezone

KB_FILE = os.path.expanduser("~/knowledge-base/knowledge-base.json")
TYPES = ["fact", "idea", "hypothesis", "quote", "observation", "connection", "reference", "people"]

JXA_CONTENT_DIALOG = """\
ObjC.import("Cocoa");
var app = $.NSApplication.sharedApplication;
app.setActivationPolicy($.NSApplicationActivationPolicyAccessory);

var W = 420, pad = 12, btnH = 28, btnW = 80, gap = 8, textH = 100;
var totalH = pad + textH + gap + btnH + pad;

var mask = $.NSTitledWindowMask | $.NSClosableWindowMask;
var panel = $.NSPanel.alloc.initWithContentRectStyleMaskBackingDefer(
    $.NSMakeRect(0, 0, W, totalH), mask, $.NSBackingStoreBuffered, false
);
panel.title = $("Quick Capture");
panel.level = $.NSFloatingWindowLevel;
panel.center;
var cv = panel.contentView;

var scroll = $.NSScrollView.alloc.initWithFrame(
    $.NSMakeRect(pad, pad + btnH + gap, W - pad * 2, textH)
);
scroll.hasVerticalScroller = true;
scroll.autohidesScrollers = true;
scroll.borderType = $.NSBezelBorder;

var tvW = W - pad * 2 - 4;
var tv = $.NSTextView.alloc.initWithFrame($.NSMakeRect(0, 0, tvW, textH));
tv.minSize = $.NSMakeSize(0, textH);
tv.maxSize = $.NSMakeSize(1e7, 1e7);
tv.verticallyResizable = true;
tv.horizontallyResizable = false;
tv.autoresizingMask = $.NSViewWidthSizable;
tv.textContainer.containerSize = $.NSMakeSize(tvW, 1e7);
tv.textContainer.widthTracksTextView = true;
tv.font = $.NSFont.systemFontOfSize(13);
tv.richText = false;
scroll.documentView = tv;
cv.addSubview(scroll);

var saved = {v: false};

var saveBtn = $.NSButton.alloc.initWithFrame(
    $.NSMakeRect(W - pad - btnW, pad, btnW, btnH)
);
saveBtn.title = $("Save");
saveBtn.bezelStyle = $.NSBezelStyleRounded;
saveBtn.keyEquivalent = $("\\r");
cv.addSubview(saveBtn);

var cancelBtn = $.NSButton.alloc.initWithFrame(
    $.NSMakeRect(W - pad - btnW - gap - btnW, pad, btnW, btnH)
);
cancelBtn.title = $("Cancel");
cancelBtn.bezelStyle = $.NSBezelStyleRounded;
cancelBtn.keyEquivalent = $("\\x1b");
cv.addSubview(cancelBtn);

ObjC.registerSubclass({
    name: "BtnHandler",
    methods: {
        "save:": { types: ["void", ["id"]], implementation: function(_) { saved.v = true; app.stopModal; } },
        "cancel:": { types: ["void", ["id"]], implementation: function(_) { saved.v = false; app.stopModal; } }
    }
});
var handler = $.BtnHandler.alloc.init;
saveBtn.target = handler;
saveBtn.action = "save:";
cancelBtn.target = handler;
cancelBtn.action = "cancel:";

app.activateIgnoringOtherApps(true);
panel.makeKeyAndOrderFront(null);
panel.makeFirstResponder(tv);
app.runModalForWindow(panel);
panel.close;

if (saved.v) { tv.string.js; } else { ""; }
"""


def gen_id():
    ts = hex(int(datetime.now().timestamp()))[2:]
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return ts + rand



def run_applescript(script):
    r = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    return r.returncode, r.stdout.strip()


def ask_content():
    jxa_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".kb-capture.js")
    with open(jxa_file, "w") as f:
        f.write(JXA_CONTENT_DIALOG)
    r = subprocess.run(
        ["osascript", "-l", "JavaScript", jxa_file],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        return None
    text = r.stdout.strip()
    return text if text else None


def ask_meta(preview):
    safe_preview = preview[:50].replace("\\", "\\\\").replace('"', '\\"')
    type_list = '{"' + '", "'.join(TYPES) + '"}'
    code, out = run_applescript(f'''
        set theType to choose from list {type_list} ¬
            with title "Knowledge Base" ¬
            with prompt "Type — \\"{safe_preview}…\\"" ¬
            default items {{"fact"}} without multiple selections allowed and empty selection allowed
        if theType is false then error "cancelled"
        return item 1 of theType
    ''')
    if code != 0:
        return None, None, None
    entry_type = out.strip()

    code2, out2 = run_applescript(f'''
        set dlg to display dialog "Tags (comma-separated)   |   Source (separate with | )" ¬
            default answer "" ¬
            with title "Knowledge Base" ¬
            buttons {{"Skip", "Save"}} default button "Save"
        return text returned of dlg
    ''')
    tags, source = [], ""
    if code2 == 0 and out2:
        parts = out2.split("|", 1)
        tags = [t.strip() for t in parts[0].split(",") if t.strip()]
        source = parts[1].strip() if len(parts) > 1 else ""

    return entry_type, tags, source


def load_items():
    if os.path.exists(KB_FILE):
        with open(KB_FILE, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []


def save_items(items):
    os.makedirs(os.path.dirname(os.path.abspath(KB_FILE)), exist_ok=True)
    with open(KB_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)


def main():
    content = ask_content()
    if not content:
        print("Cancelled.")
        return

    entry_type, tags, source = ask_meta(content)
    if entry_type is None:
        print("Cancelled.")
        return

    item = {
        "id": gen_id(),
        "type": entry_type,
        "content": content,
        "title": "",
        "tags": tags,
        "source": source,
        "date": datetime.now(timezone.utc).isoformat(),
        "synced": False,
        "external": True,
    }

    items = load_items()
    items.append(item)
    save_items(items)

    tag_str = f" [{', '.join(tags)}]" if tags else ""
    print(f"Saved {entry_type}{tag_str}: {content[:60]}{'…' if len(content) > 60 else ''}")


if __name__ == "__main__":
    main()