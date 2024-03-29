// @ts-nocheck

import Rete from 'rete';
import Papa from 'papaparse';

import { objectSocket } from './JsonComponent';
import DivControl from './DivControl';
import { stringSocket } from './UploadCsvComponent';

const INPUT_KEY = 'csv';

export default class CsvToJsonComponent extends Rete.Component {
  constructor() {
    super('CSV to JSON');
  }

  builder(node) {
    const input = new Rete.Input(INPUT_KEY, 'CSV', stringSocket);
    const output = new Rete.Output('json', 'JSON', objectSocket);

    return node
      .addInput(input)
      .addOutput(output)
      .addControl(new DivControl('title', 'CSV to JSON'));
  }

  worker(nodeData, inputs, outputs) {
    if (inputs[INPUT_KEY].length === 0) {
      // there is no input
      return;
    }

    const csvStr = inputs[INPUT_KEY][0];

    if (!csvStr) {
      outputs.json = [];
      return;
    }

    const result = Papa.parse(csvStr, {
      header: true,
      dynamicTyping: true,
    });

    outputs.json = result.data;
  }
}
