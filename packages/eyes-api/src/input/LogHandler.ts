import * as utils from '@applitools/utils'

export type LogSettings = {
  verbose: boolean
  type: string
  options?: Record<string, any>
}

export default class LogSettingsData implements Required<LogSettings> {
  private _verbose: boolean
  private _type: string
  private _options: Record<string, any>
  constructor(settings: LogSettings)
  constructor(verbose?: boolean, type?: string, options?: Record<string, any>)
  constructor(settingsOrVerbose: LogSettings | boolean = false, type?: string, options?: Record<string, any>) {
    if (utils.types.isBoolean(settingsOrVerbose)) {
      return new LogSettingsData({verbose: settingsOrVerbose, type, options})
    }
    this._verbose = Boolean(settingsOrVerbose.verbose)
    this._type = settingsOrVerbose.type
    this._options = settingsOrVerbose.options
  }

  get verbose(): boolean {
    return this._verbose
  }
  set verbose(verbose: boolean) {
    this._verbose = Boolean(verbose)
  }
  getIsVerbose() {
    return this._verbose
  }
  setIsVerbose(verbose: boolean) {
    this.verbose = verbose
  }

  get type(): string {
    return this._type
  }

  get options(): Record<string, any> {
    return this._options
  }

  toJSON(): LogSettings {
    return utils.general.toJSON(this, ['verbose', 'type', 'options'])
  }

  toString(): string {
    return utils.general.toString(this)
  }
}

export class FileLogSettingsData extends LogSettingsData {
  constructor(verbose: boolean, filename = 'eyes.log', append = true) {
    super(verbose, 'file', {filename, append})
  }
}
