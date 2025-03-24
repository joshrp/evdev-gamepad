# Event Device Gamepad
Receive events for gamepad-like devices using evdev files. Deals with:
- Input parsing
- Normalisation
- Reconnection handling
- Input state tracking
- Watching for Macros

**Does NOT** deal with:
- Device discovery
- Bluetooth pairing
- Device Identification


## Usage

`Device` is the main class, it is an extension of `EventEmitter` and emits the following events:
- `state-change` - When an input state changes
- `macro` - When a macro is triggered
- `connected` - When a device is being read and events should be received
- `disconnected` - When a device is no longer being read and events should not be received


### Quick start
Output parsed events from a device. `./samples/basic.js`
```javascript
import { Device } from 'evdev-gamepad';

const device = new Device({
  // Change this to your /dev/input/ device
  path: "test_data/face_buttons.bin",
});

device.on('state-change', (state) => {
  console.log('[INPUT]', state.input, state.state)
  // Outputs `[INPUT] LeftBumper Pressed`
});

// `await` is optional here
await device.connect();
```

### Macros
Receive an event when a series of buttons are pressed:
```javascript
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
```


