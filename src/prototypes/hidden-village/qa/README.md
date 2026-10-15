# Soundscape verification — 15 October 2026

[soundscape-playback.json](soundscape-playback.json) records the added assets and Chrome playback checks: no audio requests before enabling sound; four decoded loops; movement-triggered footsteps; no duplicate loops after muting; narration ducking from 0.7 to 0.2; a simulated visibility change suspending audio and pausing the voice; and the stream fading up at the bridge approach. Types, lint, bundle, seven soundscape tests and eleven journey tests pass. Subjective headphone listening and physical iOS Safari playback remain manual checks.

[soundscape-preview.mp3](soundscape-preview.mp3) is a 24-second illustrative sequence assembled from the same prepared assets and runtime gain levels, not a recording of an interactive browser session. Source URLs, checksums and adaptation notes are in `../blender/soundscape-sources.json` and `../ATTRIBUTION.md`.

---

# Expanded journey verification — 14 October 2026

The `expansion-*` files document the larger landscape and branching route pass. Earlier captures and results below are retained as history, not current-scene performance claims.

24 actual browser screenshots were inspected at 1440 × 900 and 390 × 844. Both route options were followed, including the return from the pond and the original village lane. Review corrected a terrain color-layer export mismatch, branch/cottage intersections, slope foundations, edge-on distant trees, pond placement and camera framing. See [measured route clearance](expansion-ground.json), [browser samples](expansion-measurements.json) and [delivered asset hashes](expansion-asset-hashes.json).

## Expansion checks

- Native wheel input, Home/End keyboard travel and emulated touch swipe work. The swipe moved the camera from bridge z=60 to approximately z=49.55, with native document scrolling and momentum.
- Both fork controls change the selected route before the split; the chosen state persists through the branch and return. Revisiting a fork permits another choice. All ten Waypoints buttons were used.
- Four route combinations were checked against actual Blender terrain/bridge meshes at 0.25-metre spacing: 4,356 positions, clearance 1.649–1.787 m. A 0.28 m radius chest/head sweep found no obstacle contacts. The small ground variation includes a foot-sized sample over bridge board gaps.
- Quaternius deer Idle (41 samples) and Eating (73 samples) each retained a minimum hoof height of effectively zero throughout the clips. Animals remain on flat authored clearings and have contact shadows; there is no sliding walk cycle.
- Resting atmosphere: 11 rendered frames over 1.201 seconds, approximately 9.2 FPS. Pause atmosphere and emulated reduced-motion preference each produced zero new resting frames over at least one second. Moving rendering remains capped at 30 FPS. These are browser observations on the Mac, not physical phone GPU or heat measurements.
- Narrow-screen loading requested no separate 2K rock map. Resize restored the scene; final browser logs had no errors or warnings.
- Lamp panes remain emissive and warm ground pools are baked into the terrain, independent of the two nearby real-time lights.
- Source/export, bundle and repository type checks passed. The current local production build passed compilation/lint/type checking, then failed collecting `/work/[slug]` because this checkout lacks the existing Notion credentials. No homepage files were changed.

## Expansion render samples

CPU submission times below exclude GPU work. The larger visible world costs more geometry than the earlier scene; resolution caps, batching, two live lights, distance culling and the reduced resting frame rate bound that cost. Pause atmosphere restores fully idle rendering.

| View | Draw calls | Triangles | CPU submission ms |
| --- | ---: | ---: | ---: |
| [desktop-moor](expansion-desktop-moor.jpg) | 190 | 446,710 | 7.00 |
| [desktop-hollow](expansion-desktop-hollow.jpg) | 218 | 562,487 | 3.40 |
| [desktop-woods](expansion-desktop-woods.jpg) | 179 | 524,150 | 2.90 |
| [desktop-ridge](expansion-desktop-ridge.jpg) | 176 | 508,242 | 3.60 |
| [desktop-bridge](expansion-desktop-bridge.jpg) | 166 | 487,443 | 2.00 |
| [desktop-workshop](expansion-desktop-workshop.jpg) | 123 | 383,173 | 2.30 |
| [desktop-square](expansion-desktop-square.jpg) | 96 | 334,199 | 1.60 |
| [desktop-pond](expansion-desktop-pond.jpg) | 41 | 160,123 | 3.80 |
| [desktop-pond-return](expansion-desktop-pond-return.jpg) | 66 | 257,942 | 2.80 |
| [desktop-last-light](expansion-desktop-last-light.jpg) | 33 | 103,734 | 2.90 |
| [phone-moor](expansion-phone-moor.jpg) | 133 | 404,399 | 2.20 |
| [phone-hollow](expansion-phone-hollow.jpg) | 104 | 260,869 | 2.90 |
| [phone-woods](expansion-phone-woods.jpg) | 169 | 521,282 | 0.70 |
| [phone-ridge](expansion-phone-ridge.jpg) | 155 | 500,354 | 2.00 |
| [phone-bridge](expansion-phone-bridge.jpg) | 155 | 487,539 | 4.90 |
| [phone-workshop](expansion-phone-workshop.jpg) | 58 | 231,019 | 3.80 |
| [phone-square](expansion-phone-square.jpg) | 59 | 260,795 | 1.60 |
| [phone-pond](expansion-phone-pond.jpg) | 33 | 153,087 | 1.60 |
| [phone-pond-return](expansion-phone-pond-return.jpg) | 57 | 248,151 | 2.70 |
| [phone-last-light](expansion-phone-last-light.jpg) | 28 | 103,025 | 1.00 |
| [phone-village-lanes](expansion-phone-village-lanes.jpg) | 57 | 253,226 | 2.20 |

