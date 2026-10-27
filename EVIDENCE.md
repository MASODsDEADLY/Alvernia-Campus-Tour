# Project Evidence — Alvernia University Campus Explorer

**Student name:** [Enter your name before submission]  
**Project:** Alvernia University Campus Explorer  
**Audience:** prospective students and first-time visitors to Alvernia University.  
**Need addressed:** provide an interactive way to explore selected campus landmarks in 3D and read short landmark summaries before visiting.

## Two primary features

1. **Campus-focused UI and landmark tour.** Search and select campus landmarks, read a short summary, inspect approximate coordinates, and navigate between stops.
2. **3D exploration with center-reticle coordinate capture.** Render the campus through Cesium/Google Photorealistic 3D Tiles, use the flight/camera controls, and attempt to capture a geographic position beneath the yellow center reticle when a pickable surface is available.

Supporting feature: a “Preview edge case” control communicates the expected no-surface response. It is a UI preview rather than a forced failure of the live Cesium picking system.

## AI prompt examples

These are professionally rewritten examples based on the development tasks, not a verbatim export of the original chat history. See `AI_USE.md` for the expanded AI-use note.

- **Initial project direction:** “Refactor the existing Flight Lab into an Alvernia University campus explorer for prospective students and first-time visitors. Preserve the existing movement logic where practical, and organize the interface around campus landmarks.”
- **Slow mode:** “Add a slow-flight mode that reduces simulated movement speed without changing the normal mode. Keep movement time-based and ensure the pause and reset controls continue to behave consistently.”
- **Cesium scenery:** “Integrate Google Photorealistic 3D Tiles into the Cesium scene. Include clear loading and failure messages, and account for missing or insufficient Cesium Ion token permissions.”
- **UI and canvas rendering:** “Improve the campus explorer interface with a clear landmark panel, responsive layout, readable controls, and a dedicated Cesium rendering area. Keep status messages accessible and visible.”
- **Coordinate capture:** “Add a yellow reticle fixed at the center of the 3D viewport and a control that attempts to capture latitude, longitude, and elevation from the visible surface beneath it.”
- **Edge-case handling:** “Provide a visible edge-case preview for situations where the reticle points at the sky or an unpickable surface. Explain that no coordinates are available rather than generating placeholder coordinates.”
- **Testing and documentation:** “Run the available movement tests, add independent checks where possible, record actual results, and distinguish automated code checks from browser tests that could not be verified.”

## Before/after screenshots

The evidence folder contains instructions for capturing genuine screenshots. A before/after screenshot was **not** generated in this environment: the headless Chromium attempt timed out before a screenshot was saved. Do not submit a mock image as if it were a real application screenshot.

- `evidence/README.txt` explains which screenshots to capture.
- Add `evidence/before.png` showing the project before the UI/reticle improvement, if you have that earlier version.
- Add `evidence/after.png` showing the current app with the campus UI and yellow reticle. Capture it in your own browser after Cesium loads.

If no earlier version exists, label the before image as unavailable instead of reconstructing it and presenting it as historical evidence.

## One problem solved

The original Flight Lab was oriented around generic flight/world exploration rather than the target audience's need to learn about Alvernia campus landmarks. The project now centers the UI on campus stops and adds a yellow reticle with coordinate-capture feedback. A second edge case was identified: coordinate picking may fail when there is no pickable 3D surface, so the app provides a clear preview of the safe response rather than claiming coordinates exist.

## Test evidence

The movement suite passed all seven checks when run with `flight-core.js` loaded first. JavaScript syntax checks passed for `app.js`, `flight-core.js`, `landmarks.js`, and `config.js`; a static check found all 20 required UI IDs; and the local server returned HTTP 200 for the page. The live Cesium view and real coordinate picking were **not verified** because the headless browser attempt timed out. Full results and retest details are in `TEST_LOG.md`.

## Issue and pull request

Improvement title: **Campus tour UI and center-reticle coordinate capture**. Add the actual repository issue and pull-request URLs here after they exist. Do not invent IDs or claim the records were created if they were not.
