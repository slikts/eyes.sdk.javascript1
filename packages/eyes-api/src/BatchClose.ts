import * as utils from '@applitools/utils'
import {ProxySettings} from './input/ProxySettings'

type CloseBatchOptions = {
  batchIds: string[]
  serverUrl?: string
  apiKey?: string
  proxy?: ProxySettings
}

type BatchCloseSpec = {
  closeBatch(options: CloseBatchOptions): Promise<void>
}

export function closeBatch(spec: BatchCloseSpec): (options: CloseBatchOptions) => Promise<void> {
  return (options: CloseBatchOptions) => {
    utils.guard.notNull(options.batchIds, {name: 'options.batchIds'})
    return spec.closeBatch({
      batchIds: options.batchIds,
      serverUrl: options.serverUrl,
      apiKey: options.apiKey,
      proxy: options.proxy,
    })
  }
}

export class BatchClose {
  protected readonly _spec: BatchCloseSpec
  private _batchIds: string[]
  private _serverUrl?: string
  private _apiKey?: string
  private _proxy?: ProxySettings
  private _logger?: unknown

  constructor(logger?: unknown) {
    this._logger = logger
  }

  async close() {
    utils.guard.notNull(this._batchIds, {name: 'batchIds'})
    return this._spec.closeBatch({
      batchIds: this._batchIds,
      serverUrl: this._serverUrl,
      apiKey: this._apiKey,
      proxy: this._proxy,
    })
  }

  setBatchIds(batchIds: string[]): this {
    this._batchIds = batchIds
    return this
  }

  setUrl(serverUrl: string): this {
    this._serverUrl = serverUrl
    return this
  }

  setApiKey(apiKey: string): this {
    this._apiKey = apiKey
    return this
  }

  setProxy(proxy: ProxySettings): this {
    this._proxy = proxy
    return this
  }
}
