import path from 'path';
import { Device, Input, State } from '../dist/index.js';
const __dirname = import.meta.dirname;

const device = new Device({
  path: path.join(__dirname, "..", "test_data", "macro_easy.bin"),
});

device.on('state-change', (state) => {
  console.log('[INPUT]', state.input, state.state) // LeftBumper Pressed
});

// ./types:MacroConfig
// Macros can be defined at any point, whether the device is connected or not
device.macros["shoulders"] = {
  inputs: [{
    input: Input.RightBumper,
    state: State.Pressed,
  }, {
    input: Input.LeftBumper,
    state: State.Pressed,
  }],
  exclusive: true,
  someRandomOtherDataToPass: 42
}

// All macros fire the same event, use the ID to differentiate
device.on('macro', (id, macro) => {
  console.log('[MACRO]', id, macro.someRandomOtherDataToPass) // shoulders 42
});

// `await` is optional here and the return value doesn't tell you much.
// i.e. device file is present but not necessarily inputting or the correct file
await device.connect();

