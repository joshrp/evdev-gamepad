import { accessSync, createReadStream, ReadStream, watch } from "node:fs";
import { EventEmitter } from "node:stream";
import { parseBuffer } from ".";
import { BaseMapping, getDefaultStates } from "./mapping";
import { ButtonStates, ControllerEvent, Input, MappingClass, State } from "./types";
import constants from "node:constants";
import path from "node:path";
import TypedEventEmitter from "typed-emitter";

export type MacroConfig = {
  inputs: Pick<ControllerEvent, 'input' | 'state'>[],
  exclusive: boolean,
}

type DeviceEvents = {
  'connect': () => void;
  'disconnect': () => void;
  'state-change': (event: ControllerEvent) => void;
  'macro': (id: string, MacroConfig) => void;
}
export class Device extends (EventEmitter as new () => TypedEventEmitter<DeviceEvents>) {
  private inputPath: string;
  private name: string;
  private mapping: MappingClass;
  private currentStream: ReadStream | null = null;

  public buttonStates: ButtonStates;
  public reconnectDelay: number = 500;
  public autoReconnect = true;

  public macros: {
    [id: string]: MacroConfig
  } = {};


  constructor(options: { path: string, name: string, mapping?: MappingClass }) {
    super();

    this.inputPath = options.path;
    this.name = options.name;
    this.mapping = options.mapping || new BaseMapping();

    this.buttonStates = getDefaultStates();
  }

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

  fileExists(): boolean {
    let exists = false;
    try {
      accessSync(this.inputPath, constants.R_OK);
      exists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        exists = false;
      } else {
        throw e;
      }
    }
    return exists;
  }

  async connect() {
    let exists = await this.fileExists();
    if (!exists)
      await this.waitForFile();

    const stream = createReadStream(this.inputPath, {
      flags: "r",
      autoClose: true,
    });

    stream.on('open', (fd) => {
      console.debug('File opened, resetting button states');
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
      if (this.autoReconnect)
        setTimeout(() => this.connect(), this.reconnectDelay);
    };

    stream.on('error', (e) => {
      console.error('stream error', e);
      connectionDropped();
    }).on('close', () => {
      console.log('closed stream');
      connectionDropped();
    }).on('end', () => {
      console.log('end of stream');
      connectionDropped();
    });
    this.currentStream = stream;
    return true;
  }

  checkMacros(trigger: ControllerEvent) {

    const nonNeutral: Input[] = [];
    for (const input in this.buttonStates) {
      const state = this.buttonStates[input].state;
      if (state !== State.Neutral && state !== State.Released) {
        nonNeutral.push(input as keyof typeof this.buttonStates);
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
