import { Device, Input, State } from '../dist/index.js';

const device = new Device({
  // Change this to /dev/input/event{X} for your device
  path: "test_data/macro_easy.bin"
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
  console.log('[MACRO]', id, macro.someRandomOtherDataToPass)
  // Outputs: `shoulders 42`
});

// `await` is optional here
await device.connect();

