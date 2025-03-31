import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
window.process = {
  version: '',
  node: false,
  env: {},
  browser: true,
}; 