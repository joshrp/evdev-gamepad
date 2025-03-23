
import { Device, Input, State, MacroConfig } from "../src/index";
import { EchoMapping } from "../src/mappings/echoMap.js";
import * as path from "path";

describe("Input Parsing for", () => {
  test.each([
    ["face_buttons.bin", [
      [Input.South, State.Pressed],
      [Input.South, State.Released],
      [Input.East, State.Pressed],
      [Input.East, State.Released],
      [Input.North, State.Pressed],
      [Input.North, State.Released],
      [Input.West, State.Pressed],
      [Input.West, State.Released],
    ]],
    ["bumpers_options.bin", [
      [Input.LeftBumper, State.Pressed],
      [Input.LeftBumper, State.Released],
      [Input.RightBumper, State.Pressed],
      [Input.RightBumper, State.Released],
      [Input.Start, State.Pressed],
      [Input.Start, State.Released],
      [Input.Back, State.Pressed],
      [Input.Back, State.Released],
      [Input.Platform, State.Pressed],
      [Input.Platform, State.Released],
    ]],
    ["sticks.bin", [
      [Input.LeftStickX, State.Left],
      [Input.LeftStickX, State.Neutral],
      [Input.LeftStickY, State.Up],
      [Input.LeftStickY, State.Neutral],
      [Input.LeftStickX, State.Right],
      [Input.LeftStickX, State.Neutral],
      [Input.LeftStickY, State.Down],
      [Input.LeftStickY, State.Neutral],
      [Input.LeftThumb, State.Pressed],
      [Input.LeftThumb, State.Released],
      [Input.RightStickX, State.Left],
      [Input.RightStickX, State.Neutral],
      [Input.RightStickY, State.Up],
      [Input.RightStickY, State.Neutral],
      [Input.RightStickX, State.Right],
      [Input.RightStickX, State.Neutral],
      [Input.RightStickY, State.Down],
      [Input.RightStickY, State.Neutral],
      [Input.RightThumb, State.Pressed],
      [Input.RightThumb, State.Released],
    ]],
    ["dpad_triggers.bin", [
      [Input.DPadX, State.Left],
      [Input.DPadX, State.Neutral],
      [Input.DPadY, State.Up],
      [Input.DPadY, State.Neutral],
      [Input.DPadX, State.Right],
      [Input.DPadX, State.Neutral],
      [Input.DPadY, State.Down],
      [Input.DPadY, State.Neutral],
      [Input.LeftTrigger, State.Pressed],
      [Input.LeftTrigger, State.Released],
      [Input.RightTrigger, State.Pressed],
      [Input.RightTrigger, State.Released],
    ]],
  ])("%p", (test_file, expButtons) => {
    return new Promise(async (resolve) => {
      const controller = new Device({
        path: path.join(__dirname, "..", "test_data", test_file),
      });

      const changes: string[][] = [];
      controller.on('state-change', (event) => {
        changes.push([event.input, event.state]);
      });

      controller.on('disconnect', () => {
        try {
          expect(changes).toEqual(expButtons);
        } catch (e) {
          throw e
        } finally {
          resolve(null);
        }
      });

      expect(await controller.connect()).toBeTruthy();
    });

  }, 100);
});

describe('Macros', () => {
  test.each([
    [
      "macro_easy.bin",
      {
        inputs: [
          {
            input: Input.LeftBumper,
            state: State.Pressed
          },
          {
            input: Input.LeftBumper,
            state: State.Pressed
          },
          {
            input: Input.Platform,
            state: State.Pressed
          },
        ],
        exclusive: true,
      },
      1
    ],
    [
      "macro_exclusive_checks.bin",
      {
        inputs: [
          {
            input: Input.LeftBumper,
            state: State.Pressed
          },
          {
            input: Input.LeftBumper,
            state: State.Pressed
          },
          {
            input: Input.Platform,
            state: State.Pressed
          },
        ],
        exclusive: true,
      },
      1
    ]
  ])('Should emit a single event for a Macro %s', (test_file, macro: MacroConfig, callCount) => {
    return new Promise(async (resolve) => {
      const controller = new Device({
        path: path.join(__dirname, "..", "test_data", test_file),
      });

      let called = 0;
      controller.macros[test_file] = macro;

      controller.on('macro', (id, config) => {
        try {
          expect(id).toEqual(test_file);
          expect(config).toEqual(macro);
          called++;
        } catch (e) {
          throw e
        }
      });

      controller.on('disconnect', () => {
        try {
          expect(called).toEqual(callCount);
        } catch (e) {
          throw e
        } finally {
          resolve(null);
        }
      });

      expect(await controller.connect()).toBeTruthy();
    });
  }, 100);
});

describe('Auto Reconnect', () => {
  test('Should reconnect after disconnect', () => {
    return new Promise(async (resolve) => {
      const controller = new Device({
        path: path.join(__dirname, "..", "test_data", "sticks.bin"),
      });

      let connectCount = 0;
      controller.on('connect', () => {
        connectCount++;
        // console.log("TEST Connect now", connectCount);
      });
      controller.on('disconnect', () => {
        // console.log("TEST Disconnect");
      });
      // Test data file aren't character device files so normally connecting would be skipped
      controller.ignoreFileType = true;

      const waitFor = (count: number, timeout: number) => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            if (connectCount >= count) {
              clearInterval(interval);
              clearTimeout(timer);
              resolve(null);
            }
          }, 1);

          const timer = setTimeout(() => {
            clearInterval(interval);
            if (connectCount < count) reject('Timeout');
            else resolve(null);
          }, timeout);
        });
      }

      try {
        controller.autoReconnect = true;
        controller.reconnectDelay = 100;
        expect(await controller.connect()).toBeTruthy();

        await waitFor(1, 200);
        expect(connectCount).toEqual(1);
        controller.__closeStream();

        await waitFor(2, 200);
        expect(connectCount).toEqual(2);
        controller.autoReconnect = false;

        controller.__closeStream();
        await new Promise((resolve) => setTimeout(resolve, 200));
        expect(connectCount).toEqual(2);

      } catch (e) {
        throw e;
      } finally {
        // Make sure we close so it doesn't hang forever.
        controller.__closeStream();
        resolve(null);
      }
    });
  });

});

describe('Echo Mapping', () => {
  it('Can accept a new "external" mapping', async () => {
    return new Promise(async (resolve, reject) => {
      let controller;
      try {
        controller = new Device({
          mapping: new EchoMapping(),
          path: path.join(__dirname, "..", "test_data", "face_buttons.bin"),
        });
        controller.on('disconnect', () => {
          resolve(null);
        });
        expect(await controller.connect()).toBeTruthy();
      } catch (e) {
        reject(e);
      } finally {
        controller?.__closeStream();
      }
    });
  });

});
