import type * as types from '@applitools/types'
import type {ChildProcess} from 'child_process'
import type {Driver, Context, Element, Selector} from './spec-driver'
import type {Ref} from './refer'
import * as utils from '@applitools/utils'
import {spawn} from 'child_process'
import {SpecDriver} from './spec-driver'
import {Refer} from './refer'
import {Socket} from './socket'

const debug = require('debug')('applitools:client')

export class UniversalClient implements types.Core<Driver, Element, Selector> {
  private _server: ChildProcess
  private _socket: Socket<types.Ref<Driver>, types.Ref<Context>, types.Ref<Element>, Selector>
  private _spec: SpecDriver
  private _refer: Refer<Driver | Context | Element>

  static async connectToServer({port = 2107, path = './node_modules/bin/eyes-universal-linux'}: any) {
    return new Promise((resolve, _reject) => {
      debug('connect')
      const spec = new SpecDriver()
      const refer = new Refer(
        (value: any): value is Driver | Context | Element => spec.isDriver(value) || spec.isElement(value),
      )
      const socket = new Socket<types.Ref<Driver>, types.Ref<Context>, types.Ref<Element>, Selector>()

      const server = spawn(path, ['--port', port], {
        detached: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      server.unref() // important: this allows the client process to exit without hanging, while the server process still runs

      // specific to JS: we are able to listen to stdout for the first line, then we know the server is up, and we even can get its port in case it wasn't passed
      server.stdout.once('data', async data => {
        server.stdout.destroy()
        const [port] = String(data).split('\n', 1)
        await socket.connect(`http://localhost:${port}/eyes`)
        socket.unref() // important: this allows the client process to exit without hanging, while the server process still runs
        socket.emit('Session.init', {commands: Object.keys(spec.commands)})

        resolve(new UniversalClient({server, socket, refer, spec}))
      })

      socket.command('Driver.isEqualElements', async ({context, element1, element2}) => {
        return spec.isEqualElements(refer.deref(context), refer.deref(element1), refer.deref(element2))
      })
      socket.command('Driver.executeScript', async ({context, script, arg}) => {
        const result = await spec.executeScript(refer.deref(context), script, arg)
        return refer.ref(result, context)
      })
      socket.command('Driver.mainContext', async ({context}) => {
        const mainContext = await spec.mainContext(refer.deref(context))
        return refer.ref(mainContext, context)
      })
      socket.command('Driver.parentContext', async ({context}) => {
        const parentContext = await spec.parentContext(refer.deref(context))
        return refer.ref(parentContext, context)
      })
      socket.command('Driver.childContext', async ({context, element}) => {
        const childContext = await spec.childContext(refer.deref(context), refer.deref(element))
        return refer.ref(childContext, context)
      })
      socket.command('Driver.findElement', async ({context, selector}) => {
        const element = await spec.findElement(refer.deref(context), selector)
        return !utils.types.isNull(element) ? refer.ref(element, context) : element
      })
      socket.command('Driver.findElements', async ({context, selector}) => {
        const elements = await spec.findElements(refer.deref(context), selector)
        return elements.map(element => refer.ref(element, context))
      })
      socket.command('Driver.getViewportSize', async ({driver}) => {
        return spec.getViewportSize(refer.deref(driver))
      })
      socket.command('Driver.setViewportSize', async ({driver, size}) => {
        return spec.setViewportSize(refer.deref(driver), size)
      })
      socket.command('Driver.getTitle', async ({driver}) => {
        return spec.getTitle(refer.deref(driver))
      })
      socket.command('Driver.getUrl', async ({driver}) => {
        return spec.getUrl(refer.deref(driver))
      })
      socket.command('Driver.takeScreenshot', async ({driver}) => {
        return spec.takeScreenshot(refer.deref(driver))
      })
    })
  }

  constructor({server, socket, spec, refer}: any) {
    this._server = server
    this._socket = socket
    this._spec = spec
    this._refer = refer
  }

  // for testing purposes
  async closeServer() {
    return this._server.kill()
  }

  async makeManager(config?: types.Configs.EyesManagerConfig): Promise<EyesManager> {
    const manager = await this._socket.request('Core.makeManager', config)
    return new EyesManager({manager, refer: this._refer, socket: this._socket})
  }

  async getViewportSize({driver}: {driver: Driver}): Promise<types.Options.RectangleSize> {
    return this._socket.request('Core.getViewportSize', {driver: this._refer.ref(driver)})
  }

  async setViewportSize({driver, size}: {driver: Driver; size: types.Options.RectangleSize}): Promise<void> {
    return this._socket.request('Core.setViewportSize', {driver: this._refer.ref(driver), size})
  }

  async closeBatch(options: any): Promise<void> {
    return this._socket.request('Core.closeBatch', options)
  }

  async deleteTest(options: any): Promise<void> {
    return this._socket.request('Core.deleteTest', options)
  }
}

export class EyesManager implements types.EyesManager<Driver, Element, Selector> {
  private _manager: Ref
  private _socket: Socket<types.Ref<Driver>, types.Ref<Context>, types.Ref<Element>, Selector>
  private _refer: Refer<Driver | Context | Element>

  constructor({manager, refer, socket}: any) {
    this._manager = manager
    this._refer = refer
    this._socket = socket
  }

  async makeEyes({driver, config}: types.Configs.EyesMakeConfig<Driver, Element, Selector>): Promise<Eyes> {
    const eyes = await this._socket.request('EyesManager.makeEyes', {
      manager: this._manager,
      driver: this._refer.ref(driver),
      config: this._refer.ref(config),
    })
    return new Eyes({eyes, socket: this._socket, refer: this._refer})
  }

  async closeAllEyes(): Promise<types.Results.TestResult[]> {
    return this._socket.request('EyesManager.closeAllEyes', {manager: this._manager})
  }
}

// not to be confused with the user-facing Eyes class
export class Eyes implements types.Eyes<Element, Selector> {
  private _eyes: Ref
  private _socket: Socket<types.Ref<Driver>, types.Ref<Context>, types.Ref<Element>, Selector>
  private _refer: Refer<Driver | Context | Element>

  constructor({eyes, socket, refer}: any) {
    this._eyes = eyes
    this._socket = socket
    this._refer = refer
  }

  check({
    settings,
    config,
  }: {
    settings: types.Settings.CheckSettings<Element, Selector>
    config?: types.Configs.EyesConfig<Element, Selector>
  }): Promise<types.Results.MatchResult> {
    return this._socket.request('Eyes.check', {
      eyes: this._eyes,
      settings: this._refer.ref(settings, this._eyes),
      config: this._refer.ref(config, this._eyes),
    })
  }

  locate<TLocator extends string>({
    settings,
    config,
  }: {
    settings: types.Settings.LocateSettings<TLocator>
    config?: types.Configs.EyesConfig<Element, Selector>
  }): Promise<Record<TLocator, types.Options.Region[]>> {
    return this._socket.request('Eyes.locate', {
      eyes: this._eyes,
      settings,
      config: this._refer.ref(config, this._eyes),
    })
  }

  extractTextRegions<TPattern extends string>({
    settings,
    config,
  }: {
    settings: types.Settings.OCRSearchSettings<TPattern>
    config?: types.Configs.EyesConfig<Element, Selector>
  }): Promise<Record<TPattern, types.Options.TextRegion[]>> {
    return this._socket.request('Eyes.extractTextRegions', {
      eyes: this._eyes,
      settings,
      config: this._refer.ref(config, this._eyes),
    })
  }

  extractText({
    regions,
    config,
  }: {
    regions: types.Settings.OCRExtractSettings<Element, Selector>[]
    config?: types.Configs.EyesConfig<Element, Selector>
  }): Promise<string[]> {
    return this._socket.request('Eyes.extractText', {
      eyes: this._eyes,
      regions: this._refer.ref(regions),
      config: this._refer.ref(config),
    })
  }

  close() {
    return this._socket.request('Eyes.close', {eyes: this._eyes})
  }

  abort() {
    return this._socket.request('Eyes.abort', {eyes: this._eyes})
  }
}
