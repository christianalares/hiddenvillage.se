# Hidden Village walk prototype

An editable Blender environment integrated into the existing continuous Three.js walk on `codex/hidden-village-walk-prototype`. The homepage is unchanged. The expanded journey descends from a 38.5-metre high moor through a birch hollow, woodland, ridge and dry-ravine bridge into a larger village, ending at the lit house and postbox. Its forward extent is 272 metres. Measured along the terrain, the direct walk is 285 metres; taking both extended side routes makes it 514 metres. The ridge climbs to an observation shelter, and the western hollow descends to an open music cabin before returning to the village.

## Run and build

```sh
npm install
npm run prototype:walk
```

Open `/prototype/hidden-village/index.html` on the local address printed by Next.js. Normal document scrolling drives the camera: wheel/trackpad, momentum swipes, arrow keys, Page Up/Down, Home/End and the scrollbar retain native behavior between forks. Brief camera easing smooths wheel steps without capping travel speed. The Waypoints menu provides quick travel, stopping at any unanswered fork along the way.

At each fork the walk pauses beside a physical, Blender-authored fingerpost. Click or tap Heather ridge / Through the hollow or Reed pond / Village lane directly on its wooden arrows. Invisible HTML buttons follow the actual boards on screen, providing full-board tap targets, accessible names, keyboard activation and a visible focus outline. A screen reader announces the pause and choices. Selection guides the camera six metres into that route over 2.4 seconds, then restores native scrolling; accumulated scrolling is discarded. Reduced motion makes the departure immediate. Escape steps back from a decision; a waypoint behind the fork also lets you leave it. Return to a signpost, including through its waypoint, to choose again. Choices stay fixed inside each branch, and both paths rejoin. The previous choice cards are removed, and chapter captions recede while making a decision.

Four rigged deer idle and graze in distant, flat clearings. Five small authored birds circle above the woods. Narrow screens use stronger continuous camera glances to frame the physical notebooks. The music cabin is open to view; house interiors remain outside the walk.

`npm run prototype:bundle` creates the intentionally ignored `public/prototype/hidden-village/scene.js`. The production build still bundles it before running Next.js. `npm run check:types` checks the repository.

## Editable source and export

Open [`blender/hidden-village.blend`](blender/hidden-village.blend) in Blender (authored and tested with Blender 5.2.2 LTS). It contains packed textures, named environment collections, eight walking-camera guides, lighting guides and editable meshes. Repeated trees, rocks, roots and ferns share mesh data; make a single-user copy before changing just one instance. Houses are grouped under named parent empties. Camera/light guides remain in Blender; lamp-anchor empties carry runtime light positions and deer-anchor empties carry wildlife position, facing and scale. `blender/deer.blend` contains the editable rig and its three retained idle/grazing clips.

`blender/signpost.blend` is the separate reusable fingerpost: beveled arrow boards, oak post, iron fixings and a permanently emissive lantern. Its five meshes share structural materials and are reused at both forks. The runtime supplies painted route labels and positions it beside the authored terrain. `blender/build_signpost.py` reconstructs only that asset, without touching the landscape; export the saved source to preserve manual edits.

After editing and saving the source:

```sh
npm run prototype:assets
npm run prototype:bundle
```

The exporter uses the saved scenes, preserving manual edits. Set `BLENDER_BIN` if Blender is not on PATH or at `/Applications/Blender.app/Contents/MacOS/Blender`. The first export needs network access to obtain pinned `@gltf-transform/cli@4.5.1` through npx. It exports to a temporary directory, then produces the optimized `public/prototype/hidden-village/assets/woodland.glb` and exports the saved deer and fingerpost sources to `assets/deer.glb` and `assets/signpost.glb`. Commit the `.blend` and optimized assets together. Blender is not needed on Vercel.

To reconstruct the procedural starting scene, rather than export the edited source:

```sh
python3 src/prototypes/hidden-village/blender/fetch_assets.py
"/Applications/Blender.app/Contents/MacOS/Blender" --background --factory-startup --python-exit-code 1 --python src/prototypes/hidden-village/blender/build_scene.py
"/Applications/Blender.app/Contents/MacOS/Blender" --background --factory-startup --python-exit-code 1 --python src/prototypes/hidden-village/blender/prepare_deer.py
npm run prototype:assets
```

**Reconstruction overwrites the saved `.blend`.** Use a copy when exploring. `build_scene.py` owns terrain, woodland and bridge construction; `village.py` supplies the architecture, `expansion.py` supplies moor, birch, pond and garden details, and `landscape.py` contains shared terrain/branch equations. The saved `.blend` is the authoritative composition. Downloads go into ignored `blender/.cache`; `--cache` selects another location. Source checksums and URLs are in `blender/sources.json`, and the fetch script verifies each file. Sources and licenses are listed in [ATTRIBUTION.md](ATTRIBUTION.md).

