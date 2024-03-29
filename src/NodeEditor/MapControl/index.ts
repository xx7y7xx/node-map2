import { NodeEditor, Control } from 'rete';
import mapboxgl, {
  Expression,
  GeoJSONSource,
  LngLatBoundsLike,
  LngLatLike,
  Map,
  MapLayerMouseEvent,
} from 'mapbox-gl';
import * as turf from '@turf/turf';

import { imageIdArrow } from '../../constants';
import MapLayerConfigDrawer from '../components/MapLayerConfigDrawer';
import { DEFAULT_LINE_COLOR, DEFAULT_LINE_WIDTH } from './constants';
import { fillColor, isEmpty } from './helpers';
import { Feature, FeatureCollection } from 'geojson';

type ControlInternalProps = {
  sourceId: string;
  defaultValue: any;
  onChange: (field: string, value: string) => void;
  onCleanup: () => void;
};

/**
 * MapControl hold mapbox's layer and data source
 *
 * The data stored in this control:
 * ```json
 * {
 *   "lineColor": "#000",
 *   "lineWidth": 1,
 *   "colorBaseOnField": ""
 * }
 * ```
 */
export default class MapControl extends Control {
  // @type {Node|null} In constructor this.parent is null
  // parent

  static component = MapLayerConfigDrawer;

  emitter: NodeEditor;
  component: typeof MapLayerConfigDrawer;
  sourceId: string;
  layerId: string;
  layerIdPoint: string;
  layerIdFill: string;
  layerIdArrow: string;
  hoveredStateId: string | number;
  props: ControlInternalProps;

  /**
   *
   * @param {*} emitter
   * @param {*} key Control key, one component may have two controls, each control has its own control key
   * @param {Object} props
   * @param {string} props.sourceId The source id load from local cache
   */
  constructor(
    emitter: NodeEditor,
    key: string,
    props: { sourceId: string; defaultValue: any },
  ) {
    super(key);
    this.emitter = emitter;
    this.key = key;
    this.component = MapControl.component;

    this.sourceId = props.sourceId; // "nmSourceId123"
    this.layerId = `${this.sourceId}LayerId`;
    this.layerIdPoint = `${this.sourceId}LayerIdPoint`;
    this.layerIdFill = `${this.sourceId}LayerIdFill`;
    this.layerIdArrow = `${this.sourceId}LayerIdArrow`;
    this.hoveredStateId = ''; // The id when mouse hover on
    // layer id list (used to remove all layers one by one)
    // this.layerIdList = [this.layerId, this.layerIdPoint, this.layerIdFill, this.layerIdArrow];

    /**
     * IMPORTANT!
     * NOT call getNode or putData, because these function will check control.parent first
     * but when executing in this control constructor, the control.parent is null (not ready)
     */
    // console.log('this.parent', this.parent); // will print "null"
    // console.log('this.parent node', this.getNode());
    // // if no data loaded from cache, then init with new data
    // if (!this.parent.data[key]) {
    //   // the save data of this control is like {lineColor:"#ccc",lineWidth:1}
    //   this.putData(this.key, {});
    // }

    const defaultValue = {
      lineColor: DEFAULT_LINE_COLOR,
      lineWidth: DEFAULT_LINE_WIDTH,
      colorBaseOnField: '',
      ...(props.defaultValue || {}),
    };

    // pass props to react component MapLayerConfigDrawer
    this.props = {
      ...props,
      sourceId: this.sourceId,
      defaultValue,
      onChange: this.handleChange.bind(this),
      onCleanup: this.handleCleanup.bind(this),
    };

    // this.mmaapp();
    this.initMap(defaultValue);
  }

  handleChange(field: string, val: string) {
    this.putData(this.key, {
      ...(this.getData(this.key) || {}),
      [field]: val,
    });
    this.emitter.trigger('process'); // trigger process to save new val to local cache

    const map = window.mapbox;
    if (field === 'lineColor') {
      map.setPaintProperty(this.layerId, 'line-color', val);
      map.setPaintProperty(this.layerIdPoint, 'circle-color', val);
    }
    if (field === 'lineWidth') {
      map.setPaintProperty(this.layerId, 'line-width', val);
      map.setPaintProperty(this.layerIdPoint, 'circle-radius', val);
    }
    if (field === 'colorBaseOnField') {
      map.setPaintProperty(this.layerIdFill, 'fill-color', fillColor(val));
    }
  }

