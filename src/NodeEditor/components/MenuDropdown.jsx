/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events,
   jsx-a11y/no-static-element-interactions */

import React, { useState } from 'react';
import { Dropdown, Space } from 'antd';
import {
  DownOutlined, ExportOutlined, ImportOutlined, FolderOpenOutlined,
} from '@ant-design/icons';
import { downloadObjectAsJson } from 'NodeEditor/helpers';
import { LS_KEY_NODE_EDITOR_DATA, mapboxSourceLayerIdPrefix } from 'constants';
import ExampleModal from './ExampleModal';

export default function MenuDropdown() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoadExample = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleExportConfigFile = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadObjectAsJson(JSON.stringify(JSON.parse(localStorage.getItem(LS_KEY_NODE_EDITOR_DATA)), null, '  '), `node-map-export-data-${date}.json`);
  };

  const handleSwitchLightDark = () => {
    document.body.classList.toggle('nm-dark-mode');
  };

  const handleImportConfigFile = () => {
    const fr = new FileReader();
    fr.onload = (e) => {
      localStorage.setItem(LS_KEY_NODE_EDITOR_DATA, JSON.stringify(JSON.parse(e.target.result)));
      window.location.reload();
    };
    fr.readAsText(document.getElementById('import-config-file').files[0]);
  };

  const handleClearEditorAndMap = () => {
    const { editor } = window.___nodeMap;
    const map = window.mapbox;

    editor.clear();

    map.getStyle().layers.forEach((layer) => {
      if (layer.id.startsWith(mapboxSourceLayerIdPrefix)) {
        console.debug('Clear layer:', layer.id);
        map.removeLayer(layer.id);
      }
    });

    Object.keys(map.getStyle().sources).forEach((sourceId) => {
      if (sourceId.startsWith(mapboxSourceLayerIdPrefix)) {
        console.log('Clear source:', sourceId);
        map.removeSource(sourceId);
      }
    });
  };

  const items = [
    {
      key: 'export',
      label: (
        <a onClick={handleExportConfigFile}>
          Export
        </a>
      ),
      icon: <ExportOutlined />,
    },
    {
      key: 'import',
      label: (
        <label htmlFor="import-config-file">
          Import
          <input
            type="file"
            id="import-config-file"
            style={{
              visibility: 'hidden',
            }}
            onChange={handleImportConfigFile}
          />
        </label>
      ),
      icon: <ImportOutlined />,
    },
    {
      key: 'load-example',
      label: (
        <a onClick={handleLoadExample}>
          Examples
        </a>
      ),
      icon: <FolderOpenOutlined />,
    },
    {
      key: 'switch-light-dark',
      label: (
        <a onClick={handleSwitchLightDark}>
          Switch Light Dark
        </a>
      ),
      icon: <FolderOpenOutlined />,
    },
    {
      key: 'clear-editor',
      label: (
        <a onClick={handleClearEditorAndMap}>
          Clear Node Map
        </a>
      ),
      icon: <FolderOpenOutlined />,
    },
  ];

  return (
    <div className="nm-export-btn">
      <Dropdown
        menu={{ items }}
      >
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            Menu
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
      <ExampleModal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} />
    </div>
  );
}
