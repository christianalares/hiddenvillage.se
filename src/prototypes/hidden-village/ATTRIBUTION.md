# Asset attribution

The woodland models and photographic textures below are free [Poly Haven CC0 assets](https://polyhaven.com/license). Local, optimized copies are served by the website; it makes no requests to Poly Haven at runtime. No paid assets were used.

| Source | Author | Use and preparation |
| --- | --- | --- |
| [Rock Moss Set 01](https://polyhaven.com/a/rock_moss_set_01) | Kless Gyzen | Six scanned rock shapes; reduced in Blender to about 650 triangles each, shared throughout the scene, seated into slopes. |
| [Fern 02](https://polyhaven.com/a/fern_02) | Rob Tuytel, Rico Cilliers | Four fern shapes; reduced to about 320 triangles each. The separate source alpha mask was restored to the diffuse texture. |
| [Pine Roots](https://polyhaven.com/a/pine_roots) | Rob Tuytel | Two root scans, reduced to about 1,000 triangles each and fitted to the ground slope. |
| [Tree Stump 01](https://polyhaven.com/a/tree_stump_01) | Rob Tuytel | Weathered stump, reduced to about 1,800 triangles. |
| [Forest Leaves 04](https://polyhaven.com/a/forest_leaves_04) | Poly Haven | Existing forest-floor color map and a new 1K normal map. |
| [Wood Chip Path](https://polyhaven.com/a/wood_chip_path) | Poly Haven | Existing path color map and a new 1K normal map, blended into the forest floor. |
| [Pine Tree 01](https://polyhaven.com/a/pine_tree_01) | Rob Tuytel, Rico Cilliers | Existing bark texture only; the full tree model is not included. |
| [Plaster Stone Wall 02](https://polyhaven.com/a/plaster_stone_wall_02) | Poly Haven | Existing masonry texture, remapped onto the houses, foundations and well. |
| [Roof Planks](https://polyhaven.com/a/roof_planks) | Poly Haven | Existing oak texture; UVs select individual boards so grain follows timbers instead of repeating plank seams across them. |

Terrain, trunk meshes, curved canopy construction, architecture, bridge, fence, lanterns, well, bench, workshop details and postbox were authored for this prototype in Blender. The interior glass atlas was authored for this pass.

`spruce-cutout.png` is the generated image retained from the earlier prototype. It supplies distant tree silhouettes and the curved, intersecting canopy slices of the near canopy. It is not a photographic scan or a newly generated asset. The original generation prompt is retained in the README.

`blender/sources.json` pins the new downloads and their source MD5 checksums. `fetch_assets.py` verifies them before use. The GLB uses Meshopt geometry compression and WebP textures capped at 1,024 pixels on their longest side. Desktop viewports additionally load a 2K rock color map; narrow viewports retain the embedded 1K version. The editable `.blend` packs the textures it uses.

## Wildlife and expanded landscape

[Deer by Quaternius](https://poly.pizza/m/T6Cs7tmMHJ), from the [Ultimate Animated Animal Pack](https://quaternius.com/packs/ultimateanimatedanimals.html), is CC0. The approximately 1,940-triangle rigged model was prepared in Blender at natural scale, grounded, and reduced to the Idle, Idle_2 and Eating animation clips. Two instances use idle/grazing clips in flat, distant clearings; no moving walk cycle is presented. The source is `blender/deer.blend`; its 403 KB runtime asset is `assets/deer.glb`. The original download and checksum are pinned in `sources.json`.

The high moor, branch paths, birches and bark atlas, heather, reed pond, jetty, skiff, boundary stones, garden walls and additional cottages were authored in Blender for this expansion. Wind deformation and drifting leaves are small runtime shaders; no new generated images or paid assets were used.

The fork fingerpost in `blender/signpost.blend` was authored for this prototype, reusing the existing CC0 Roof Planks texture. Beveled arrow boards, post, iron fixings and lantern are editable meshes. Route lettering is painted into a small runtime canvas texture. No additional third-party assets were downloaded for the signpost pass.


## Personal discovery expansion

The observation shelter, telescope, weather vane, open music cabin, drum kit, cymbals, amp, record sleeves, notebooks, postcard, padel props and articulated bird silhouettes were authored for this prototype in Blender. They reuse the existing attributed wood and plaster textures and the existing CC0 woodland scans. The additional deer reuse Quaternius’s already attributed rig and idle/grazing animations. No game assets, paid assets or external model services were introduced. The game reference informed atmosphere only. The source and construction records live in `blender/`; the saved `.blend` remains editable.
