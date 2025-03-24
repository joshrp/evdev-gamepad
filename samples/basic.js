import { Device } from 'evdev-gamepad';

const device = new Device({
  // Change this to /dev/input/event{X} for your device
  path: "test_data/face_buttons.bin"
});

device.on('state-change', (state) => {
  console.log('[INPUT]', state.input, state.state) // LeftBumper Pressed
});

// `await` is optional here and the return value doesn't tell you much.
// i.e. device file is present but not necessarily inputting or the correct file
await device.connect();
