import { ControllerEvent, EvdevEvent, MappingClass } from "../src/types";

/**
 * This mapping just spits out the EVDEV codes from the controller
 * Use it for figuring out a controller mapping or debugging
 */
export class EchoMapping implements MappingClass {
  public ignore = ['EV_SYN', 'EV_MSC'];

  constructor() {
    console.log('EchoMapping ignores EV_SYN and EV_MSC events by default');
  }
  mapEvent(event: EvdevEvent): ControllerEvent[] | null {
    if (this.ignore.includes(event.type)) {
      return null;
    }
    console.log(`EchoMapping: {${event.type}, ${event.code}, ${event.value}}`);
    return null;
  }
}
