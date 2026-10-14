# Hidden Village walk prototype

Question: Can scrolling feel like one continuous walk through a small 3D world, with a sign that starts a guided walk instead of jumping to a new scene?

Run `npm run prototype:walk`, then open `/prototype/hidden-village/index.html` on the local server. Scroll, swipe, or use the arrow keys. Click either signboard to continue along the same path.

This prototype is intentionally separate from the existing homepage. It uses simple geometry and materials to test camera pacing, path continuity, and the sign interaction. It is not a final art direction or a production implementation.

Observed in desktop Chrome: large scroll events no longer queue the full route; the camera follows one continuous curve at a capped speed; a sign click moves the camera along that curve; the end view stays in the village approach. The isolated page had no browser errors during this check. Phone-sized rendering and frame rate across devices still need hands-on verification.
