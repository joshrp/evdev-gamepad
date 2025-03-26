export { Device } from "./Device.js";

import { EchoMapping } from "./mappings/echoMap.js";
import { PS5Mapping } from "./mappings/PS5Mapping.js";
import { SwitchProMapping } from "./mappings/SwitchProMapping.js";
export { BaseMapping } from "./mapping.js";
export { Input, State, type MacroConfig, type MappingClass } from "./types.js";

export const Mappings = {
  EchoMapping,
  PS5Mapping,
  SwitchProMapping
}
