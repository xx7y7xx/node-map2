/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events,
   jsx-a11y/no-static-element-interactions */

import React, { useEffect, useState } from 'react';
import { Dropdown, Space } from 'antd';
import {
  DownOutlined,
  ExportOutlined,
  ImportOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import {
  clearEditorAndMapConfirm,
  downloadObjectAsJson,
} from 'NodeEditor/helpers';
import { LS_KEY_NODE_EDITOR_DATA } from '../../constants';
import ExampleModal from './ExampleModal';

export default function MenuDropdown() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // https://stackoverflow.com/questions/64032647/event-listener-for-multiple-keys-in-react
    const callback = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.code) {
          case 'KeyL': {
            e.preventDefault();
            return clearEditorAndMapConfirm();
          }
          // case 'KeyX': {
          //   e.preventDefault();
          //   return setIsModalOpen(true);
          // }
          default:
            console.debug('no key action', e.code);
        }
      }
      return '';
    };
    document.addEventListener('keydown', callback);
    return () => {
      document.removeEventListener('keydown', callback);
    };
  }, []);

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
    downloadObjectAsJson(
      JSON.stringify(
        JSON.parse(localStorage.getItem(LS_KEY_NODE_EDITOR_DATA) || '{}'),
        null,
        '  ',
      ),
      `node-map-export-data-${date}.json`,
    );
  };

  const handleSwitchLightDark = () => {
    document.body.classList.toggle('nm-dark-mode');
  };

  const handleImportConfigFile = () => {
    const fr = new FileReader();
    fr.onload = (e) => {
      if (!e.target) {
        console.error(
          'Failed to import from config file, event.target is invalid',
          e,
        );
        return;
      }
      localStorage.setItem(
        LS_KEY_NODE_EDITOR_DATA,
        JSON.stringify(JSON.parse((e.target.result as string) || '{}')),
      );
      window.location.reload();
    };
    const inputEl = document.getElementById(
      'import-config-file',
    ) as HTMLInputElement;
    if (inputEl && inputEl?.files?.[0]) {
      fr.readAsText(inputEl?.files?.[0]);
    }
  };

  const handleClean = () => {
    clearEditorAndMapConfirm();
  };

  const items = [
    {
      key: 'export',
      label: <a onClick={handleExportConfigFile}>Export</a>,
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
      label: <a onClick={handleLoadExample}>Examples</a>,
      icon: <FolderOpenOutlined />,
    },
    {
      key: 'switch-light-dark',
      label: <a onClick={handleSwitchLightDark}>Switch Light Dark</a>,
      icon: <FolderOpenOutlined />,
    },
    {
      key: 'clear-editor',
      label: <a onClick={handleClean}>Clear Node Map (Command+L)</a>,
      icon: <FolderOpenOutlined />,
    },
  ];

  return (
    <div className="nm-export-btn">
      <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            Menu
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
      <ExampleModal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
}