  // TODO no idea when this will be called
  handleCleanup() {
    console.log('MapControl handleCleanup');

    // const map = window.mapbox;
    // if (map.getLayer(this.layerId)) {
    //   map.removeLayer(this.layerId);
    //   map.removeLayer(this.layerIdPoint);
    //   map.removeLayer(this.layerIdFill);
    //   map.removeLayer(this.layerIdArrow);
    // }

    // if (map.getSource(this.sourceId)) {
    //   map.removeSource(this.sourceId);
    // }
  }

  initMap(defaultValue: any) {
    console.debug('initMap23456', defaultValue);

    const map = window.mapbox;

    const loadSourceAndLayers = () => {
      this.mouseEventHover(this.layerIdFill);
      this.mouseEventPopup();

      console.debug('addSource', this.sourceId);
      map.addSource(this.sourceId, {
        type: 'geojson',
        data: turf.featureCollection([]),
        // A property to use as a feature id (for feature state)
        // TODO Maybe could let user change this field name from 'id' to other
        promoteId: 'id',
      });

      console.debug('map.addLayer', this.layerId);
      map.addLayer({
        id: this.layerId,
        type: 'line',
        source: this.sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': defaultValue.lineColor,
          'line-width': defaultValue.lineWidth,
        },
      });

      console.debug('map.addLayer', this.layerIdPoint);
      map.addLayer({
        id: this.layerIdPoint,
        type: 'circle',
        source: this.sourceId,
        paint: {
          'circle-radius': defaultValue.lineWidth,
          'circle-color': defaultValue.lineColor,
        },
      });

      console.debug('map.addLayer', this.layerIdFill);
      map.addLayer({
        id: this.layerIdFill,
        type: 'fill',
        source: this.sourceId,
        paint: {
          // 'fill-opacity': 0.5,
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5,
          ],
          // 'fill-color': lineColor,
          // 'fill-color': ['interpolate', ['linear'], ['get', 'value'], 0, 'red', 10, 'yellow'],
          // 'fill-color': [
          //   'interpolate', ['linear'], ['get', 'value'],
          //   // value ≤ 0 时，半径为 5
          //   0, 'red',
          //   // value ≥ 100 时，半径为 15
          //   3, 'green',
          // ],
          // 'fill-color': [
          //   'step',
          //   ['get', ''],
          //   '#EFFF85',
          //   1, '#98F300',
          //   2, '#37C508',
          //   3, '#00CA8D',
          //   4, '#0098A3',
          // ],
          'fill-color': fillColor() as Expression,
        },
      });

