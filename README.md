# 可及 · Reach — series website

Landing page for the 可及 (Reach) family of agent-ready apps. The first app is [可及清单 / Reach List](https://github.com/TonyWu2333/reachlist).

Plain static files, no build step:

| File | What |
|---|---|
| `index.html` | All content: hero, story, product family, agent setup, Reach List, changelog |
| `style.css` | Tokens follow `reachlist/docs/DESIGN.md` (light + dark) |
| `main.js` | Draws the hero tentacles, scroll reveals, plays the agent chat demo |
| `assets/` | Octopus favicon, Reach List icon and screenshots (resized from the reachlist repo) |

Preview locally: `python3 -m http.server 4321`. Deploy: any static host (GitHub Pages works as-is).

To add a changelog entry, copy an `<li>` at the top of `<ol class="log">` in `index.html`.
