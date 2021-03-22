import {ConsoleHandler, FileHandler, CustomHandler} from '@applitools/logger'

export type LogSettings = ConsoleHandler | FileHandler | CustomHandler

export abstract class LogHandler {
  private _verbose: boolean

  constructor(verbose = false) {
    this._verbose = verbose
  }

  get verbose() {
    return this._verbose
  }
  set verbose(verbose: boolean) {
    this._verbose = verbose
  }
  getIsVerbose(): boolean {
    return this._verbose
  }
  setIsVerbose(verbose: boolean) {
    this.verbose = verbose
  }

  abstract onMessage(message: string): void

  abstract open(): void

  abstract close(): void

  /** @internal */
  toObject(): LogSettings {
    return {
      log: this.onMessage.bind(this),
      open: this.open.bind(this),
      close: this.close.bind(this),
    }
  }
}

export class FileLogHandler extends LogHandler {
  private _filename: string
  private _append: boolean

  constructor(verbose?: boolean, filename = 'eyes.log', append = true) {
    super(verbose)
    this._filename = filename
    this._append = append
  }

  onMessage(): void {
    return undefined
  }

  open(): void {
    return undefined
  }

  close(): void {
    return undefined
  }

  toObject(): LogSettings {
    return {type: 'file', filename: this._filename, append: this._append}
  }
}

export class ConsoleLogHandler extends LogHandler {
  onMessage(): void {
    return undefined
  }

  open(): void {
    return undefined
  }

  close(): void {
    return undefined
  }

  toObject(): LogSettings {
    return {type: 'console'}
  }
}

export class NullLogHandler extends LogHandler {
  onMessage(): void {
    return undefined
  }

  open(): void {
    return undefined
  }

  close(): void {
    return undefined
  }

  toObject(): LogSettings {
    return null
  }
}
