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
- Gamepad inputs (LEDs, Rumbles, FF etc.)

## Usage

`Device` is the main class, it is an extension of `EventEmitter` and emits the following events:
- `state-change` - When an input state changes
- `macro` - When a macro is triggered
- `connect` - When a device is being read and events should be received
- `disconnect` - When a device is no longer being read and events should not be received


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


## Mapping
The default `BaseMapping` is setup for an Xbox Series S controller.

Included is a mapping for `PS5Controller` and `SwitchProController` which can be used by passing the mapping to the `Device` constructor.

```javascript
import { Device, PS5Controller } from 'evdev-gamepad';

const device = new Device({
  path: "test_data/face_buttons.bin",
  mapping: PS5Controller
});

device.connect();
```

You can build your own mappings at the base level by implementing the `MappingClass` interface. There is only one function `mapEvent` that takes an EVDev "struct" and needs to return an `Input` and `State` (an array of them, in case of multiple inputs or sync event handling).

To help creating a mapping, use `EchoMapping` which will simply console log the evdev codes for anything you press.

### Motion controls / touch pads etc.
This library is organised around "Devices" as EVDev files because that's how controllers are represented in linux, this has some side effects like a PS5 controller is technically 3 devices, one for the traditional buttons and sticks, one for the touchpad and one for the motion controls.

To take input from all 3 you need to create 3 `Devices` so unfortunately macro's can't cross those boundaries.

### LEDs and Rumbles and Force Feedback
There is also no support for talking back to the controller. This library is intentionally simple and light weight. There's some simple ways to affect Rumble and LEDs but they quickly spiral in complexity and require whole drivers. These drivers already exist for a lot of controllers, use those instead.

- https://github.com/atar-axis/xpadneo
- https://github.com/nowrep/dualsensectl

