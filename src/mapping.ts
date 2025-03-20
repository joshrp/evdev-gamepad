import { ButtonStates, ControllerEvent, EvdevEvent, Input, MappingClass, State, Sticks } from "./types";

export class BaseMapping implements MappingClass {
  public STICK_DEADZONE = 20000;
  public STICK_MAX = 65536;
  public STICK_CENTRE = 65536 / 2
  public TRIGGER_TOLERANCE = 300;
  public EV_KEY_PRESSED_VALUE = 1;

  EV_ABS = {
    ABS_Z: { input: Input.RightStickX, map: this.StickEvent },
    ABS_RZ: { input: Input.RightStickY, map: this.StickEvent },
    ABS_X: { input: Input.LeftStickX, map: this.StickEvent },
    ABS_Y: { input: Input.LeftStickY, map: this.StickEvent },
    ABS_GAS: { input: Input.RightTrigger, map: this.TriggerEvent },
    ABS_BRAKE: { input: Input.LeftTrigger, map: this.TriggerEvent },
    ABS_HAT0X: { input: Input.DPadX, map: this.DPadEvent },
    ABS_HAT0Y: { input: Input.DPadY, map: this.DPadEvent },
  }

  EV_KEY = {
    BTN_A: { input: Input.South, map: this.ButtonEvent },
    BTN_B: { input: Input.East, map: this.ButtonEvent },
    BTN_X: { input: Input.West, map: this.ButtonEvent },
    BTN_Y: { input: Input.North, map: this.ButtonEvent },
    BTN_TL: { input: Input.LeftBumper, map: this.ButtonEvent },
    BTN_TR: { input: Input.RightBumper, map: this.ButtonEvent },
    BTN_SELECT: { input: Input.Back, map: this.ButtonEvent },
    BTN_START: { input: Input.Start, map: this.ButtonEvent },
    BTN_THUMBL: { input: Input.LeftThumb, map: this.ButtonEvent },
    BTN_THUMBR: { input: Input.RightThumb, map: this.ButtonEvent },
    BTN_MODE: { input: Input.Platform, map: this.ButtonEvent },
  };

  EV_SYN = {
    SYN_REPORT: { input: Input.Ignore, map: () => null },
    SYN_CONFIG: { input: Input.Ignore, map: () => null }
  }

  mapEvent(event: EvdevEvent): ControllerEvent[] | null {
    let resp: ControllerEvent[] = [];
    if (event.type == 'EV_MSC') {
      return resp;
    }

    const map = this[event.type]?.[event.code];
    resp = map?.map.bind(this)(map?.input, event.value);
    return resp;
  }

  StickEvent(input: Input, value: number): ControllerEvent[] | null {
    let state = value > this.STICK_CENTRE ? State.Down : State.Up;
    if (input === Input.LeftStickX || input === Input.RightStickX)
      state = value > this.STICK_CENTRE ? State.Right : State.Left;

    if (Math.abs(value - this.STICK_CENTRE) < this.STICK_DEADZONE)
      state = State.Neutral;

    return [{
      type: 'stick' as "stick",
      input: input,
      state: state
    }]
  }

  ButtonEvent(input: Input, value: number) {
    const state = value === this.EV_KEY_PRESSED_VALUE ? State.Pressed : State.Released;

    return [{
      type: "button" as "button",
      input: input,
      state: state
    }]
  }

  TriggerEvent(input: Input, value: number) {
    const state = value > this.TRIGGER_TOLERANCE ? State.Pressed : State.Released;

    return [{
      type: "button" as "button",
      input: input,
      state: state
    }]
  }

  DPadEvent(input: Input, value: number) {
    let state: State = State.Neutral;
    if(value === 1) {
      if (input === Input.DPadY) state = State.Down;
      else state = State.Right;
    } else if(value === -1) {
      if (input === Input.DPadY) state = State.Up;
      else state = State.Left;
    }

    return [{
      type: "button" as "button",
      input: input,
      state: state
    }]
  }
}

export function getDefaultStates(): ButtonStates {
  return {
    [Input.South]: { input: Input.South, state: State.Released },
    [Input.East]: { input: Input.East, state: State.Released },
    [Input.West]: { input: Input.West, state: State.Released },
    [Input.North]: { input: Input.North, state: State.Released },
    [Input.Back]: { input: Input.Back, state: State.Released },
    [Input.Platform]: { input: Input.Platform, state: State.Released },
    [Input.Start]: { input: Input.Start, state: State.Released },
    [Input.LeftThumb]: { input: Input.LeftThumb, state: State.Released },
    [Input.RightThumb]: { input: Input.RightThumb, state: State.Released },
    [Input.LeftBumper]: { input: Input.LeftBumper, state: State.Released },
    [Input.RightBumper]: { input: Input.RightBumper, state: State.Released },
    [Input.DPadX]: { input: Input.DPadX, state: State.Neutral },
    [Input.DPadY]: { input: Input.DPadY, state: State.Neutral },
    [Input.RightTrigger]: { input: Input.RightTrigger, state: State.Released },
    [Input.LeftTrigger]: { input: Input.LeftTrigger, state: State.Released },
    [Input.LeftStickX]: { input: Input.LeftStickX, state: State.Neutral },
    [Input.LeftStickY]: { input: Input.LeftStickY, state: State.Neutral },
    [Input.RightStickX]: { input: Input.RightStickX, state: State.Neutral },
    [Input.RightStickY]: { input: Input.RightStickY, state: State.Neutral },
    [Input.Unknown]: { input: Input.Unknown, state: State.Neutral },
    [Input.Ignore]: { input: Input.Ignore, state: State.Neutral },
  };
}
