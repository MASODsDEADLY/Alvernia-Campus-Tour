# Alvernia University Campus Explorer

## Audience and need
**Audience:** prospective students and first-time visitors to Alvernia University.

**Need:** a simple way to explore selected campus landmarks, orient themselves in the 3D scene, and read a short background summary for each stop before visiting.

## Run instructions
1. Extract this folder.
2. Open `config.js` and provide a valid Cesium Ion token with only the permissions required by the project. Do not commit a private token to a public repository; use a local, ignored config file or another secure configuration method.
3. Start a local web server from this folder, for example: `python -m http.server 8000`.
4. Open `http://localhost:8000` in a browser with internet access.
5. Allow CesiumJS and Google Photorealistic 3D Tiles to load. The map needs network access and appropriate token/service access.

You can also deploy the folder to a static host such as GitHub Pages after configuring secrets/token handling appropriately. A plain static site cannot keep a token secret if it is shipped to the browser.

## Working features
- **Campus landmark interface:** maroon-and-gold campus-focused UI with a searchable list, landmark story panel, coordinates, and previous/next navigation.
- **Yellow center reticle and coordinate capture:** aim the fixed yellow center dot at a visible 3D surface and capture its latitude, longitude, and elevation when Cesium depth picking succeeds.
- **Guided tour and flight controls:** select gold map pins, cycle through stops, start/stop the guided tour, and use simulated speed, height, heading, pause, reset, and camera-follow controls.
- **Visible edge-case preview:** the “Preview edge case” control shows the expected safe response when the center dot is over sky or a location without a loaded 3D surface: no coordinates should be generated. It is a UI demonstration, not an automated test of the live Cesium scene.

## Landmark data
The tour contains six requested stops: John R. Post Center, Francis Hall, Bernardine Hall, Franco Library, Plex, and Student Center. The John R. Post Center is in downtown Reading, separate from the Hill Campus. Coordinates provided explicitly by the project owner are preserved for John R. Post Center (40.3356760, -75.9293295), Francis Hall (40.3095782, -75.9339888), Bernardine Hall (40.3100250, -75.9366775), and Franco Library (40.3096411, -75.9357145). Plex and Student Center remain estimates pending verification. Even supplied coordinates should be checked against the current official campus map before practical navigation.

## Tests and verification record
Run the logic tests by opening `tests.html` in a browser, or run `node tests.js` in a compatible Node environment after loading `flight-core.js` first (the browser test page loads dependencies in order). The existing suite records these seven logic checks:

1. Pause preserves position.
2. North movement increases latitude.
3. East movement increases longitude.
4. Heading wraps in both directions.
5. Height limits clamp to the allowed range.
6. Zero speed keeps position.
7. One second of movement is consistent with ten 0.1-second steps.

**Edge case investigated:** center-dot coordinate capture can fail if the dot points at sky, empty space, or a tile surface that has not loaded / cannot be depth-picked. Expected behavior is a clear “No 3D surface found…” message rather than fabricated coordinates. The new preview control displays that expected result on demand. This preview is not proof that every browser/GPU/tile state has been tested.

**Verification status for this package edit:** JavaScript syntax and ZIP integrity are checked before delivery. The live Google 3D Tiles view has not been visually verified in this editing environment.

## Known limitations
- The Plex and Student Center pins are unverified estimates; all pins are for exploration, not navigation-grade directions.
- Google Photorealistic 3D Tiles availability, loading time, and building detail depend on network, token access, service availability, and local hardware.
- Center-point picking can fail when there is no visible/pickable surface under the reticle. The capture is not automatically saved into `landmarks.js`.
- The simulation is not a real aircraft model: it does not implement aerodynamics, collision detection, terrain avoidance, or ground-level pathfinding.
- Building history summaries are brief and may not capture the full history of each facility.

## Issue and pull-request tracking record
**Improvement:** replace the generic world-city tour with a campus-specific interface and add a yellow center reticle for coordinate capture, plus visible handling for the no-surface edge case.

- **Issue title:** `Campus tour UI and center-reticle coordinate capture`
- **Issue scope:** add searchable campus landmarks and history summaries; keep the center reticle aligned to the visible map; report an empty/no-surface capture safely.
- **Pull request title:** `Add Alvernia campus tour UI, yellow reticle, and capture edge-case preview`
- **Acceptance checks:** six landmark stops are listed; selecting a stop updates its story and coordinates; the center reticle stays over the map viewport; capture reports coordinates only when a 3D point is found; edge-case preview clearly states that no coordinates are generated.
- **Tracking links/IDs:** not included in the supplied project snapshot. Add the actual repository issue and pull-request URLs after they are created or linked; no GitHub activity is claimed by this local project file.

## AI Use Note
- **Tool:** ChatGPT (OpenAI), used as a coding and documentation assistant.
- **Purpose:** help reorganize the Flight Lab into an Alvernia campus tour, document its audience and need, improve the landmark UI, add a yellow center reticle and coordinate capture flow, and document tests and limitations.
- **Representative prompts:** “rewrite the flight lab to be a campus tour of Alvernia University”; “make the map camera target the center of the canvas”; “add a yellow center dot for capturing coordinates”; and “add a UI element that shows the edge case.”
- **Student changes/responsibility:** the student should review the generated code and text, verify landmark facts and coordinates against university sources, configure their own Cesium Ion token, and create/link the real GitHub issue and pull request. The four explicitly supplied coordinates were retained as requested; Plex and Student Center remain labeled estimates.
- **Verification:** existing movement logic tests cover pause, cardinal movement, heading wrap, height bounds, zero speed, and duration consistency. For this package revision, JavaScript syntax checks and ZIP integrity checks are run; the live Cesium/Google 3D Tiles scene requires a browser, internet connection, and valid access and has not been visually confirmed here.
- **Limitations:** AI-generated code and summaries can contain mistakes; landmark history and map pins require independent review. The edge-case button is a preview of the expected UI message, not a simulated failure of the actual Cesium depth-picking engine. A browser-visible Cesium Ion token is not a secret.
