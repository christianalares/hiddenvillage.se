# Hidden Village walk prototype

This is a throwaway design and movement study on `codex/hidden-village-walk-prototype`. It tests one continuous camera path from a forest into a small village. The existing homepage is untouched.

Run `npm run prototype:walk`, then open `/prototype/hidden-village/index.html`. Scroll, swipe, or use the arrow keys. The road signs can guide the camera farther along the same route.

## Visual direction

The opening is framed from within a dark forest. A narrow dirt trail, close spruce silhouettes, moonlight, a warm lantern and distant windows reveal the village gradually. The scene uses one continuous Three.js world. The ground, buildings and signs are geometry; trees use a transparent cutout asset plus short 3D trunks and branches. Their flatness is a remaining limitation when viewed from unusual angles. No water was added because visible water would need convincing movement throughout the walk.

The tree cutout was generated with the built-in image generation tool, then resized for the site. Final prompt:

> Use case: photorealistic-natural. Asset type: transparent foliage sprite for a real-time 3D forest website, viewed while walking. One mature northern European spruce tree, full height from roots to top, narrow irregular silhouette with layered drooping branches and fine dense needles. Straight trunk visible through foliage, asymmetric natural growth, some gaps between branch clusters. Front orthographic camera, tree centered and fully within frame. Dark blue-green needles, muted brown-gray bark, subtle moonlit edge light, believable photographic textures. Genuinely transparent background with clean antialiased alpha around every branch and needle. No ground, no sky, no scenery, no shadows outside the tree, no text, no watermark.

The small JPEG textures are from Poly Haven and are CC0: [forest floor](https://polyhaven.com/a/forest_leaves_04), [path](https://polyhaven.com/a/wood_chip_path), [bark](https://polyhaven.com/a/pine_tree_01), [plaster](https://polyhaven.com/a/plaster_stone_wall_02), and [roof](https://polyhaven.com/a/roof_planks). The site loads local optimized copies, not the asset API.

## Check and limitations

Targeted TypeScript and the bundle build pass. Desktop Chrome checks covered the opening, approach, sign click, and village arrival. The sign moves the target along the same camera curve, with a capped maximum speed. The page showed no browser errors in those checks. A phone-sized Chrome viewport also showed a composed opening and readable controls. Frame rate on physical devices still needs direct testing. The cottages and tree cutouts are more designed than the first pass but are still a prototype, not a final level of realism.
