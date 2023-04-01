import Rete from 'rete';

import InputNumberControl from './InputNumberControl';
import SliderControl from './SliderControl';
import SelectControl from './SelectControl';
import InputControl from './InputControl';

const KEY = 'Map Node';
export const CONTROL_KEY_STYLE = 'inputControlStyle';
export const CONTROL_KEY_LNG = 'inputControlLng';
export const CONTROL_KEY_LAT = 'inputControlLat';
export const CONTROL_KEY_ZOOM = 'inputControlZoom';
export const CONTROL_KEY_PROJECTION = 'inputControlProjection';
const defaultStyle = 'mapbox://styles/mapbox/streets-v12';
const defaultZoom = 9;

// https://docs.mapbox.com/mapbox-gl-js/style-spec/projection/
const PROJECTIONS = ['albers', 'equalEarth', 'equirectangular', 'lambertConformalConic', 'mercator', 'naturalEarth', 'winkelTripel', 'globe'];

const updateValues = (node) => (event) => {
  const map = event.target;
  node.controls.get(CONTROL_KEY_LNG)?.setValue(map.getCenter().lng);
  node.controls.get(CONTROL_KEY_LAT)?.setValue(map.getCenter().lat);
  node.controls.get(CONTROL_KEY_ZOOM)?.setValue(map.getZoom());
};

/**
 * Control the center and other props of map
 */
export default class MapComponent extends Rete.Component {
  constructor() {
    super(KEY); // node title
  }

  static key = KEY;

  builder(node) {
    console.debug('MapComponent builder', node);

    // init node data
    if (node.data[CONTROL_KEY_STYLE] === undefined) {
      node.data[CONTROL_KEY_STYLE] = defaultStyle;
    }
    if (node.data[CONTROL_KEY_LNG] === undefined) {
      node.data[CONTROL_KEY_LNG] = 0;
    }
    if (node.data[CONTROL_KEY_LAT] === undefined) {
      node.data[CONTROL_KEY_LAT] = 0;
    }
    if (node.data[CONTROL_KEY_ZOOM] === undefined) {
      node.data[CONTROL_KEY_ZOOM] = defaultZoom;
    }

    window.mapbox.on('dragend', updateValues(node));
    window.mapbox.on('zoomend', updateValues(node));

    // window.mapbox.jumpTo({
    //   center: [node.data[CONTROL_KEY_LNG], node.data[CONTROL_KEY_LAT]],
    //   zoom: 10,
    // });
    window.mapbox.setCenter([node.data[CONTROL_KEY_LNG], node.data[CONTROL_KEY_LAT]]);
    window.mapbox.setZoom(node.data[CONTROL_KEY_ZOOM]);
    window.mapbox.setProjection(node.data[CONTROL_KEY_PROJECTION]);

    const projections = PROJECTIONS.map((item) => ({ value: item, label: item }));
    return node
      .addControl(new InputControl(this.editor, CONTROL_KEY_STYLE, node, { label: 'style' }))
      .addControl(new InputNumberControl(this.editor, CONTROL_KEY_LNG, node, { label: 'lng' }))
      .addControl(new InputNumberControl(this.editor, CONTROL_KEY_LAT, node, { label: 'lat' }))
      .addControl(new SliderControl(this.editor, CONTROL_KEY_ZOOM, node, { label: 'zoom' }))
      .addControl(new SelectControl(this.editor, CONTROL_KEY_PROJECTION, node, { label: 'projection', style: { width: '150px' }, options: projections }));
  }

  worker(node, inputs, outputs) {
    console.debug('MapComponent worker', node, inputs, outputs);
    // outputs[OUTPUT_KEY] = node.data[CONTROL_KEY];

    // if (window.mapbox) {
    //   console.debug('[MapComponent] fly to position');
    //   window.mapbox.flyTo({
    //     center: [node.data[CONTROL_KEY_LNG], node.data[CONTROL_KEY_LAT]],
    //     zoom: node.data[CONTROL_KEY_ZOOM] || defaultZoom,
    //   });
    // }

    // TODO setStyle will also remove all sources/layers
    // window.mapbox.setStyle(node.data[CONTROL_KEY_STYLE]);
    window.mapbox.setZoom(node.data[CONTROL_KEY_ZOOM]);
    window.mapbox.setProjection(node.data[CONTROL_KEY_PROJECTION]);
  }
}
