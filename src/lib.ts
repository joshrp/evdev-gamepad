
import type { EvdevEvent } from './types.js';
import * as evTypes from './ev_types.js';

const is64Bit = process.arch.includes('64');
export const parseBuffer = (buf: Buffer): EvdevEvent => {
  const ev: EvdevEvent = {
    time: {
      tv_sec: 0,
      tv_usec: 0
    },
    type: "UNKNOWN",
    code: "UNKNOWN",
    value: 0
  };
  let low = 0;
  let offset = 0;
  if (is64Bit) {
    low = buf.readInt32LE(0);
    ev.time.tv_sec = buf.readInt32LE(4) * 4294967296.0 + low;
    if (low < 0) ev.time.tv_sec += 4294967296;
    low = buf.readInt32LE(8);
    ev.time.tv_usec = buf.readInt32LE(12) * 4294967296.0 + low;
    if (low < 0) ev.time.tv_usec += 4294967296;
    offset = 16;
  } else {
    ev.time.tv_sec = buf.readInt32LE(0);
    ev.time.tv_usec = buf.readInt32LE(4);
    offset = 8;
  }

  ev.value = buf.readInt32LE(offset + 4);

  // Stupid `as` to cast value of an enum indexed by value equal to it's list of keys
  const typeVal = buf.readUInt16LE(offset);
  if (typeVal in evTypes.EV_TYPE) {
    ev.type = evTypes.EV_TYPE[typeVal as keyof typeof evTypes.EV_TYPE];

    const code = buf.readUInt16LE(offset + 2);
    if (ev.type in evTypes.codes) {
      const key = ev.type as keyof typeof evTypes.codes
      if (code in evTypes.codes[key]) {
        ev.code = evTypes.codes[key][code as keyof typeof evTypes.codes[typeof key]];
      }
    }
  }

  return ev;
};
