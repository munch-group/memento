#!/usr/bin/env bash
# Launch memento as a standalone desktop app.
#
# memento is served at http://127.0.0.1:8765 by a launchd agent
# (~/Library/LaunchAgents/com.kmt.memento-serve.plist) so Chrome can run it as an installed
# PWA with its own Dock icon. This script is belt-and-braces: it starts the server if launchd
# isn't running it, then opens the installed "Memento" app — falling back to a plain chromeless
# window if the PWA hasn't been installed yet (install once: open the URL in Chrome, then use
# the omnibox install icon).
#
# The port is the app's storage origin (PAT, folder permission, caches): never change it.

URL="http://127.0.0.1:8765/memento.html"

if ! curl -s -o /dev/null --max-time 2 "$URL"; then
  nohup /usr/bin/python3 -m http.server 8765 --bind 127.0.0.1 --directory /Users/kmt/memento \
    >> "$HOME/Library/Logs/memento-serve.log" 2>&1 &
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    curl -s -o /dev/null --max-time 1 "$URL" && break
    sleep 0.2
  done
fi

open -a "Memento" 2>/dev/null || open -na "Google Chrome" --args --app="$URL"
