# Drum model and sound sources

Research date: 2026-10-15. These are source findings, not a claim that the assets have all been integrated or auditioned in the finished world.

## Selected drum model

**Drum Kit by Serg.Morgun**, published 2021-02-24. The [creator's Sketchfab listing](https://sketchfab.com/3d-models/drum-kit-99218427e7a2424ea8afc9b8c668a5c7) and its [public model metadata](https://api.sketchfab.com/v3/models/99218427e7a2424ea8afc9b8c668a5c7) identify **CC BY 4.0**, 38,704 triangles and 21,675 source vertices. This is a detailed textured artist model, suitable for refining into a single hanging tom and single floor tom kit.

- License: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
- Original source: [Serg.Morgun on Sketchfab](https://sketchfab.com/Serg.Morgun).
- Downloaded copy: [Allen Institute's official Objaverse GLB mirror](https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/000-039/99218427e7a2424ea8afc9b8c668a5c7.glb). Its object UID exactly matches the creator listing. The GLB embeds the creator, original URL and `CC-BY-4.0` in `asset.extras`. The [dataset index](https://huggingface.co/datasets/allenai/objaverse/tree/main) provides the object-to-file mapping. The individual model's license applies to this asset; do not substitute the dataset license.
- Cached source: `../blender/.cache/research/serg-drums.glb`, 18,053,460 bytes.
- SHA-256: `9667e03bb6d8a9d67ad53373a516d1f3c7484f8acb6d8ca55b2ab996b81da752`.
- Cached creator metadata: `../blender/.cache/research/sketchfab-serg.json`.
- 7 material-group meshes, 6 materials, 15 embedded PNG textures. The artist's original mesh names do not label each playable instrument, so the implementation must separate connected components or add appropriate hit targets.
- Imported coordinates are approximately millimetre scale. Blender bounds before normalization: X `-2626.128..-179.108`, Y `-759.451..1424.227`, Z `-512.900..1319.069`. Normalize with uniform scale `0.001`, then place and orient the kit.

Suggested attribution: “Drum Kit by Serg.Morgun, CC BY 4.0, via Sketchfab / Objaverse. Adapted for Hidden Village.” Name any geometry, texture and layout changes in the shipped attribution file.

## Acoustic drum samples

**Salamander Drumkit by Alexander Holm**. The [creator-uploaded Internet Archive item](https://archive.org/details/SalamanderDrumkit) identifies **CC BY-SA 3.0** in its [metadata](https://archive.org/metadata/SalamanderDrumkit). The [original archive](https://archive.org/download/SalamanderDrumkit/salamanderDrumkit.tar.bz2) is downloaded to the research cache. This is a recorded acoustic kit, including 12-inch rack tom, 14-inch floor tom, kick, snare, hi-hat, crashes and rides. The [maintained SFZ source](https://github.com/endolith/Salamander-Drumkit) preserves the original author notes and mapping, including the warning about leading silence in original samples.

License: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Credit Alexander Holm and keep edited/encoded sample files under the same sample license. Do not imply the website's application code inherits this license. Preserve source attribution and describe trimming, encoding and volume adjustments.

Two original hits per instrument were extracted into `../blender/.cache/research/salamander-selected/`:

| Part | Preferred original | Second original for variation |
| --- | --- | --- |
| Kick | `kick_OH_F_1.wav` | `kick_OH_F_2.wav` |
| Snare | `snare_OH_MP_1.wav` | `snare_OH_MP_2.wav` |
| Closed hi-hat | `hihatClosed_OH_F_1.wav` | `hihatClosed_OH_F_2.wav` |
| Crash | `crash1_OH_FF_1.wav` | `crash1_OH_FF_2.wav` |
| Ride | `ride1_OH_MP_1.wav` | `ride1_OH_MP_2.wav` |
| Hanging tom | `hiTom_OH_F_1.wav` | `hiTom_OH_F_2.wav` |
| Floor tom | `loTom_OH_MP_1.wav` | `loTom_OH_MP_2.wav` |

The 14 original WAVs total 14,787,316 bytes. Only the prepared subset should be delivered to browsers, not the full 388 MB research archive. Trim the leading silence for responsive clicks, retain a short attack margin, fade sample tails and vary the two recordings conservatively rather than changing each instrument's pitch dramatically.

## Page and woodland recordings

All four sound creators explicitly publish these recordings as **CC0** on their original Freesound pages. The downloaded files are Freesound's public high-quality MP3 previews, not the original WAV downloads, which require login. The [CC0 dedication](https://creativecommons.org/publicdomain/zero/1.0/) permits reuse and modification; attribution is still recorded here for provenance.

| Use | Creator and source | Duration of original | Cached MP3 / direct source |
| --- | --- | --- | --- |
| Page turn | [Page Turn (1), OwlStorm / Ashe Kirk / Owlish Media](https://freesound.org/people/OwlStorm/sounds/151220/) | 0.588 s | `page-turn.mp3`, [MP3](https://cdn.freesound.org/previews/151/151220_140737-hq.mp3) |
| Distant owl | [owl.wav, Anthousai](https://freesound.org/people/Anthousai/sounds/398734/) | 3.997 s | `owl.mp3`, [MP3](https://cdn.freesound.org/previews/398/398734_5923045-hq.mp3) |
| Woodland bed | [Wind in trees.WAV, nickydunne](https://freesound.org/people/nickydunne/sounds/463551/) | 90.814 s | `woodland-wind.mp3`, [MP3](https://cdn.freesound.org/previews/463/463551_9359506-hq.mp3) |
| Occasional timber sound | [Creaking Wood 1.wav, Greg_Surr](https://freesound.org/people/Greg_Surr/sounds/590150/) | 1.912 s | `wood-creak.mp3`, [MP3](https://cdn.freesound.org/previews/590/590150_8198141-hq.mp3) |

All cache paths are under `../blender/.cache/research/`. Corresponding `.html` files preserve the observed creator pages and license declarations.

The wind creator describes trees, a nearby small river and distant birds. The owl is a field recording made with a Tascam DR-40. The creak is recorded wood, suitable for a porch or tree sound. Favor quiet spatially placed occasional calls and long pauses, with the wind recording underneath. Avoid layering all effects continuously or adding sudden loud stings.

`woodland-audition.wav` contains seconds 20 through 40 of the wind recording for a short listening check. **This research did not establish by listening that the segment has no human voices.** Do not report that as verified merely from the descriptive metadata. Check the audible mix before delivery.

## Other models considered

- [Drum Set by Zsky](https://poly.pizza/m/qWU9Q4flfQ): 2.9k triangles, FBX/GLTF, downloaded `zsky-drums.glb` (206,220 bytes). Single joined mesh, six untextured material groups. The individual model's visible attribution links **CC BY 3.0**. Its larger bundle says 4.0, so retaining the individual model's 3.0 attribution is the conservative choice. Too simplified for the desired realism compared with Serg.Morgun.
- [Drumkit by J-Toastie](https://poly.pizza/m/4l5jRtpTec): 5.2k triangles, OBJ/GLTF, downloaded `jtoastie-drums.glb` (368,512 bytes), visible **CC BY 3.0** link. Five instrument-group nodes and six flat-color materials. Also less detailed than the selected model.
- [Detailed Drum Set by bryanajones](https://blendswap.com/blend/13383): staff pick, CC-BY, 6.47 MB Blender file. Actual download requires sign-in. Not downloaded.
- [Drum Kit by art.katja](https://sketchfab.com/3d-models/drum-kit-898f2f4ba1704abe9c784066e2b0f751): CC BY 4.0, 86,020 triangles, made from firsthand observations. Download API requires authentication. Not downloaded.

The current [Three.js webaudio timing example](https://github.com/mrdoob/three.js/blob/dev/examples/webaudio_timing.html) uses bouncing balls and a ping-pong sample, not a drum kit model.