Blender uses Z-up; helpers map Three.js coordinates `(x, y, z)` to `(x, -z, y)`. Camera height and the route are defined in `trail.ts`/`main.ts`. Terrain formulas in `blender/landscape.py` mirror `trail.ts`; update both when changing the landform. Avoid applying arbitrary terrain changes under the walking corridor without checking camera clearance.

## Visual treatment

Scanned mossy rocks, roots, stumps and ferns replace the obvious primitive scenery. Tapered, irregular trunks and curved intersecting foliage slices frame the opening. Terrain has denser sampling beside the path, small surface relief, a blended forest/path material with normal maps, and baked vertex shading for contact and canopy cover. The ridge reveals a raised settlement with a tower, layered mountain forms and height-dependent fog.

The bridge has beveled planks, braces, pegs and stone abutments. Houses have overlapping closed shingles, timber framing, recessed casements and shutters, chimneys, warm curtain/glass textures and grounded foundations. A covered workbench, masonry well, bench and postbox distinguish the existing stops. UVs on wooden members select individual boards so seams do not repeat across every beam. The expansion adds sparse heather and boundary stones above the forest, pale birches, a reed pond with a moored skiff and jetty, gate remnants, five additional nearby cottages, garden walls, herb beds and wood stacks. Terrain vertex blue stores baked lantern pools, so ground illumination and emissive panes stay lit from afar.

Blender cameras and lights are authoring guides. The actual browser camera and lighting are the approval view: a cool hemisphere/directional light, warm practical lamps, emissive windows and small halos, without shadow maps or postprocessing. `references/upper-forest-opening.png` and `references/first-overlook-concept.png` remain ambition/composition references, not screenshots of the result.

## Runtime and performance

The woodland GLB is approximately 7.9 MB (decimal), compressed for web delivery; the separate deer GLB is approximately 403 KB. It uses Meshopt geometry compression and WebP images up to 1K. Desktop viewports (900px and wider at load) fetch a separate 2K moss-rock map for the large foreground boulders; narrow viewports use the embedded 1K map. Ground color/normal textures are separate local assets. No external asset service is contacted during the walk.

At load, shared rocks, roots and foliage become instanced batches in 48-metre cells. Cell assignment uses transformed geometry bounds, including meshes authored with absolute vertex coordinates. Architecture, small repeated timbers and unique solids merge by cell and material, avoiding a draw call for every small repeated shape. Ferns/roots, rocks and tree materials also have distance culling, with a shorter tree range on phones. The camera far plane is 150 metres. Foliage uses alpha testing, and only the two nearest point lights illuminate geometry. The renderer requests the low-power GPU; DPR stays capped at 1 on phones and 1.25 on desktop. Rendering is capped at 30 FPS during travel and at 10 FPS for idle atmosphere (actual scheduling can be lower). Wind runs in the vegetation vertex shaders; 150 small drifting leaves use one draw call. Deer animate only within 85 metres. Twenty-four drifting mist ribbons use one instanced draw. The ridge weather vane turns, cabin linen moves from its pinned edge, and birds flap and circle. Motion uses the same paused weather clock. Reading a notebook suspends rendering. Pause atmosphere stops wind/wildlife and stops rendering at rest. Hidden tabs pause. Reduced-motion preference starts with atmosphere paused and disables camera bob; visitors can explicitly resume it. Resize and graphics-context restoration wake rendering. No shadow maps, reflection passes or postprocessing were added.

Canvas data attributes expose frames, draw calls, triangles, camera position, progress and `renderMs`. The latter measures CPU render submission, **not GPU time or physical-device frame rate**. [QA captures and measurements](qa/) document this pass. Device temperature, battery use and actual phone GPU performance still require testing on physical hardware.

The reusable fingerpost adds a 236 KB local GLB, five draw calls per visible post and no new dynamic lights or animation loop. `data-journey` reports `walking`, `choice:ridge` / `choice:pond`, or `following:ridge` / `following:pond`. Gates and six-metre departures are handled by `journey.ts`. `route-distance.ts` maps document scrolling to sampled three-dimensional travel distance so a wider detour takes proportionally more scrolling. Pixel rounding near decision waypoints snaps to the exact gate. Ordinary scroll speed is still native.

## Verification and remaining limits

Ten focused state tests cover skipped gates, discarded input, both departures, revisiting, route continuity, distance round trips, longer detours and browser pixel rounding:

```sh
npx esbuild src/prototypes/hidden-village/journey.test.ts --bundle --platform=node --format=cjs --outfile=/tmp/hidden-village-journey.test.cjs
node --test /tmp/hidden-village-journey.test.cjs
```

