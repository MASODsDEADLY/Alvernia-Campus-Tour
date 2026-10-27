# Test Log — Alvernia University Campus Explorer

**Test date:** 2026-10-27  
**Environment:** project files extracted locally; Node.js v22.16.0; Chromium headless was attempted, but did not finish within the 15-second timeout. No successful live-browser screenshot or live Cesium scene verification is claimed.

## Automated movement tests

I ran the existing movement suite by loading `flight-core.js` before `tests.js`:

```bash
node -e "global.Flight=require('./flight-core.js'); require('./tests.js')"
```

| # | Test | Actual result | Notes |
|---:|---|---|---|
| 1 | Pause preserves position | PASS | Returned state matches the paused state. |
| 2 | North movement increases latitude | PASS | A one-second northbound step increases latitude. |
| 3 | East movement increases longitude | PASS | A one-second step at heading 90° increases longitude. |
| 4 | Heading wraps in both directions | PASS | `-10°` becomes `350°`; `370°` becomes `10°`. |
| 5 | Height limits clamp | PASS | Values below/above the configured bounds clamp to 50 m / 5,000 m. |
| 6 | Zero speed keeps position | PASS | Latitude stays unchanged at zero speed. |
| 7 | Duration consistency | PASS | One 1-second step matches ten 0.1-second steps within the suite's tolerance. |

## Additional checks run for this handoff

| # | Check | Actual result | Notes |
|---:|---|---|---|
| 8 | `node --check app.js` | PASS | No JavaScript syntax error reported. |
| 9 | `node --check flight-core.js` | PASS | No JavaScript syntax error reported. |
| 10 | `node --check landmarks.js` | PASS | No JavaScript syntax error reported. |
| 11 | `node --check config.js` | PASS | No JavaScript syntax error reported. |
| 12 | Required UI element IDs in `index.html` | PASS | All 20 checked IDs were found: map, search/list, capture/edge-case UI, navigation, movement controls, and status. This is a static check, not proof that each control works in a browser. |
| 13 | Local HTTP server serves `index.html` | PASS | `python -m http.server` returned HTTP 200 for `/`. |
| 14 | Chromium headless page capture | BLOCKED / NOT VERIFIED | Chromium did not finish within the 15-second timeout. No screenshot was captured, and live Cesium rendering is not marked as passed. |

## Fix and retest

**Problem found:** the test file uses the global `Flight` object. Running `node tests.js` alone does not first load `flight-core.js`, so that command is not the correct standalone Node invocation.

**Fix:** use the explicit command shown above, which loads `flight-core.js` and then runs `tests.js`. No application behavior was changed for this test-runner correction.

**Retest result:** reran the corrected command. All seven movement tests passed.

## Edge case investigated

The app's coordinate capture may not return a 3D position when the center reticle points at the sky, empty space, or a surface that is not loaded/pickable. The safe expected behavior is to show a no-surface message and not fabricate coordinates. The UI's “Preview edge case” button demonstrates the message, but it does not force a real failure in Cesium's depth-picking system. The actual live edge case remains unverified here.

## Manual tests still required on the student's browser

- Confirm Cesium and Google Photorealistic 3D Tiles load with the student's own token.
- Search for a campus landmark and confirm the list filters.
- Select a landmark and verify its title, summary, and coordinates update.
- Use previous/next and guided tour controls.
- Try fly, pause, turn, speed, height, reset, and camera-follow controls.
- Capture a coordinate with a visible surface, then try the sky/no-surface case.
- Save actual before/after screenshots in `evidence/` and record any failures truthfully.
