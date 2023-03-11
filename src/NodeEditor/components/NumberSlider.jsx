import React from 'react';
import { Slider, InputNumber } from 'antd';

export default function NumberSlider({
  label, min = 1, max = 20, step, value, onChange,
}) {
  return (
    <div
      style={{ position: 'relative', margin: '4px 0px' }}
      onPointerDown={(e) => {
        // When drag slider, the node should not move
        e.stopPropagation();
      }}
    >

      <div>
        <Slider
          min={min}
          max={max}
          step={step}
          defaultValue={1}
          value={value}
          onChange={onChange}
        />
      </div>
      <div style={{
        position: 'absolute', left: '20px', top: '0px', lineHeight: '24px', pointerEvents: 'none', color: 'white',
      }}
      >
        <span>{label}</span>
      </div>
      {/* <InputNumber
        value={value}
        onChange={(val) => onChange(val)}
      /> */}
    </div>
  );
}
