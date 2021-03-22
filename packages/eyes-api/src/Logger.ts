import * as utils from '@applitools/utils'
import logger, {Logger as ApplitoolsLogger} from '@applitools/logger'
import {LogHandler, LogHandlerData} from './input/LogHandler'

export class Logger {
  private _logger: ApplitoolsLogger
  private _handler: LogHandler
  private _show: boolean
  private _label: string

  constructor(options: {show?: boolean; label?: string; handler?: LogHandler})
  constructor(show: boolean)
  constructor(optionsOrShow: {show?: boolean; label?: string; handler?: LogHandler} | boolean = false) {
    if (utils.types.isBoolean(optionsOrShow)) {
      return new Logger({show: optionsOrShow})
    }
    this._show = optionsOrShow.show
    this._label = optionsOrShow.label
    this._handler = optionsOrShow.handler
  }

  getLogHandler() {
    this._handler
  }
  setLogHandler(handler: LogHandler) {
    this._handler = handler
  }

  verbose(...messages: any[]) {
    if (!this._logger) {
      this._logger = logger({
        handler: this._handler instanceof LogHandlerData ? this._handler.toJSON() : undefined,
        level: this._show ? 'info' : 'silent',
        label: this._label,
      })
    }
    messages.forEach(message => this._logger.log(message))
  }

  log(...messages: any[]) {
    if (!this._logger) {
      this._logger = logger({
        handler: this._handler instanceof LogHandlerData ? this._handler.toJSON() : undefined,
        level: this._show ? 'info' : 'silent',
        label: this._label,
      })
    }
    messages.forEach(message => this._logger.log(message))
  }

  extend(label?: string) {
    return new Logger({show: this._show, label, handler: this._handler})
  }
}