      this.initImgLayer();
    };

    loadSourceAndLayers();
  }

  initImgLayer() {
    console.debug('initImgLayer');

    const map = window.mapbox;

    // console.log('image exists?', map.hasImage(imageIdArrow));
    if (map.getLayer(this.layerIdArrow)) {
      console.warn('img layer already exists');
      return;
    }

    console.debug('map.addLayer', this.layerIdArrow);
    map.addLayer({
      id: this.layerIdArrow,
      type: 'symbol',
      source: this.sourceId,
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 100,
        'icon-allow-overlap': true,
        // 'icon-ignore-placement': true,
        'icon-image': imageIdArrow,
        'icon-size': 1,
        visibility: 'none', // 'visible' or 'none'
      },
    });
  }

  setAllData(geojson: FeatureCollection) {
    this._mapSetSourceData(geojson);
    this._mapHideOrShowImgLayerAccordingToData(geojson);
  }

  setAllDataWithStyle(geojson: FeatureCollection, lineCfg: any) {
    this._mapSetSourceData(geojson);
    this._mapSetLayerStyle(lineCfg);
    this._mapHideOrShowImgLayerAccordingToData(geojson);
  }

  setEmptyData() {
    this._mapSetSourceData(turf.featureCollection([]));
  }

  _mapSetLayerStyle({
    lineColor,
    lineWidth,
    colorBaseOnField,
  }: {
    lineColor: string;
    lineWidth: number;
    colorBaseOnField: string;
  }) {
    const map = window.mapbox;

    if (!map.getLayer(this.layerId)) {
      console.warn('_mapSetLayerStyle layer not ready', this.layerId);
      return;
    }
    map.setPaintProperty(this.layerId, 'line-color', lineColor);
    map.setPaintProperty(this.layerId, 'line-width', lineWidth);
    map.setPaintProperty(this.layerIdPoint, 'circle-color', lineColor);
    map.setPaintProperty(this.layerIdPoint, 'circle-radius', lineWidth);
    map.setPaintProperty(
      this.layerIdFill,
      'fill-color',
      fillColor(colorBaseOnField),
    );
  }

  _mapHideOrShowImgLayerAccordingToData(geojson: FeatureCollection | Feature) {
    const map = window.mapbox;

    if (!map.getLayer(this.layerIdArrow)) {
      console.debug('img layer not ready yet');
      return;
    }

    // * When first feature in collection is not line string, then no show arrow image
    // * When the feature is not line string, then no show arrow image
    if (geojson.type === 'FeatureCollection') {
      if (geojson.features[0].geometry.type !== 'LineString') {
        map.setLayoutProperty(this.layerIdArrow, 'visibility', 'none');
        return;
      }
    } else if (geojson.type === 'Feature') {
      if ((geojson as Feature).geometry.type !== 'LineString') {
        map.setLayoutProperty(this.layerIdArrow, 'visibility', 'none');
        return;
      }
    }

    map.setLayoutProperty(this.layerIdArrow, 'visibility', 'visible');
  }

  _mapSetSourceData(geojson: FeatureCollection) {
    const map = window.mapbox as Map;

    // Fly map to data
    if (!isEmpty(geojson)) {
      window.mapbox.fitBounds(turf.bbox(geojson) as LngLatBoundsLike, {
        padding: 200,
      });
    }

    // this.updateText(node, `${JSON.stringify(sourceData)}`);

    const { sourceId } = this;
    const mpSource = map.getSource(sourceId);
    if (!mpSource) {
      console.warn('MapControl cannot find map source');
    } else {
      (map.getSource(sourceId) as GeoJSONSource).setData(geojson);
    }
  }

  mouseEventHover(layerId: string) {
    const map = window.mapbox;
    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    map.on('mousemove', layerId, (e: MapLayerMouseEvent) => {
      if (!e.features) {
        return;
      }
      if (!(e.features.length > 0)) {
        return;
      }
      // `features[0].id` is defined in `promoteId` when `addSource`
      // TODO maybe could be customized by users in the future
      const featureId = e.features[0].id;
      if (featureId === undefined) {
        console.warn(
          'Cannot find feature[0].properties.id in source data. Will not show hover effect.',
          e.features,
        );
        return;
      }
      if (this.hoveredStateId !== '') {
        map.setFeatureState(
          { source: this.sourceId, id: this.hoveredStateId },
          { hover: false },
        );
      }
      this.hoveredStateId = featureId;
      map.setFeatureState(
        { source: this.sourceId, id: this.hoveredStateId },
        { hover: true },
      );
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', layerId, () => {
      if (this.hoveredStateId !== '') {
        map.setFeatureState(
          { source: this.sourceId, id: this.hoveredStateId },
          { hover: false },
        );
      }
      this.hoveredStateId = '';
    });
  }

  mouseEventPopup() {
    const map = window.mapbox;
    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // Show popup when mouse on a circle
    map.on('mouseenter', this.layerIdPoint, (e: MapLayerMouseEvent) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      if (!e.features) {
        return;
      }

      if (e.features[0].geometry.type !== 'Point') {
        // Only show popup for Point
        return;
      }

      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { description } = e.features[0].properties as any;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup
        .setLngLat(coordinates as LngLatLike)
        .setHTML(description)
        .addTo(map);
    });

    map.on('mouseleave', this.layerIdPoint, () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
  }

  // /**
  //  * When new data loaded, fly to the data.
  //  * Not work since querySourceFeatures() only returns features in the viewport
  //  */
  // mmaapp() {
  //   window.mapbox.on('sourcedata', (e) => {
  //     if (e.sourceId !== this.sourceId || !e.isSourceLoaded) return;
  //     const fs = window.mapbox.querySourceFeatures(this.sourceId);
  //     if (fs.length === 0) return;
  //     // console.debug('zoom to features', fs);
  //     const bbox = turf.bbox({
  //       type: 'FeatureCollection',
  //       features: fs,
  //     });
  //     window.mapbox.fitBounds(bbox, { padding: 20 });
  //   });
  // }

  // TODO no need to remove layer completely because when setting empty data, there will be no point/polygon on the map
  // removeLayers() {
  //   // no data input, maybe link disconnect
  //   const map = window.mapbox;

  //   this.layerIdList.forEach((lId) => {
  //     if (map.getLayer(lId)) {
  //       console.debug('removeLayer', lId);
  //       map.removeLayer(lId);
  //     }
  //   });
  // }

  // // update text in preview control
  // updateText(node, text) {
  //   this.editor.nodes
  //     .find((n) => n.id === node.id)
  //     .controls
  //     .get(CONTROL_KEY_GEOJSON)
  //     ?.setValue(text);
  // }
}
