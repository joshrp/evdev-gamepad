import { accessSync, createReadStream, fstat, ReadStream, watch } from "node:fs";
import { EventEmitter } from "node:stream";
import { parseBuffer } from ".";
import { BaseMapping } from "./mapping";
import { MappingClass } from "./types";
import constants from "node:constants";
import path from "node:path";

export class Device extends EventEmitter {
  private inputPath: string;
  private name: string;
  private mapping: MappingClass;

  public autoReconnect = true;

  constructor(options: { path: string, name: string, mapping?: MappingClass }) {
    super();

    this.inputPath = options.path;
    this.name = options.name;
    this.mapping = options.mapping || new BaseMapping();
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
      this.emit('connect', this.name);
    });

    stream.on('data', (buf: any) => {
      const chunk = 24;

      for (let i = 0, j = buf.length; i < j; i += chunk) {
        const event = parseBuffer(buf.slice(i, i + chunk));
        if (event.type == 'EV_MSC') {
          continue;
        }

        // TODO:: Buffer events up to a SYNC and then send?

        if (event.type in this.mapping) {
          if (event.code in this.mapping[event.type]) {
            const map = this.mapping[event.type][event.code];
            const resp = map.map.bind(this.mapping)(map.input, event.value);
            if (resp)
              resp.map(e => this.emit('input', e));
          } else {
            console.debug('Unhandled event code', event.code, 'for type', event.type);
          }
        } else {
          console.debug('Unhandled event type', event.type);
        }
      }
    })

    const connectionDropped = () => {
      this.emit('disconnect');
      stream.close();
      if (this.autoReconnect)
        this.connect();
    };

    stream.on('error', (e) => {
      console.error('stream error', e);
      connectionDropped();
    }).on('close', () => {
      // console.log('closed stream');
      connectionDropped();
    }).on('end', () => {
      // console.log('end of stream');
      connectionDropped();
    });

    return true;
  }
}
