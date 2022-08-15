import Rete from 'rete';
import * as turf from '@turf/turf';

import TextControl from './TextControl';
import { objectSocket } from './JsonComponent';
import { stringSocket } from './UploadCsvComponent';

const CONTROL_KEY = 'mapGeoJsonControl';
const SOURCE_ID = 'nm-line-string-source';
const OUTPUT_KEY = 'sourceId';

export default class MapGeoJsonComponent extends Rete.Component {
  constructor() {
    super('MapGeoJson');

    const map = window.mapbox;

    window.mapbox.on('load', () => {
      this.mapReady = true;
    });

    window.mapbox.on('sourcedata', (e) => {
      if (e.sourceId !== SOURCE_ID || !e.isSourceLoaded) return;
      const f = map.querySourceFeatures(SOURCE_ID);
      if (f.length === 0) return;
      const bbox = turf.bbox({
        type: 'FeatureCollection',
        features: f,
      });
      map.fitBounds(bbox, { padding: 20 });
    });
  }

  builder(node) {
    const input = new Rete.Input('json', 'GeoJSON', objectSocket);
    const output = new Rete.Output(OUTPUT_KEY, 'sourceId', stringSocket);

    return node
      .addInput(input)
      .addOutput(output)
      .addControl(new TextControl(this.editor, CONTROL_KEY, node, true));
  }

  // eslint-disable-next-line no-unused-vars
  worker(node, inputs, outputs) {
    // inputs.json=[] // no data
    // inputs.json=[[[103.8254528,1.2655414]]]
    const geojson = inputs.json[0];

    if (!geojson) {
      // no data input, maybe link disconnect
      this.updateText(node, '');
      return;
    }

    outputs[OUTPUT_KEY] = SOURCE_ID; // eslint-disable-line no-param-reassign

    if (this.mapReady) {
      this.addOrUpdateSource(geojson, node);
    } else {
      window.mapbox.on('load', () => {
        this.addOrUpdateSource(geojson, node);
      });
    }
  }

  // update text in preview control
  updateText(node, text) {
    this.editor.nodes
      .find((n) => n.id === node.id)
      .controls
      .get(CONTROL_KEY)
      .setValue(text);
  }

  // eslint-disable-next-line class-methods-use-this
  addOrUpdateSource(geojson, node) {
    const map = window.mapbox;

    const sourceData = {
      type: 'geojson',
      data: geojson,
    };

    this.updateText(node, `${JSON.stringify(sourceData)}`);

    const mpSource = map.getSource(SOURCE_ID);
    if (mpSource) {
      // some layers may use this source now
      // map.removeSource(SOURCE_ID);
      map.getSource(SOURCE_ID).setData(sourceData);
    } else {
      window.mapbox.addSource(SOURCE_ID, sourceData);
    }
  }
}
