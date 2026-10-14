# Hidden Village walk prototype

This is a throwaway design and movement study on `codex/hidden-village-walk-prototype`. It tests one continuous camera path from a forest into a small village. The existing homepage is untouched.

Run `npm run prototype:walk`, then open `/prototype/hidden-village/index.html`. `npm run prototype:bundle` generates the ignored `scene.js` separately, and the production build runs it before Next.js so branch previews include the walk. Scroll, swipe, or use the arrow keys. The road signs can guide the camera farther along the same route.

## Journey and content direction

The path now starts inside the upper woods, opens onto a fenced ridge overlooking a lower valley and distant hillside settlement, crosses a wooden bridge over a dry ravine, descends to a sheltered workshop, passes a well and bench in the square, and ends at a lit house beside a postbox. A small geometric fox crosses the woods ahead during the approach; it has no dialogue, sound or interaction. Returning beyond the upper ridge rearms the encounter. Reduced-motion visitors see a still animal and no walking bob.

Scroll, swipe and arrow keys all steer the same smooth camera route. Signs and the keyboard-accessible Waypoints menu change the destination along that route, with the same speed limit and easing. Small continuous camera glances frame the valley, workshop and square. Route choices, house interiors and hill excursions are future work: waypoints currently select a stop, not a different path. Route coordinates, terrain and bridge placement share `trail.ts` so future junctions have a consistent world space.

The short captions are provisional pacing copy. The workshop's workbench and the square's well establish different places for selected creations/collaborations and experiments; they do not yet open populated project stories.

The existing live page is a freelance introduction, a chronological Notion-backed list of client work with dates and skill tags, an Asteroids game, and contact details. For a new version, retain contact and a small, chosen set of work. Give personal creations and experiments their own space. Remove the game and the resume-style chronology from the main journey. Signs should provide wayfinding. Use short, accessible HTML captions for orientation and a readable panel for longer project content when a visitor deliberately opens it. Speaking characters are not part of the current direction.

## Visual direction

The opening is framed from within a dark forest. Moss-covered boulders, fallen logs, pale birches, grass and fern clusters break up the spruce forest. The left bank rises while the right side falls away toward the village. Layered mountain silhouettes and warm windows give the valley depth. The bridge crosses a dry, rocky gully; no visible water needs to be simulated.

The scene uses one continuous Three.js world. The ground, buildings, signs and animal are geometry; spruce trees use the existing transparent cutout asset with short 3D trunks and branches. Their flatness remains a limitation at unusual angles. The fox is deliberately small and low polygon, not a realistic animated asset.

`references/first-overlook-concept.png` is the first concept that prompted the forest approach. `references/upper-forest-opening.png` explores a start farther uphill. Both are composition references, not screenshots or runtime assets. The environment pass uses their raised forest bank, lower valley, silhouette layering and warm wayfinding lights as composition cues.

The tree cutout was generated with the built-in image generation tool, then resized for the site. Final prompt:

> Use case: photorealistic-natural. Asset type: transparent foliage sprite for a real-time 3D forest website, viewed while walking. One mature northern European spruce tree, full height from roots to top, narrow irregular silhouette with layered drooping branches and fine dense needles. Straight trunk visible through foliage, asymmetric natural growth, some gaps between branch clusters. Front orthographic camera, tree centered and fully within frame. Dark blue-green needles, muted brown-gray bark, subtle moonlit edge light, believable photographic textures. Genuinely transparent background with clean antialiased alpha around every branch and needle. No ground, no sky, no scenery, no shadows outside the tree, no text, no watermark.

The small JPEG textures are from Poly Haven and are CC0: [forest floor](https://polyhaven.com/a/forest_leaves_04), [path](https://polyhaven.com/a/wood_chip_path), [bark](https://polyhaven.com/a/pine_tree_01), [plaster](https://polyhaven.com/a/plaster_stone_wall_02), and [roof](https://polyhaven.com/a/roof_planks). The site loads local optimized copies, not the asset API.

## Performance

Three.js already renders through WebGL on the GPU. This pass avoids postprocessing, shadows, physics, skeletal animation and extra runtime libraries. Static opaque scenery is merged by material in 24-metre regions so buildings and bridge details can be culled. Rocks, trees, ferns, logs and grass use instancing. Foliage uses alpha testing instead of transparent blending. There are only two real local point lights, selected from nearby lamps; distant windows and lantern halos are emissive.

Rendering is capped at 30 frames per second while walking or during the short fox encounter. It stops completely when those settle and pauses in hidden tabs. Texture arrival, resize and graphics-context restoration wake it again. Device pixel ratio is capped at 1 on narrow viewports and 1.25 on desktop; the renderer requests the low-power GPU. Canvas data attributes expose frame count, draw calls, triangles, camera position and progress for browser QA without an always-running overlay. Physical device heat and frame rate still need phone testing.

## Check and limitations

The bundle build and targeted TypeScript check pass. The repository-wide type check also passes in this checkout after regenerating `.next`; the handoff's generated layout/missing-page errors did not recur. The production build compiles and passes lint/types, but local page generation fails because this checkout has no Notion credentials for the existing `/work/[slug]` pages. The homepage source is untouched.

Chrome checks covered the complete route, waypoint navigation, arrow keys and emulated touch input at a 390 × 844 phone viewport. Caption/control rectangles fit without overlap. Browser console checks showed no errors or warnings. Visual screenshot QA was blocked by the locked host Mac; this limitation must be resolved before claiming visual approval. Project stories, alternate routes and realistic asset animation remain future work.
