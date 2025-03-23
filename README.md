# Event Device Wrapper

## Usage

Quick start: ./samples/basic.js
```javascript
import { Device } from '../dist/index.js';

const device = new Device({
  path: "test_data/face_buttons.bin",
});

device.on('state-change', (state) => {
  console.log('[INPUT]', state.input, state.state) // LeftBumper Pressed
});

// Usually not required but we're reading from a file that ends,
//  which usually means a device has disconnected.
device.autoReconnect = false;

// `await` is optional here and the return value doesn't tell you much.
// i.e. device file is present but not necessarily inputting or the correct file
await device.connect();
```
