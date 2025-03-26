import { BaseMapping, ButtonMappingBasic } from "../mapping.js";
import { Input } from "../types.js";

export class SwitchProMapping extends BaseMapping {
  public STICK_DEADZONE = 20000;
  public STICK_MAX = 32000;
  public STICK_CENTRE = 0;

  EV_ABS: {[key: string]: ButtonMappingBasic} = {
    ABS_X: { input: Input.LeftStickX, map: this.StickEvent },
    ABS_Y: { input: Input.LeftStickY, map: this.StickEvent },
    ABS_RX: { input: Input.RightStickX, map: this.StickEvent },
    ABS_RY: { input: Input.RightStickY, map: this.StickEvent },
    ABS_HAT0X: { input: Input.DPadX, map: this.DPadEvent },
    ABS_HAT0Y: { input: Input.DPadY, map: this.DPadEvent },
  }

  EV_KEY: {[key: string]: ButtonMappingBasic} = {
    BTN_A: { input: Input.South, map: this.ButtonEvent },
    BTN_B: { input: Input.East, map: this.ButtonEvent },
    BTN_X: { input: Input.North, map: this.ButtonEvent },
    BTN_Y: { input: Input.West, map: this.ButtonEvent },
    BTN_TL: { input: Input.LeftBumper, map: this.ButtonEvent },
    BTN_TR: { input: Input.RightBumper, map: this.ButtonEvent },
    BTN_TR2: { input: Input.RightTrigger, map: this.ButtonEvent },
    BTN_TL2: { input: Input.LeftTrigger, map: this.ButtonEvent },
    BTN_SELECT: { input: Input.Back, map: this.ButtonEvent },
    BTN_START: { input: Input.Start, map: this.ButtonEvent },
    BTN_THUMBL: { input: Input.LeftThumb, map: this.ButtonEvent },
    BTN_THUMBR: { input: Input.RightThumb, map: this.ButtonEvent },
    BTN_MODE: { input: Input.Platform, map: this.ButtonEvent },
    BTN_Z: { input: Input.Share, map: this.ButtonEvent },
  };

}
