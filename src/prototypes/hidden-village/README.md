# Hidden Village walk prototype

This is a throwaway design and movement study on `codex/hidden-village-walk-prototype`. It tests one continuous camera path from a forest into a small village. The existing homepage is untouched.

Run `npm run prototype:walk`, then open `/prototype/hidden-village/index.html`. Scroll, swipe, or use the arrow keys. The road signs can guide the camera farther along the same route.

## Journey and content direction

The current path starts on an upper forest ridge, descends continuously to a workshop, crosses a small village square, and ends at a lit house beside a postbox. The screen text changes at five places: ridge, forest, workshop, square, and last light. These short lines are provisional pacing copy, not finished site content. The places do not yet open project stories.

The existing live page is a freelance introduction, a chronological Notion-backed list of client work with dates and skill tags, an Asteroids game, and contact details. For a new version, retain contact and a small, chosen set of work. Give personal creations and experiments their own space. Remove the game and the resume-style chronology from the main journey. Signs should provide wayfinding. Use short, accessible HTML captions for orientation and a readable panel for longer project content when a visitor deliberately opens it. Speaking characters are not part of the current direction.

## Visual direction

The opening is framed from within a dark forest. A narrow dirt trail, close spruce silhouettes, moonlight, a warm lantern and distant windows reveal the village gradually. The scene uses one continuous Three.js world. The ground, buildings and signs are geometry; trees use a transparent cutout asset plus short 3D trunks and branches. Their flatness is a remaining limitation when viewed from unusual angles. No water was added because visible water would need convincing movement throughout the walk.

`references/first-overlook-concept.png` is the first concept that prompted the forest approach. `references/upper-forest-opening.png` explores a start farther uphill. Both are composition references, not screenshots or runtime assets. The live prototype still reads more like a forest corridor than the valley overlook in those images. The next visual pass needs a clearer change in terrain height and a stronger village silhouette before adding small details.

The tree cutout was generated with the built-in image generation tool, then resized for the site. Final prompt:

> Use case: photorealistic-natural. Asset type: transparent foliage sprite for a real-time 3D forest website, viewed while walking. One mature northern European spruce tree, full height from roots to top, narrow irregular silhouette with layered drooping branches and fine dense needles. Straight trunk visible through foliage, asymmetric natural growth, some gaps between branch clusters. Front orthographic camera, tree centered and fully within frame. Dark blue-green needles, muted brown-gray bark, subtle moonlit edge light, believable photographic textures. Genuinely transparent background with clean antialiased alpha around every branch and needle. No ground, no sky, no scenery, no shadows outside the tree, no text, no watermark.

The small JPEG textures are from Poly Haven and are CC0: [forest floor](https://polyhaven.com/a/forest_leaves_04), [path](https://polyhaven.com/a/wood_chip_path), [bark](https://polyhaven.com/a/pine_tree_01), [plaster](https://polyhaven.com/a/plaster_stone_wall_02), and [roof](https://polyhaven.com/a/roof_planks). The site loads local optimized copies, not the asset API.

## Check and limitations

The bundle build passes. Desktop Chrome checks covered the revised opening and all five stops. The page showed no browser errors. Earlier checks covered the sign click and a phone-sized viewport, but those should be repeated after further interaction work. The full repository type check currently fails in generated `.next/types` files for the existing layout and an absent prototype page. Frame rate on physical devices still needs direct testing. The cottages and tree cutouts are more designed than the first pass but are still a prototype, not a final level of realism.
