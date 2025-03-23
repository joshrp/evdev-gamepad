import { accessSync, createReadStream, ReadStream, watch, constants, statSync } from "node:fs";
import * as path from "node:path";
import { EventEmitter } from "node:events";

import { parseBuffer } from "./lib.js";
import { BaseMapping, getDefaultStates } from "./mapping.js";

import {
  State,
  type ButtonStates,
  type ControllerEvent,
  type Input,
  type MacroConfig,
  type MappingClass
} from "./types.js";

type DeviceEvents = {
  'connect': () => void;
  'disconnect': () => void;
  'state-change': (event: ControllerEvent) => void;
  'macro': (id: string, config: MacroConfig) => void;
}

enum FileType {
  Normal,
  Special,
}

export class Device extends EventEmitter {
  private inputPath: string;
  private mapping: MappingClass;
  private currentStream: ReadStream | null = null;

  public ignoreFileType: boolean = false;
  public buttonStates: ButtonStates;
  public reconnectDelay: number = 500;
  public autoReconnect = true;

  public macros: {
    [id: string]: MacroConfig
  } = {};

  constructor(options: {
    /**
     * Path to the device file, absolute path recommended
     */
    path: string,
    /**
     * Mapping class to use for this device
     * @default BaseMapping
     */
    mapping?: MappingClass
  }) {
    super();

    this.inputPath = options.path;
    this.mapping = options.mapping || new BaseMapping();

    this.buttonStates = getDefaultStates();
  }

  on<T extends keyof DeviceEvents, K extends DeviceEvents[T]>(event: T, listener: K): this {
    return super.on(event, listener);
  };

  waitForFile(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const watcher = watch(path.dirname(this.inputPath), { persistent: true, recursive: false });
      watcher.on('change', (event, filename) => {
        if (event == 'change' && filename === path.basename(this.inputPath)) {
          watcher.close();
          resolve(true);
        }
      });
      watcher.on('error', (e) => {
        watcher.close();
        reject(e);
      });
    });
  }

  fileExists() {
    let fType: FileType | false = false;
    try {
      accessSync(this.inputPath, constants.R_OK);
      const stats = statSync(this.inputPath);
      if (stats.size === 0) {
        fType = FileType.Special;
      } else {
        fType = FileType.Normal;
      }
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        fType = false;
      } else {
        throw e;
      }
    }
    return fType;
  }

  async connect() {
    let fType = await this.fileExists();
    if (fType === false)
      await this.waitForFile();

    const stream = createReadStream(this.inputPath, {
      flags: "r",
      autoClose: true,
    });

    stream.on('open', () => {
      console.debug(`Device file opened ${this.inputPath}. Restting Buttons`);
      this.buttonStates = getDefaultStates();
      this.emit('connect');
    });

    stream.on('data', (buf: any) => {
      const chunkSize = 24;

      for (let i = 0, j = buf.length; i < j; i += chunkSize) {
        const event = parseBuffer(buf.slice(i, i + chunkSize));
        const inputs = this.mapping.mapEvent(event);

        // TODO:: Buffer events up to a SYNC and then send?
        inputs?.forEach((e) => {
          if (this.buttonStates[e.input].state !== e.state) {
            this.buttonStates[e.input].state = e.state;
            this.emit('state-change', e);
            this.checkMacros(e);
          }
        });
      }
    });

    const connectionDropped = () => {
      this.emit('disconnect');
      stream.close();

      if (this.autoReconnect) {
        if (this.ignoreFileType == true || fType === FileType.Special) {
          setTimeout(() => this.connect(), this.reconnectDelay);
        } else {
          console.debug('File does not look like a device file. Not reconnecting');
          return;
        }
      }
    };

    stream.on('error', (e) => {
      console.error('Device file stream error', e);
      connectionDropped();
    }).on('close', () => {
      // console.log('closed stream');
      connectionDropped();
    }).on('end', () => {
      // console.log('end of stream');
      connectionDropped();
    });

    this.currentStream = stream;
    return true;
  }

  checkMacros(trigger: ControllerEvent) {

    const nonNeutral: Input[] = [];
    type buttonKey = keyof typeof this.buttonStates;
    for (const input in this.buttonStates) {
      const state = this.buttonStates[input as buttonKey].state;
      if (state !== State.Neutral && state !== State.Released) {
        nonNeutral.push(input as buttonKey);
      }
    }
    nonNeutral.sort();

    const checkOnly = (inputs: Input[]) => {
      return nonNeutral.length === inputs.length && inputs.filter(i => nonNeutral.includes(i)).length === inputs.length;
    }

    for (const id in this.macros) {
      const macro = this.macros[id];
      // If it's exclusive, make sure everything else is neutral
      if (macro.exclusive && !checkOnly(macro.inputs.map(i => i.input)))
        continue;

      let matchesStates = true;
      let triggerPresent = false;
      for (const { input, state } of macro.inputs) {
        if (!(input in this.buttonStates)) {
          console.debug('Invalid macro', id)
          break
        }
        if (this.buttonStates[input].state !== state) {
          matchesStates = false;
          break;
        }

        if (input === trigger.input && state === trigger.state) {
          triggerPresent = true;
          break;
        }
      }

      // If it's exclusive, make sure the current trigger for this check is actually one of the inputs involved.
      // This prevents knocking the thumb stick causing it to re-fire an unrelated macro
      if (macro.exclusive && !triggerPresent)
        continue;

      if (matchesStates) {
        this.emit('macro', id, macro);
      }
    }
    return;
  }

  /**
   * Only intended for test use
   * @private
   */
  __closeStream() {
    this.currentStream?.close();
  }
}
