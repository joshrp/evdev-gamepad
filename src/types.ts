import { codes } from "./ev_types";

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

type MappingFunction = (input: Input, value: number) => ControllerEvent[] | null;
type ButtonMap = {
  input: Input,
  map: MappingFunction
}
type ValuesOf<T> = T[keyof T];
export interface MappingClass {
  EV_ABS: Partial<Record<ValuesOf<typeof codes.EV_ABS>, ButtonMap>>;
  EV_KEY: Partial<Record<ValuesOf<typeof codes.EV_KEY>, ButtonMap>>;
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

export const Sticks = [Input.LeftStickX, Input.LeftStickY, Input.RightStickX, Input.RightStickY];
export const DPad = [Input.DPadX , Input.DPadY];
export const Triggers = [Input.LeftTrigger , Input.RightTrigger];
export const FaceButtons = [Input.South , Input.East , Input.West , Input.North];
export const Bumpers = [Input.LeftBumper , Input.RightBumper];
export const Options = [Input.Back , Input.Platform , Input.Start];

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