`qa/discoveries-clearance.json` checks 2,180 camera positions at half-metre Z intervals across all four route combinations against the actual saved Blender terrain and bridge. Ground clearance is 1.65–1.79 metres, including a foot-sized sample across bridge plank gaps. The 0.28-metre chest/head sweep has no solid scenery contacts. Transparent foliage cards are excluded from the solid collision sweep. All file-based source images are packed. Earlier `expansion-*` and `signposts-*` reports describe their respective earlier snapshots; `discoveries-*` captures and report describe this pass.

Actual Chrome views at 1440 × 900 and 390 × 844 were inspected for the opening, forks, ridge, bridge, workshop, music cabin and last light. Native emulated touch swipes and sign taps, keyboard selection, backtracking, reduced motion, page reading, persisted marks and the final letter were exercised. The paused frame counter stayed at 1325 over 1.2 seconds. See `qa/discoveries-interaction.json` for measured limits and sampled rendering counts. These are browser/device-size checks, not a physical-phone performance claim.

The bundle and repository-wide type checks pass. Local production compilation, lint and type checking pass; collecting the existing `/work/[slug]` pages fails because this checkout lacks the homepage's Notion credentials. That is separate from the prototype, and no homepage fix is included.

The canopy remains a hybrid of geometry and alpha images; unusually close or oblique views reveal the slices. Some distant trees and repeating masonry remain stylized. Ground shadows are baked approximations, and the runtime has no dynamic cast shadows. This is a substantial environment pass, not a photorealistic replacement for the references. Enclosed house interiors remain future work. There are deliberately no project case studies or technology lists in this personal story. The deer are stylized and deliberately distant; no walking locomotion is used. Baked lamp pools do not react to moving objects. Pond ripples are a small normal perturbation, without reflections. Idle wind adds bounded ongoing work compared with the previous fully still resting scene; Pause atmosphere restores that resting behavior.

## Personal story and optional discovery

The world introduces Christian through the things he enjoys making. The approved copy is in `stories.ts`: building useful personal software, caring about how things feel, curiosity about AI, drumming and former music production, padel, and life with family in Stockholm. It omits freelance positioning, named projects, skill lists and private family details. About Christian provides the complete accessible introduction without requiring travel or a game.

| Place | Physical discovery | Personal thread |
| --- | --- | --- |
| Entrance on the moor | Open notebook and a note for the visitor | Christian’s little corner of the internet; invitation to explore |
| Workshop | Notebook, cable spools and pinned sketch | “I wish this existed”; usefulness and attention to small details |
| Heather ridge | Observation shelter, telescope, weather vane and field notes | Curiosity, AI and connecting ideas |
| Western hollow | Open cabin, drum kit, records, amp and notebook | Drumming, music production and padel |
| Last light | Postcard, padel racket and folded letter | Stockholm, family in broad terms, make yourself at home |

The workshop, ridge and music pages each give a compass mark. Field notes retain the three IDs in local storage on this origin, with no network transmission. All three unlock an optional letter at the final postcard. Nothing is timed, core biography/contact is never locked behind collecting, and the visitor can leave every discovery unopened. Native dialogs provide keyboard focus containment and Escape to close. Returning from a page preserves the current walking position. A book’s touch target follows its world anchor rather than appearing at a predetermined screen corner.

## Extending the saved scene

`blender/hidden-village.blend` is authoritative. Export it normally to preserve all visual refinements. The one-time construction history is also retained: `build_discoveries.py` expands a backed-up pre-discovery scene, `add_birds.py` adds shared bird meshes, `refine_discoveries.py` clears measured obstructions, `finish_discoveries.py` adds details, `place_home_note.py` frames the final discovery, and `final_composition.py` moves the ridge lamp and rebakes light pools. These scripts are construction records, not an idempotent alternative to exporting the saved scene. Run them on a copy in that order when reconstructing the pass, starting from the ignored `.cache/pre-discoveries.blend` backup.

New scene collections contain the western trails, lamps, discoveries and birds. Empty extras `discovery`, `lamp`, `animal` and `motion` survive export. Moving hierarchies are excluded from static batching. Physical title plaques and the workshop poster get small runtime canvas textures; notebook prose remains accessible HTML. The extended terrain reuses the same scanned materials and keeps the original contact shading around the main route.

## Retained generated tree asset

The existing `spruce-cutout.png` was generated in the earlier pass and reused here. Its original prompt:

> Use case: photorealistic-natural. Asset type: transparent foliage sprite for a real-time 3D forest website, viewed while walking. One mature northern European spruce tree, full height from roots to top, narrow irregular silhouette with layered drooping branches and fine dense needles. Straight trunk visible through foliage, asymmetric natural growth, some gaps between branch clusters. Front orthographic camera, tree centered and fully within frame. Dark blue-green needles, muted brown-gray bark, subtle moonlit edge light, believable photographic textures. Genuinely transparent background with clean antialiased alpha around every branch and needle. No ground, no sky, no scenery, no shadows outside the tree, no text, no watermark.
