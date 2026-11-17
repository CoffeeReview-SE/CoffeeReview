# Motorcycle and walking directions

The `/map` page supports Geoapify routes from GPS to a store or between two map points.
Choose Motorcycle or Walking, then select a store marker and use the route button.
The map suggests up to three distinct routes, ordered by distance, and selects the
shortest returned route. Select a route card or a gray route on the map to switch.
Each card shows distance and estimated duration. Navigation and off-route detection
use the selected route. Changing endpoints, travel mode, or rerouting selects the
shortest new suggestion. A single-route message appears when suggestions coincide.
The Gateway requests distance-optimized and balanced routes, plus a route avoiding
an interior point of the first route when possible. Geoapify can return the same
road geometry for these requests, so the number of suggestions depends on the road
network. Duplicate geometries are removed. Successful optional suggestions are kept
when another optional request fails.
Distances are meters from the routing service; times are estimated, not live traffic.
Nearby filtering still uses straight-line distance.

## Configuration

Create a Geoapify project key and configure `Routing__GeoapifyApiKey` in the Gateway
environment. For local `npm run dev:stack`, add it to root `.env`; for Railway, add it
to the Gateway service variables. Restart the Gateway after configuring the key.
Do not use a `VITE_` variable or commit a real key. The frontend receives only route
coordinates, distance, and duration through `/api/routes`.

Requests accept `startLat`, `startLng`, `endLat`, `endLng`, and `mode` (`motorcycle`
or `walk`). Invalid inputs return 400, missing configuration 503, no route 404,
and provider failure 502/503/504. Requests are limited to 12/minute/client IP.
Successful routes are cached for ten minutes in a bounded per-process cache;
the browser also caches recent routes. Normal GPS updates do not request new routes.
Start navigation to follow the GPS marker and enable automatic rerouting. Dragging
the map pauses camera following; use Follow location to resume. Stop navigation
disables its GPS watch and automatic rerouting. GPS requires HTTPS or localhost and
browser location permission. Browser background throttling can interrupt tracking.

Automatic rerouting requires GPS accuracy within 50 meters, a fresh fix, and a
deviation from route segments of more than 60 meters (motorcycle) or 35 meters
(walking), increased to twice GPS accuracy when larger. Deviation must persist at
least eight seconds; route requests are spaced at least 30 seconds apart. A failed
route request requires Retry. Camera following does not consume API credits.
Each uncached route calculation makes up to three provider requests, including
an avoidance request that can cost additional credits under Geoapify pricing.
Each uncached reroute can consume additional provider credits. Displayed distance
and duration describe the last calculated route, not a live remaining-distance ETA.
These controls reduce usage but do not enforce a shared daily credit budget across
server instances. Check usage in the Geoapify dashboard.

## Verification

Build with `npm run build` and `dotnet build services/gateway/src/SGCoffee.Gateway`.
With a key configured, verify a known local route in both modes, switch back to check
cache reuse, clear the route, and test denied GPS and unreachable destinations.
Confirm provider attribution is visible with the route. Without a key, the map
continues working and shows the routing configuration message.
