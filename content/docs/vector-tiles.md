---
title: Transitland v2 Vector Tiles
---

Transitland publishes the current, active set of routes and stops as a set of tiles in Mapbox Vector Tile format. These provide extremely fast access to basic information such as route names, geometries, stop locations, etc. Additional details for each entity can be obtained using other Transitland APIs.

## Transitland Vector Tile Endpoints

The Transitland Vector Tiles base endpoint is:

    https://transit.land/mbtiles

Three services are currently provided: routes, stops, and agencies.

    https://transit.land/mbtiles/routes/tiles/{z}/{x}/{y}.pbf
    https://transit.land/mbtiles/stops/tiles/{z}/{x}/{y}.pbf

## Route tiles

The following attributes are provided for each feature in the route tiles. Note that some fields may be empty or null, in particular, `headway_secs` cannot always be accurately estimated. The internal ID values should only be used for immediate queries; these change over time.

Attribute | Description | Example
------------------|--|--------------
geometry          | Representative line geometry for this route | LineString(...)
generated         | True if the line geometry was generated from stop locations | f
onestop_id        | Generated OnestopID | r-9q9-yl~s
feed_onestop_id   | Feed OnestopID | f-9q9-bart
feed_version_sha1 | Feed Version | 8aafa62e...
route_id          | GTFS route_id | 1
route_short_name  | GTFS route_short_name  | YL-S
route_long_name   | GTFS route_long_name | Antioch to SFIA/Millbrae
route_color       | GTFS route_color | #ffff33
route_type        | GTFS route_type | 1
headway_secs      | Approximate headway (seconds) for weekday mornings | 960
agency_id         | The agency_id from the associated GTFS agency | BART
agency_name       | The agency_name from the associated GTFS Agency | Bay Area Rapid Transit
id                | Internal ID | 8472496

## Stop metadata

The following attributes are provided for each feature in the stop tiles.

Attribute | Description | Example 
----------|-------------|---------
geometry            | Geometry | Point(...)
onestop_id          | Stop OnestopID | s-9q9p19ut0x-12thstreet~oaklandcitycenter
feed_onestop_id     | Feed OnestopID | f-9q9-bart
feed_version_sha1   | Feed Version | 8aafa62e...
stop_id             | GTFS stop_id | 12TH
stop_name           | GTFS stop_name | 12th Street / Oakland City Center
location_type       | GTFS location_type | 0
parent_station      | Internal ID for parent station | 32915959
id                  | Internal ID | 32916008

## Configuring access

You will need to send your API key as part of the request to this endpoint. It can be specified through either the `apikey` query parameter or `apikey` header value.

## Mapbox GL example

These tiles can be consumed by any program that understands Mapbox Vector Tile format. The full details on how to request and render these tiles varies by library, but following is a brief example to configure Mapbox GL JS and render routes in the Chicago area. A full working version can be found <a href="/examples/example-map.html?apikey=YOUR_API_KEY" target="_blank">here</a>. You will need to provide your own API key.

<img src="/examples/example-map.png" alt="Example Mapbox GL JS Map" style="width:400px">


    const apikey = <YOUR_API_KEY>
    const map = new mapboxgl.Map({
        container: 'map',
        style: {
            version: 8,
            zoom: 12,
            center: [-87.628611, 41.860025],
            sources: {
                routes: {
                    type: 'vector',
                    tiles: [
                        `https://transit.land/mbtiles/routes/tiles/{z}/{x}/{y}.pbf?apikey=${apikey}`
                    ],
                    maxzoom: 14
                }
            },
            layers: [{
                id: 'routes',
                type: 'line',
                source: 'routes',
                'source-layer': 'routes',
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                paint: {
                    'line-width': 3.0,
                    'line-color': '#ff0000'
                }
            }]
        }
    })

Sending the API key in the header is recommended; this can be accomplished using Mapbox GL's `transformRequest` option:

      transformRequest: (url, resourceType) => {
        if (resourceType === 'Tile' && url.startsWith('https://transit.land')) {
          return {
            url,
            headers: { apikey: <YOUR_API_KEY> }
          }
        }
      }

