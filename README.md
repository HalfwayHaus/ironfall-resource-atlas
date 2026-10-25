# Ironfall Resource Atlas

[Open the interactive map](https://halfwayhaus.github.io/ironfall-resource-atlas/)

A separate, flat copy of Ironfall’s BlueMap terrain with ore density overlays computed directly from the supplied Minecraft world save.

## Features

- 22 resource layers, including lithium, pyrochlore, ordinary gold, nether gold, beryllium, uranium, zinc, copper, iron, lead, nickel, silver, sulfur, coal, redstone, lapis, diamond, emerald, bauxite, tar, amethyst, and nether quartz.
- Independently toggle layers, filter by depth, and inspect the highest-density search areas.
- Pan and zoom, jump to world coordinates, inspect exact ore examples, and export hotspot coordinates.
- No account, backend, or installation is needed.

## Downloads

- [Self-contained offline map](downloads/ironfall-resource-atlas.html) — save this file, then open it in a modern browser.
- [All-resource hotspot coordinates](downloads/ironfall-resource-hotspots.csv)

## Survey coverage and interpretation

The atlas uses a complete scan of **1,843,200 saved chunks** in **1,800 Overworld region files**, with **zero scan errors**. Coverage is X 0–30,719, Z 0–15,359, Y −64–319. Every one of the 7,200 density cells contains 256 saved chunks. Counts were independently checked for all resource types and all 24 depth bands in four complete region files, plus ordinary/nether gold in three other regions.

Density means the number of saved resource blocks in a **256 × 256 block column**, within the selected 16-block Y sections. Each ore layer has its own relative color scale. Markers identify dense search areas; they do not represent single connected veins. The top marker is the absolute richest grid cell; other suggested search areas are spatially separated by at least 512 blocks between centers. Example coordinates identify a saved block in a locally rich 16 × 16 × 16 section.

Ore data reflects the supplied world save and may differ from the live server. The map does not update automatically. The original BlueMap and world save are unchanged. Raw world files, player data, and server commands are not included.

## Background and attribution

Terrain imagery was copied from [Ironfall BlueMap](https://ironfall.org/bluemap/) on October 25, 2026, at five blocks per pixel. Terrain imagery is attributed to the Ironfall server; [BlueMap](https://github.com/BlueMap-Minecraft/BlueMap) is the map renderer. This copy includes terrain color, without live players, claims, live markers, or 3D geometry.

[Background source and coordinate alignment metadata](assets/bluemap-metadata.json)

## Run locally

Serve this directory using a static HTTP server, such as `python -m http.server 8000`, then open `http://localhost:8000`. Alternatively, use the self-contained offline download above.

The main site is plain HTML, CSS, and JavaScript with no build step. GitHub Pages publishes the root of the `main` branch.
