export type EvdevEvent = {
  time: {
    tv_sec: number,
    tv_usec: number
  },
  type: string,
  code: string,
  value: number
}
export type ControllerEvent = {
  type: "button" | "stick",
  input: Input,
  state: State,
}

export interface MappingClass {
  mapEvent: (event: EvdevEvent) => ControllerEvent[] | null;
}

export enum Input {
  South = 'South',
  East = 'East',
  West = 'West',
  North = 'North',
  Back = 'Back',
  Platform = 'Platform',
  Start = 'Start',
  LeftThumb = 'LeftThumb',
  RightThumb = 'RightThumb',
  LeftBumper = 'LeftBumper',
  RightBumper = 'RightBumper',
  DPadX = 'DPadX',
  DPadY = 'DPadY',
  RightTrigger = 'RightTrigger',
  LeftTrigger = 'LeftTrigger',
  LeftStickX = 'LeftStickX',
  LeftStickY = 'LeftStickY',
  RightStickX = 'RightStickX',
  RightStickY = 'RightStickY',
  Unknown = 'Unknown',
  Ignore = 'Ignore'
};

export enum State {
  Released = 'Released',
  Neutral = 'Neutral',
  Pressed = 'Pressed',
  Left = 'Left',
  Right = 'Right',
  Up = 'Up',
  Down = 'Down'
}

export type ButtonState = { state: State, input: Input }
export type ButtonStates = Record<Input, ButtonState>

export type MacroConfig = {
  inputs: Pick<ControllerEvent, 'input' | 'state'>[],
  exclusive: boolean,
}
