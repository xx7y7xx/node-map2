import Rete from 'rete';
import RemoteDataControl from './RemoteDataControl';
import InputControl from './InputControl';
import { objectSocket } from './JsonComponent';

const CONTROL_KEY_URL = 'inputControlUrl';
const CONTROL_KEY = 'remoteDataControl';
const CONTROL_KEY_JWT = 'inputControlJwt';
const CONTROL_KEY_X_AUTH_METHOD = 'inputControlXAuthMethod';
const OUTPUT_KEY = 'csv';

export default class RemoteDataComponent extends Rete.Component {
  constructor() {
    super('Remote Data Node'); // node title
  }

  builder(node) {
    return node
      .addControl(new InputControl(this.editor, CONTROL_KEY_URL, node, { label: 'url' }))
      .addControl(new InputControl(this.editor, CONTROL_KEY_JWT, node, { label: 'jwt' }))
      .addControl(new InputControl(this.editor, CONTROL_KEY_X_AUTH_METHOD, node, { label: 'x-auth-method' }))
      .addControl(new RemoteDataControl(this.editor, CONTROL_KEY, node))
      .addOutput(new Rete.Output(OUTPUT_KEY, 'Object', objectSocket));
  }

  // eslint-disable-next-line class-methods-use-this
  worker(node, inputs, outputs) {
    // eslint-disable-next-line no-param-reassign
    outputs[OUTPUT_KEY] = node.data[CONTROL_KEY];
  }
}