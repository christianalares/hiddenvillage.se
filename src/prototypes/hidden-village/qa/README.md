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
