
import { describe, expect, test } from "bun:test";
import { Device } from "./Device";
import path from "path";
import { Input, State } from "./types";

describe("input parser", () => {
  test.each([
    [ "face_buttons.bin", [
      [Input.South, State.Pressed],
      [Input.South, State.Released],
      [Input.East, State.Pressed],
      [Input.East, State.Released],
      [Input.North, State.Pressed],
      [Input.North, State.Released],
      [Input.West, State.Pressed],
      [Input.West, State.Released],
    ]],
    [ "bumpers_options.bin", [
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
    [ "sticks.bin", [
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
    [ "dpad_triggers.bin", [
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
        path: path.join(__dirname, "..","test_data", test_file),
        name: test_file + "_test",
      });

      const buttons: string[][] = [];
      controller.on('input', (event) => {
        buttons.push([event.input, event.state]);
      });

      controller.on('disconnect', () => {
        try {
          expect(buttons).toEqual(expButtons);
        } catch (e) {
          throw e
        } finally {
          resolve(null);
        }
      });

      controller.autoReconnect = false;
      expect(await controller.connect()).toBeTrue();
    });

  }, 50);
});
