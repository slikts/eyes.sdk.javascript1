import type * as types from '@applitools/types'
import type {ChildProcess} from 'child_process'
import type {Driver, Element, Selector, TransformedDriver, TransformedElement, TransformedSelector} from './spec-driver'
import * as spec from './spec-driver'
import {spawn} from 'child_process'
import {Socket} from './socket'

type ClientSocket = Socket &
  types.ClientSocket<TransformedDriver, TransformedDriver, TransformedElement, TransformedSelector>

export class UniversalClient implements types.Core<Driver, Element, Selector> {
  private _server: ChildProcess
  private _socket: ClientSocket

  constructor() {
    this._server = spawn(`./node_modules/@applitools/eyes-universal/bin/cli-macos`, ['--port=2107'], {
      detached: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    this._socket = new Socket()

    this._server.unref() // important: this allows the client process to exit without hanging, while the server process still runs

    // specific to JS: we are able to listen to stdout for the first line, then we know the server is up, and we even can get its port in case it wasn't passed
    this._server.stdout.once('data', data => {
      this._server.stdout.destroy()
      const [port] = String(data).split('\n', 1)
      this._socket.connect(`http://localhost:${port}/eyes`)
      // this._socket.unref() // important: this allows the client process to exit without hanging, while the server process still runs
      this._socket.emit('Session.init', {protocol: 'webdriver'})
    })

    this._socket.command('Driver.isEqualElements', async () => {
      return null
    })
  }

  isDriver(driver: any): driver is Driver {
    return spec.isDriver(driver)
  }

  isElement(element: any): element is Element {
    return spec.isElement(element)
  }

  isSelector(selector: any): selector is Selector {
    return spec.isSelector(selector)
  }

  async makeManager(config?: types.EyesManagerConfig): Promise<EyesManager> {
    console.log('here')

    const manager = await this._socket.request('Core.makeManager', config)
    console.log('here')

    return new EyesManager({manager, socket: this._socket})
  }

  async getViewportSize({driver}: {driver: Driver}): Promise<types.Size> {
    return this._socket.request('Core.getViewportSize', {
      driver: await spec.transformDriver(driver),
    })
  }

  async setViewportSize({driver, size}: {driver: Driver; size: types.Size}): Promise<void> {
    return this._socket.request('Core.setViewportSize', {
      driver: await spec.transformDriver(driver),
      size,
    })
  }

  async closeBatches(options: any): Promise<void> {
    return this._socket.request('Core.closeBatch', options)
  }

  async deleteTest(options: any): Promise<void> {
    return this._socket.request('Core.deleteTest', options)
  }

  // for testing purposes
  async closeServer() {
    return this._server.kill()
  }
}

export class EyesManager implements types.EyesManager<Driver, Element, Selector> {
  private _manager: types.Ref
  private _socket: ClientSocket

  constructor({manager, socket}: any) {
    this._manager = manager
    this._socket = socket
  }

  async makeEyes({driver, config}: {driver: Driver; config?: types.EyesConfig<Element, Selector>}): Promise<Eyes> {
    const eyes = await this._socket.request('EyesManager.makeEyes', {
      manager: this._manager,
      driver: await spec.transformDriver(driver),
      config: config, //this._refer.ref(config),
    })
    return new Eyes({eyes, socket: this._socket})
  }

  async closeAllEyes(): Promise<types.TestResult[]> {
    return this._socket.request('EyesManager.closeAllEyes', {manager: this._manager})
  }
}

// not to be confused with the user-facing Eyes class
export class Eyes implements types.Eyes<Element, Selector> {
  private _eyes: types.Ref
  private _socket: ClientSocket

  constructor({eyes, socket}: any) {
    this._eyes = eyes
    this._socket = socket
  }

  check({
    settings,
    config,
  }: {
    settings: types.CheckSettings<Element, Selector>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<types.MatchResult> {
    return this._socket.request('Eyes.check', {
      eyes: this._eyes,
      settings: settings, // this._refer.ref(settings, this._eyes),
      config: config, // this._refer.ref(config, this._eyes),
    })
  }

  locate<TLocator extends string>({
    settings,
    config,
  }: {
    settings: types.LocateSettings<TLocator>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<Record<TLocator, types.Region[]>> {
    return this._socket.request('Eyes.locate', {
      eyes: this._eyes,
      settings,
      config: config, //this._refer.ref(config, this._eyes),
    })
  }

  extractTextRegions<TPattern extends string>({
    settings,
    config,
  }: {
    settings: types.OCRSearchSettings<TPattern>
    config?: types.EyesConfig<Element, Selector>
  }): Promise<Record<TPattern, types.TextRegion[]>> {
    return this._socket.request('Eyes.extractTextRegions', {
      eyes: this._eyes,
      settings,
      config: config, // this._refer.ref(config, this._eyes),
    })
  }

  extractText({
    regions,
    config,
  }: {
    regions: types.OCRExtractSettings<Element, Selector>[]
    config?: types.EyesConfig<Element, Selector>
  }): Promise<string[]> {
    return this._socket.request('Eyes.extractText', {
      eyes: this._eyes,
      regions: regions, // this._refer.ref(regions),
      config: config, // this._refer.ref(config),
    })
  }

  close() {
    return this._socket.request('Eyes.close', {eyes: this._eyes})
  }

  abort() {
    return this._socket.request('Eyes.abort', {eyes: this._eyes})
  }
}
