
const headways = {
  high: 660,
  medium: 1260,
  low: 2700
}

const colors = {
  active: '#ffff66',
  busoutline: '#ffffff',
  buslow: '#8acaeb',
  busmedium: '#1c96d6',
  bushigh: '#ff0000',
  rail: '#aaaaaa',
  railoutline: '#ffffff',
  tram: '#ff9966',
  tramoutline: '#ffffff',
  metro: '#ff0000',
  metrooutline: '#ffffff',
  other: '#E6A615',
  stop: '#007cbf'
}

const hwcolors = {
  low: '#fee8c8',
  medium: '#feb24c',
  high: '#f03b20'
}

const headwayLayers = [
  {
    name: 'route-active',
    paint: {
      'line-color': colors.active,
      'line-width': 12,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1.0,
        0.0
      ]
    }
  },
  {
    name: 'route-headway-unknown',
    filter: ['all', ['<=', 'headway_secs', 0]],
    paint: { 'line-opacity': 0.75, 'line-width': 3.0, 'line-color': hwcolors.low }
  },
  {
    name: 'route-headway-low',
    filter: ['all', ['>', 'headway_secs', headways.medium]],
    paint: { 'line-opacity': 0.75, 'line-width': 3.0, 'line-color': hwcolors.low }
  },
  {
    name: 'route-headway-medium',
    filter: ['all', ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', headways.high]],
    paint: { 'line-opacity': 0.75, 'line-width': 3.0, 'line-color': hwcolors.medium }
  },
  {
    name: 'route-headway-high',
    filter: ['all', ['<=', 'headway_secs', headways.high], ['>', 'headway_secs', 0]],
    paint: { 'line-opacity': 0.75, 'line-width': 3.0, 'line-color': hwcolors.high }
  }
]

const stopLayers = [
  {
    name: 'stops',
    type: 'circle',
    source: 'stops',
    paint: {
      'circle-color': '#000',
      'circle-radius': 4,
      'circle-opacity': 0.75
    }
  }
]

const routeLayers = [
  // hitbox / active
  {
    name: 'route-active',
    paint: {
      'line-color': colors.active,
      'line-width': 12,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1.0,
        0.0
      ]
    }
  },
  // RAIL
  {
    name: 'route-rail-outline',
    filter: ['all', ['==', 'route_type', 2]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.railoutline }
  },
  {
    name: 'route-rail',
    filter: ['all', ['<', 'route_type', 3]],
    paint: { 'line-width': 3.0, 'line-color': '#666' }
  },
  // BUS LOW AND UNKNOWN
  {
    name: 'route-bus-unknown',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', 0]],
    paint: { 'line-width': 1.5, 'line-color': colors.buslow }
  },
  {
    name: 'route-bus-low',
    filter: ['all', ['==', 'route_type', 3], ['>', 'headway_secs', headways.medium]],
    paint: { 'line-width': 1.5, 'line-color': colors.buslow }
  },
  // BUS MEDIUM/HIGH
  {
    name: 'route-bus-medium-outline',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', 0]],
    paint: { 'line-width': 2.0, 'line-gap-width': 1.0, 'line-color': colors.busoutline }
  },
  {
    name: 'route-bus-medium',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', 0]],
    paint: { 'line-width': 2.0, 'line-color': colors.busmedium }
  },
  // TRAM
  {
    name: 'route-tram-outline',
    filter: ['all', ['==', 'route_type', 0]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.tramoutline }
  },
  {
    name: 'route-tram',
    filter: ['all', ['==', 'route_type', 0]],
    paint: { 'line-width': 3.0, 'line-color': ['coalesce', ['get', 'route_color'], colors.tram] }
  },
  // METRO
  {
    name: 'route-metro-outline',
    filter: ['all', ['==', 'route_type', 1]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.metrooutline }
  },
  {
    name: 'route-metro',
    filter: ['all', ['==', 'route_type', 1]],
    paint: { 'line-width': 3.0, 'line-color': ['coalesce', ['get', 'route_color'], colors.metro] }
  },
  // OTHER
  {
    name: 'route-other',
    filter: ['all', ['>', 'route_type', 3]],
    paint: {
      'line-opacity': 1.0,
      'line-width': [
        'step',
        ['get', 'headway_secs'],
        1, 1,
        2, 600,
        1, 1200,
        1
      ],
      'line-color': colors.other
    }
  }
]

export default { headways, colors, stopLayers, routeLayers, headwayLayers }
