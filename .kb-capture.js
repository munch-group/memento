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
saveBtn.keyEquivalent = $("\r");
cv.addSubview(saveBtn);

var cancelBtn = $.NSButton.alloc.initWithFrame(
    $.NSMakeRect(W - pad - btnW - gap - btnW, pad, btnW, btnH)
);
cancelBtn.title = $("Cancel");
cancelBtn.bezelStyle = $.NSBezelStyleRounded;
cancelBtn.keyEquivalent = $("\x1b");
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
