const {spawn} = require('child_process')
const Refer = require('./refer')
const Socket = require('./socket')
const SpecDriver = require('./spec-driver')
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
        socket.emit('Session.init', {commands: Object.keys(specDriver)})

        resolve(new UniversalClient({serverProcess, socket, refer, specDriver}))
      })
    })
  }

  constructor({serverProcess, socket, refer, specDriver}) {
    this._socket = socket
    this._refer = refer
    this._specDriver = specDriver
    this._serverProcess = serverProcess
  }

  // for testing purposes
  async closeServer() {
    return this._serverProcess.kill()
  }

  async makeRunner({type, concurrency, legacy}) {
    const ret = await this._socket.request('EyesRunner.new', {type, concurrency, legacy})
    debug('makeRunner 2', ret)
    return ret
  }
}

module.exports = UniversalClient
