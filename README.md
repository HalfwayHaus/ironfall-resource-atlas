# Ironfall Resource Atlas

[Open the interactive map](https://halfwayhaus.github.io/ironfall-resource-atlas/)

A flat copy of Ironfall’s BlueMap terrain with resource density gradients derived from a Minecraft world save.

- Toggle any of 22 resource layers and choose preset or custom depth bands.
- Adjust gradient strength and switch the terrain to grayscale.
- Pan, zoom, and jump to world coordinates.

## Offline map

[Download the offline map](downloads/ironfall-resource-atlas.html), then use the download button and open the saved HTML file in a modern browser. The file contains the same gradients and terrain as the live map.

## Survey coverage

The atlas is based on a scan of **1,843,200 saved chunks** in **1,800 Overworld region files**, with zero scan errors. Coverage spans X 0–30,719, Z 0–15,359, and Y −64–319.

The map blends relative density estimates from neighboring **256 × 256 block** cells. The depth filter combines the selected 16-block Y bands. Each resource has its own relative color scale. The density reflects the world save when it was scanned.

## Terrain attribution

Terrain imagery was copied from [Ironfall BlueMap](https://ironfall.org/bluemap/) on October 25, 2026, at five blocks per pixel. Terrain imagery is attributed to the Ironfall server. [BlueMap](https://github.com/BlueMap-Minecraft/BlueMap) is the map renderer.

[Background source and coordinate alignment metadata](assets/bluemap-metadata.json)

## Run locally

Serve this directory with `python -m http.server 8000`, then open `http://localhost:8000`. The site uses plain HTML, CSS, and JavaScript. GitHub Pages publishes the root of the `main` branch.
