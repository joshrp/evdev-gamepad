
import { describe, expect, test } from "bun:test";
import { Device, MacroConfig } from "./Device";
import path from "path";
import { ControllerEvent, Input, State } from "./types";

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
        name: test_file + "_test",
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

      controller.autoReconnect = false;
      expect(await controller.connect()).toBeTrue();
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
          name: test_file + "_test",
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

        controller.autoReconnect = false;
        expect(await controller.connect()).toBeTrue();
      });
    }, 100);
});
