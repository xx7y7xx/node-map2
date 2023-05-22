import GeoJSONSourceComponent, {
  CONTROL_KEY_SOURCE_ID,
} from 'NodeEditor/GeoJSONSourceComponent';
import LineLayerComponent from 'NodeEditor/LineLayerComponent';
import MapComponent, {
  CONTROL_KEY_LAT,
  CONTROL_KEY_LNG,
  CONTROL_KEY_ZOOM,
} from 'NodeEditor/MapComponent';
import JsonComponent, { CONTROL_KEY, OUTPUT_KEY } from '../../JsonComponent';
import geojson from './data.json';
import SymbolLayerComponent from 'NodeEditor/SymbolLayerComponent';

const jsonNodeExample = async () => {
  const { editor } = window.___nodeMap;

  if (!editor) {
    return;
  }

  const m = editor.components;

  const mapNode = await (m.get(MapComponent.key) as MapComponent).createNode({
    [CONTROL_KEY_LNG]: -122.486052,
    [CONTROL_KEY_LAT]: 37.830348,
    [CONTROL_KEY_ZOOM]: 14,
  });
  const jsonNode = await (m.get(JsonComponent.key) as JsonComponent).createNode(
    {
      [CONTROL_KEY]: { text: JSON.stringify(geojson, null, 2), obj: geojson },
    },
  );
  const geojsonSourceNode = await (
    m.get(GeoJSONSourceComponent.key) as GeoJSONSourceComponent
  ).createNode({ [CONTROL_KEY_SOURCE_ID]: 'route' });
  const lineLayerNode = await (
    m.get(LineLayerComponent.key) as LineLayerComponent
  ).createNode({
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    'line-color': '#888888',
    'line-width': 8,
  });
  const symbolLayerNode = await (
    m.get(SymbolLayerComponent.key) as SymbolLayerComponent
  ).createNode({
    'symbol-spacing': 100,
  });

  mapNode.position = [0, -200];
  geojsonSourceNode.position = [230, 0];
  lineLayerNode.position = [530, 0];
  symbolLayerNode.position = [730, 0];

  editor.addNode(mapNode);
  editor.addNode(jsonNode);
  editor.addNode(geojsonSourceNode);
  editor.addNode(lineLayerNode);
  editor.addNode(symbolLayerNode);

  editor.connect(
    jsonNode.outputs.get(OUTPUT_KEY)!,
    geojsonSourceNode.inputs.get(GeoJSONSourceComponent.inputKey)!,
  );
  editor.connect(
    geojsonSourceNode.outputs.get(GeoJSONSourceComponent.outputKey)!,
    lineLayerNode.inputs.get(LineLayerComponent.inputKey)!,
  );
  editor.connect(
    geojsonSourceNode.outputs.get(GeoJSONSourceComponent.outputKey)!,
    symbolLayerNode.inputs.get(SymbolLayerComponent.inputKey)!,
  );

  editor.view.area.translate(100, 100);
};

export default jsonNodeExample;
