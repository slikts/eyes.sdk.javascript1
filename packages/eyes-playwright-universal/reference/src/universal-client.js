const {spawn} = require('child_process')
const Refer = require('./refer')
const Socket = require('./socket')
const SpecDriver = require('./spec-driver')
const Utils = require('./utils')
const debug = require('debug')('applitools:client')

class UniversalClient {
  static async connectToServer({port = 2107, path = './node_modules/bin/eyes-universal-linux'}) {
    return new Promise((resolve, _reject) => {
      debug('connect')
      const socket = new Socket()
      const refer = new Refer()
      const specDriver = new SpecDriver(refer)

      const serverProcess = spawn(path, ['--port', port], {
        detached: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      })

      serverProcess.unref() // important: this allows the client process to exit without hanging, while the server process still runs

      // specific to JS: we are able to listen to stdout for the first line, then we know the server is up, and we even can get its port in case it wasn't passed
      serverProcess.stdout.once('data', async data => {
        serverProcess.stdout.destroy()
        const [port] = String(data).split('\n', 1)
        await socket.connect(`http://localhost:${port}/eyes`)
        socket.unref() // important: this allows the client process to exit without hanging, while the server process still runs
        socket.emit('Session.init', {commands: Object.keys(specDriver.commands)})

        resolve(new UniversalClient({serverProcess, socket, refer, specDriver}))
      })
    })
  }

  constructor({serverProcess, socket, refer, specDriver}) {
    this._socket = socket
    this._refer = refer
    this._serverProcess = serverProcess
    this._specDriver = specDriver

    this._attachSpecDriver()
  }

  _attachSpecDriver() {
    this._socket.command('Driver.isEqualElements', ({context, element1, element2}) => {
      return this._specDriver.commands.isEqualElements(context, element1, element2)
    })
    this._socket.command('Driver.executeScript', ([context, script, ...args]) => {
      return this._specDriver.commands.executeScript(context, script, ...args)
    })
    this._socket.command('Driver.mainContext', ([context]) => {
      return this._specDriver.commands.mainContext(context)
    })
    this._socket.command('Driver.parentContext', ([context]) => {
      return this._specDriver.commands.parentContext(context)
    })
    this._socket.command('Driver.childContext', ([context, element]) => {
      return this._specDriver.commands.mainContext(context, element)
    })
    this._socket.command('Driver.findElement', ([context, selector]) => {
      return this._specDriver.commands.findElement(context, selector)
    })
    this._socket.command('Driver.findElements', ([context, selector]) => {
      return this._specDriver.commands.findElements(context, selector)
    })
    this._socket.command('Driver.getViewportSize', ([driver]) => {
      return this._specDriver.commands.getViewportSize(driver)
    })
    this._socket.command('Driver.setViewportSize', ([driver, size]) => {
      return this._specDriver.commands.setViewportSize(driver, size)
    })
    this._socket.command('Driver.getTitle', ([driver]) => {
      return this._specDriver.commands.getTitle(driver)
    })
    this._socket.command('Driver.getUrl', ([driver]) => {
      return this._specDriver.commands.getUrl(driver)
    })
    this._socket.command('Driver.getDriverInfo', ([driver]) => {
      return this._specDriver.commands.getDriverInfo(driver)
    })
    this._socket.command('Driver.takeScreenshot', async ([driver]) => {
      return this._specDriver.commands.takeScreenshot(driver)
    })
  }

  // for testing purposes
  async closeServer() {
    return this._serverProcess.kill()
  }

  async makeAgent({type, concurrency, legacy}) {
    const agentRef = await this._socket.request('Agent.new', {type, concurrency, legacy})
    return new Agent({
      agentRef,
      refer: this._refer,
      socket: this._socket,
      specDriver: this._specDriver,
    })
  }
}

class Agent {
  constructor({agentRef, refer, socket, specDriver}) {
    this._agentRef = agentRef
    this._refer = refer
    this._socket = socket
    this._specDriver = specDriver
  }

  async open(driver, config) {
    const eyesRef = await this._socket.request('Agent.open', {
      agent: this._agentRef,
      driver: this._refer.ref(driver),
      config,
    })
    return new Eyes({
      eyesRef,
      socket: this._socket,
      refer: this._refer,
      specDriver: this._specDriver,
    })
  }
}

// not to be confused with the user-facing Eyes class
class Eyes {
  constructor({eyesRef, socket, refer, specDriver}) {
    this._eyesRef = eyesRef
    this._socket = socket
    this._refer = refer
    this._specDriver = specDriver
  }

  check(checkSettings, configuration) {
    const settings = Utils.serializeCheckSettings(checkSettings, this._specDriver)
    const config = Utils.serializeConfiguration(configuration, this._specDriver)
    return this._socket.request('Eyes.check', {eyes: this._eyesRef, settings, config})
  }

  close() {
    return this._socket.request('Eyes.close', {eyes: this._eyesRef})
  }
}

module.exports = UniversalClient
