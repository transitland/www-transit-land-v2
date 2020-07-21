
const headways = {
  high: 300,
  medium: 900,
  low: 1800
}

const colors = {
  active: '#ffff66',
  busoutline: '#ffffff',
  buslow: '#8acaeb',
  busmedium: '#1c96d6',
  rail: '#aaaaaa',
  railoutline: '#ffffff',
  tram: '#ff9966',
  tramoutline: '#ffffff',
  metro: '#ff0000',
  metrooutline: '#ffffff',
  other: '#E6A615',
  stop: '#007cbf'
}

const routelayers = [
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
    name: 'rail-outline',
    filter: ['all', ['==', 'route_type', 2]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.railoutline }
  },
  {
    name: 'rail',
    filter: ['all', ['<', 'route_type', 3]],
    paint: { 'line-width': 3.0, 'line-color': colors.rail }
  },

  // BUS LOW AND UNKNOWN
  {
    name: 'bus-unknown',
    filter: ['all', ['==', 'route_type', 3], ['==', 'headway_secs', 0]],
    paint: { 'line-color': colors.buslow }
  },
  {
    name: 'bus-low',
    filter: ['all', ['==', 'route_type', 3], ['>', 'headway_secs', headways.medium]],
    paint: { 'line-color': colors.buslow }
  },
  // BUS MEDIUM/HIGH
  {
    name: 'bus-medium-outline',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', 0]],
    paint: { 'line-width': 2.0, 'line-gap-width': 1.0, 'line-color': colors.busoutline }
  },
  {
    name: 'bus-medium',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', 0]],
    paint: { 'line-width': 2.0, 'line-color': colors.busmedium }
  },
  // TRAM
  {
    name: 'tram-outline',
    filter: ['all', ['==', 'route_type', 0]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.tramoutline }
  },
  {
    name: 'tram',
    filter: ['all', ['==', 'route_type', 0]],
    paint: { 'line-width': 3.0, 'line-color': ['coalesce', ['get', 'route_color'], colors.tram] }
  },
  // METRO
  {
    name: 'metro-outline',
    filter: ['all', ['==', 'route_type', 1]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.metrooutline }
  },
  {
    name: 'metro',
    filter: ['all', ['==', 'route_type', 1]],
    paint: { 'line-width': 3.0, 'line-color': ['coalesce', ['get', 'route_color'], colors.metro] }
  },
  // OTHER
  {
    name: 'other',
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

export default { headways, colors, routelayers }
