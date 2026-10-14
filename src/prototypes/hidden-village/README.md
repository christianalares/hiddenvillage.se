# Hidden Village walk prototype

An editable Blender environment integrated into the existing continuous Three.js walk on `codex/hidden-village-walk-prototype`. The homepage is unchanged. The journey remains woods → ridge → dry-ravine bridge → workshop → square → final house and postbox.

## Run and build

```sh
npm install
npm run prototype:walk
```

Open `/prototype/hidden-village/index.html` on the local address printed by Next.js. Scroll, swipe and arrow keys steer the same camera; signs and the accessible Waypoints menu choose destinations along that route. There are no new branches, interiors or project pages. The crude fox has been removed pending a convincing rigged replacement. Narrow screens use slightly stronger continuous camera glances to keep the workbench, well and postbox in frame.

`npm run prototype:bundle` creates the intentionally ignored `public/prototype/hidden-village/scene.js`. The production build still bundles it before running Next.js. `npm run check:types` checks the repository.

## Editable source and export

Open [`blender/hidden-village.blend`](blender/hidden-village.blend) in Blender (authored and tested with Blender 5.2.2 LTS). It contains packed textures, named environment collections, six walking-camera guides, lighting guides and editable meshes. Repeated trees, rocks, roots and ferns share mesh data; make a single-user copy before changing just one instance. Houses are grouped under named parent empties. Camera/light guides remain in Blender; lamp-anchor empties carry the runtime light positions.

After editing and saving the source:

```sh
npm run prototype:assets
npm run prototype:bundle
```

The exporter uses the saved scene, preserving manual edits. Set `BLENDER_BIN` if Blender is not on PATH or at `/Applications/Blender.app/Contents/MacOS/Blender`. The first export needs network access to obtain pinned `@gltf-transform/cli@4.5.1` through npx. It exports to a temporary directory, then produces the optimized `public/prototype/hidden-village/assets/woodland.glb`. Commit the `.blend` and optimized assets together. Blender is not needed on Vercel.

To reconstruct the procedural starting scene, rather than export the edited source:

```sh
python3 src/prototypes/hidden-village/blender/fetch_assets.py
"/Applications/Blender.app/Contents/MacOS/Blender" --background --factory-startup --python-exit-code 1 --python src/prototypes/hidden-village/blender/build_scene.py
npm run prototype:assets
```

**Reconstruction overwrites the saved `.blend`.** Use a copy when exploring. `build_scene.py` owns terrain, woodland and bridge construction; `village.py` supplies the architecture. The saved `.blend` is the authoritative composition. Downloads go into ignored `blender/.cache`; `--cache` selects another location. Source checksums and URLs are in `blender/sources.json`, and the fetch script verifies each file. Sources and licenses are listed in [ATTRIBUTION.md](ATTRIBUTION.md).

Blender uses Z-up; helpers map Three.js coordinates `(x, y, z)` to `(x, -z, y)`. Camera height and the route are defined in `trail.ts`/`main.ts`. Terrain formulas in `build_scene.py` mirror `trail.ts`; update both when changing the landform. Avoid applying arbitrary terrain changes under the walking corridor without checking camera clearance.

## Visual treatment

Scanned mossy rocks, roots, stumps and ferns replace the obvious primitive scenery. Tapered, irregular trunks and curved intersecting foliage slices frame the opening. Terrain has denser sampling beside the path, small surface relief, a blended forest/path material with normal maps, and baked vertex shading for contact and canopy cover. The ridge reveals a raised settlement with a tower, layered mountain forms and height-dependent fog.

The bridge has beveled planks, braces, pegs and stone abutments. Houses have overlapping closed shingles, timber framing, recessed casements and shutters, chimneys, warm curtain/glass textures and grounded foundations. A covered workbench, masonry well, bench and postbox distinguish the existing stops. UVs on wooden members select individual boards so seams do not repeat across every beam.

Blender cameras and lights are authoring guides. The actual browser camera and lighting are the approval view: a cool hemisphere/directional light, warm practical lamps, emissive windows and small halos, without shadow maps or postprocessing. `references/upper-forest-opening.png` and `references/first-overlook-concept.png` remain ambition/composition references, not screenshots of the result.

## Runtime and performance

The compressed GLB is approximately 4.8 MB. It uses Meshopt geometry compression and WebP images up to 1K. Desktop viewports (900px and wider at load) fetch a separate 2K moss-rock map for the large foreground boulders; narrow viewports use the embedded 1K map. Ground color/normal textures are separate local assets. No external asset service is contacted during the walk.

At load, shared rocks, roots and foliage become instanced batches in 48-metre cells. Architecture, small repeated timbers and unique solids merge by cell and material, avoiding a draw call for every small repeated shape. Ferns/roots and rocks also have distance culling. Foliage uses alpha testing, and only the two nearest point lights illuminate geometry. The renderer requests the low-power GPU; DPR stays capped at 1 on phones and 1.25 on desktop. Movement is capped at 30 FPS, rendering stops at rest, and hidden tabs pause. Resize and graphics-context restoration wake rendering. Reduced motion disables camera bob.

Canvas data attributes expose frames, draw calls, triangles, camera position, progress and `renderMs`. The latter measures CPU render submission, **not GPU time or physical-device frame rate**. [QA captures and measurements](qa/) document this pass. Device temperature, battery use and actual phone GPU performance still require testing on physical hardware.

## Verification and remaining limits

Actual Chrome screenshots were inspected at desktop and 390 × 844 phone sizes throughout the full route. The review checked silhouettes, contact, intersections, repeated textures, light, framing and readable controls. The saved captures are browser renders, not Blender concept renders. The source was reopened and exported through the documented workflow; all file-based images were packed. Camera clearance against the actual terrain and bridge was checked along the route at 0.25-metre intervals (about 1.70–1.80 metres, allowing a small foot-sized sample across plank gaps).

The bundle and repository-wide type checks pass. Local production compilation, lint and type checking pass; collecting the existing `/work/[slug]` pages fails because this checkout lacks the homepage's Notion credentials. That is separate from the prototype, and no homepage fix is included.

The canopy remains a hybrid of geometry and alpha images; unusually close or oblique views reveal the slices. Some distant trees and repeating masonry remain stylized. Ground shadows are baked approximations, and the runtime has no dynamic cast shadows. This is a substantial environment pass, not a photorealistic replacement for the references. Alternate routes, interiors, populated project stories and animal animation remain future work.

## Retained generated tree asset

The existing `spruce-cutout.png` was generated in the earlier pass and reused here. Its original prompt:

> Use case: photorealistic-natural. Asset type: transparent foliage sprite for a real-time 3D forest website, viewed while walking. One mature northern European spruce tree, full height from roots to top, narrow irregular silhouette with layered drooping branches and fine dense needles. Straight trunk visible through foliage, asymmetric natural growth, some gaps between branch clusters. Front orthographic camera, tree centered and fully within frame. Dark blue-green needles, muted brown-gray bark, subtle moonlit edge light, believable photographic textures. Genuinely transparent background with clean antialiased alpha around every branch and needle. No ground, no sky, no scenery, no shadows outside the tree, no text, no watermark.