---

# Browser verification — 14 October 2026

All twelve captures are actual Chrome renders on the host Mac, inspected during the pass. Desktop: 1440 × 900. Phone viewport: 390 × 844. This is viewport testing on a Mac, not a physical phone benchmark.

The review corrected exposed mountain faces, roof undersides, floating/intersecting scenery, bridge entry grading, canopy edges, phone landmark framing and sign placement. The canopy remains visibly image-based at close/oblique angles; repetitive distant vegetation and masonry are acknowledged in the main README.

## Final scene measurements

Single-frame CPU render submission samples after shader warmup; these are not GPU timings, sustained frame-rate measurements or heat measurements. Some captures occur in the last 0.03 metres of easing. The 30 FPS cap and resting-render behavior remain in place. Merging small architectural pieces reduced opening draw calls from 373 to 145 in this pass; more distant merged geometry can remain inside a visible batch.

| View | Stop | Draw calls | Triangles | CPU submission ms | Capture |
| --- | --- | ---: | ---: | ---: | --- |
| desktop | woods | 145 | 333,831 | 1.30 | [View](desktop-woods.jpg) |
| desktop | ridge | 146 | 378,341 | 4.60 | [View](desktop-ridge.jpg) |
| desktop | bridge | 133 | 353,851 | 4.90 | [View](desktop-bridge.jpg) |
| desktop | workshop | 101 | 250,219 | 3.30 | [View](desktop-workshop.jpg) |
| desktop | square | 67 | 182,424 | 3.30 | [View](desktop-square.jpg) |
| desktop | last-light | 46 | 127,079 | 1.70 | [View](desktop-last-light.jpg) |
| phone | woods | 140 | 333,587 | 3.20 | [View](phone-woods.jpg) |
| phone | ridge | 124 | 365,603 | 3.90 | [View](phone-ridge.jpg) |
| phone | bridge | 123 | 354,184 | 3.80 | [View](phone-bridge.jpg) |
| phone | workshop | 51 | 148,954 | 2.60 | [View](phone-workshop.jpg) |
| phone | square | 52 | 183,580 | 1.30 | [View](phone-square.jpg) |
| phone | last-light | 38 | 125,191 | 2.90 | [View](phone-last-light.jpg) |

## Functional checks

- All six Waypoints buttons traverse the continuous route, with captions and progress changing along the way.
- Emulated forward touch swipe moved from the bridge at z=60 to z≈50.65.
- Arrow Up moved backward from the final stop to z≈−9.94; wheel input moved forward again.
- The repositioned Village sign was hit-tested (pointer cursor) and clicked; the camera reached the square at z=3.
- The last stop exposes the existing `mailto:christian@hiddenvillage.se` link. No email was sent.
- The frame counter stayed at 552 during an extended idle interval. This check preceded the final batching-only optimization; no animation/scheduling code changed afterward.
- The small viewport did not request the extra desktop rock texture. Resize woke rendering, and final browser logs contained no warnings or errors.
- Hidden-tab pausing, reduced-motion camera behavior and context-restoration handlers remain in code; they were not separately stress-tested in this pass.

## Asset/build checks

- Blender 5.2.2 LTS reopened the saved source, exported it and compressed the result successfully through `npm run prototype:assets`.
- All file-based images in the saved `.blend` were packed. All 27 pinned source downloads passed their MD5 checks.
- `npm run prototype:bundle`, `npm run check:types` and the whitespace check passed.
- Local production compilation/lint/types passed, followed by the existing Notion authentication failure while collecting `/work/[slug]`. Homepage source files are unchanged.
- Actual source terrain and bridge clearance: 1.699–1.803 m across 477 route probes at 0.25 m spacing. A 0.08 m foot-radius sample accounts for real gaps between boards.
