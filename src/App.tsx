import React, { useRef, useState, MouseEvent } from 'react';

import { Spin } from 'antd';

import { LS_KEY_NM_PAGE_LEFT_WIDTH, handlerWidth } from './constants';
import NodeEditor from './NodeEditor';
import Map from './map';

import './App.css';

function App() {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(() => {
    const d = localStorage.getItem(LS_KEY_NM_PAGE_LEFT_WIDTH);
    if (!d) return 0;
    return Number(d);
  });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mapboxReady, setMapboxReady] = useState(false);

  const mouseMoveHandler = (e: MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return;

    document.body.style.cursor = 'col-resize';

    // How far the mouse has been moved
    setLeftWidth(e.clientX);
    localStorage.setItem(LS_KEY_NM_PAGE_LEFT_WIDTH, String(e.clientX));
  };

  const mouseUpHandler = () => {
    setIsMouseDown(false);
    document.body.style.removeProperty('cursor');
  };

  const mouseDownHandler = () => {
    setIsMouseDown(true);
  };

  let rightWidth = 0;
  if (layoutRef.current && leftWidth !== 0) {
    rightWidth =
      layoutRef.current.getBoundingClientRect().width -
      leftWidth -
      handlerWidth;
  }

  return (
    <div
      aria-hidden
      className="nm-app"
      ref={layoutRef}
      onMouseMove={mouseMoveHandler}
      onMouseUp={mouseUpHandler}>
      <Map width={leftWidth} onMapboxReady={setMapboxReady} />
      <div
        aria-hidden
        className="nm-layout-resizer"
        style={{ width: handlerWidth }}
        onMouseDown={mouseDownHandler}
      />
      {mapboxReady ? <NodeEditor style={{ width: rightWidth }} /> : <Spin />}
    </div>
  );
}

export default App;
