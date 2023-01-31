/* eslint-disable no-underscore-dangle */

import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Rete from 'rete';
import ReactRenderPlugin from 'rete-react-render-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
import AreaPlugin from 'rete-area-plugin';
// import ContextMenuPlugin, { Menu, Item, Search } from 'rete-context-menu-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';

import { LS_KEY_NODE_EDITOR_DATA } from '../constants';
import AuthComponent from './AuthComponent';
import ConcatComponent from './ConcatComponent';
import CsvToJsonComponent from './CsvToJsonComponent';
import JsonComponent from './JsonComponent';
import TransformComponent from './TransformComponent';
import EvalCodeComponent from './EvalCodeComponent';
import GlobalComponent from './GlobalComponent';
import PreviewComponent from './PreviewComponent';
import UploadComponent from './UploadComponent';
import UploadCsvComponent from './UploadCsvComponent';
import RemoteDataComponent from './RemoteDataComponent';
import MapComponent from './MapComponent';
import MapMarkersComponent from './MapMarkersComponent';
import MapGeoJsonComponent from './MapGeoJsonComponent';
import MapLayerComponent from './MapLayerComponent';
import MapLayerV2Component from './MapLayerV2Component';
import TurfLineStringComponent from './TurfLineStringComponent';
import { loadConfig, reteContextMenuOptions } from './helpers';

const ID = 'node-map@0.1.0';

export async function createEditor(container) {
  const concatComponent = new ConcatComponent();
  const jsonComponent = new JsonComponent();
  const transformComponent = new TransformComponent();
  const evalCodeComponent = new EvalCodeComponent();
  const globalComponent = new GlobalComponent();
  const previewComponent = new PreviewComponent();
  const csvToJsonComponent = new CsvToJsonComponent();
  const uploadCsvComponent = new UploadCsvComponent();
  const remoteDataComponent = new RemoteDataComponent();
  const mapComponent = new MapComponent();
  const mapMarkersComponent = new MapMarkersComponent();
  const mapGeoJsonComponent = new MapGeoJsonComponent();
  const mapLayerComponent = new MapLayerComponent();
  const mapLayerV2Component = new MapLayerV2Component();
  const authComponent = new AuthComponent();
  const turfLineStringComponent = new TurfLineStringComponent();
  const uploadComponent = new UploadComponent();

  const editor = new Rete.NodeEditor(ID, container);
  if (!window.___nodeMap) window.___nodeMap = {};
  window.___nodeMap.editor = editor;
  editor.use(ConnectionPlugin);
  editor.use(ReactRenderPlugin, { createRoot });
  editor.use(ContextMenuPlugin, reteContextMenuOptions);

  const engine = new Rete.Engine(ID);

  const allComponents = ({
    uploadComponent,
    jsonComponent,
    transformComponent,
    evalCodeComponent,
    globalComponent,
    concatComponent,
    previewComponent,
    csvToJsonComponent,
    uploadCsvComponent,
    remoteDataComponent,
    mapComponent,
    mapMarkersComponent,
    mapGeoJsonComponent,
    mapLayerComponent,
    mapLayerV2Component,
    authComponent,
    turfLineStringComponent,
  });
  window.___nodeMap.allComponents = allComponents;
  Object.keys(allComponents).forEach((key) => {
    editor.register(allComponents[key]);
    engine.register(allComponents[key]);
  });

  await loadConfig(editor);

  editor.on(
    'process nodecreated noderemoved connectioncreated connectionremoved',
    async () => {
      // console.log('process', editor.toJSON());
      await engine.abort();
      await engine.process(editor.toJSON());
    },
  );

  editor.on(
    'process nodecreated nodedraged noderemoved connectioncreated connectionremoved',
    async () => {
      const data = JSON.stringify(editor.toJSON());
      console.debug('Save data to local:', editor.toJSON());
      localStorage.setItem(LS_KEY_NODE_EDITOR_DATA, data);
    },
  );

  editor.view.resize();
  editor.trigger('process');
  AreaPlugin.zoomAt(editor, editor.nodes);

  return editor;
}

export function useRete() {
  const [container, setContainer] = useState(null);
  const editorRef = useRef();

  useEffect(() => {
    if (container) {
      createEditor(container).then((value) => {
        // console.log('created');
        editorRef.current = value;
      });
    }
  }, [container]);

  useEffect(
    () => () => {
      if (editorRef.current) {
        console.log('destroy');
        editorRef.current.destroy();
      }
    },
    [],
  );

  return [setContainer];
}
