const WebSocket = require('ws')
const debug = require('debug')('applitools:socket')
const chalk = require('chalk')
const uuid = require('uuid')

class Socket {
  constructor() {
    this._socket = null
    this._listeners = new Map()
    this._queue = new Set()
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      this._socket = new WebSocket(url)
      this._socket.on('open', () => {
        debug('open')
        this._queue.forEach(command => command())
        this._queue.clear()

        this._socket.on('message', message => {
          const {name, key, payload} = JSON.parse(message)
          debug('message', name, key, payload)
          const fns = this._listeners.get(name)
          if (fns) fns.forEach(fn => fn(payload, key))
          if (key) {
            const fns = this._listeners.get(`${name}/${key}`)
            if (fns) fns.forEach(fn => fn(payload, key))
          }
        })
        resolve()
      })

      this._socket.on('close', () => {
        debug('close')
        const fns = this._listeners.get('close')
        if (fns) fns.forEach(fn => fn())
      })

      this._socket.on('error', err => {
        debug('error', err)
        const fns = this._listeners.get('close')
        if (fns) fns.forEach(fn => fn())
      })

      // TODO timeout and reject
    })
  }

  unref() {
    const command = () => this._socket._socket.unref()
    if (this._socket) command()
    else this._queue.add(command)
    return () => this._queue.delete(command)
  }

  emit(name, payload, key) {
    const command = () => this._socket.send(JSON.stringify({name, key, payload}))
    if (this._socket) command()
    else this._queue.add(command)
    return () => this._queue.delete(command)
  }

  command(name, fn) {
    this.on(name, async (payload, key) => {
      try {
        console.log(
          `${chalk.yellow('[COMMAND]')} ${name}, ${key}, ${JSON.stringify(payload, null, 2)}`,
        )
        const result = await fn(payload)
        this.emit(name, {result}, key)
      } catch (error) {
        console.log(`${chalk.red('[COMMAND]')} ${name} ${key} ${error}`)
        console.log(error)
        this.emit(name, {error}, key)
      }
    })
  }

  on(type, fn) {
    const name = typeof type === 'string' ? type : `${type.name}/${type.key}`
    let fns = this._listeners.get(name)
    if (!fns) {
      fns = new Set()
      this._listeners.set(name, fns)
    }
    fns.add(fn)
    return () => this.off(name, fn)
  }

  off(name, fn) {
    if (!fn) return this._listeners.delete(name)
    const fns = this._listeners.get(name)
    if (!fns) return false
    const existed = fns.delete(fn)
    if (!fns.size) this._listeners.delete(name)
    return existed
  }

  once(type, fn) {
    const off = this.on(type, (...args) => (fn(...args), off()))
    return off
  }

  request(name, payload) {
    return new Promise((resolve, reject) => {
      const key = uuid.v4()
      console.log(`${chalk.blue('[REQUEST]')} ${name}, ${key}, ${JSON.stringify(payload, null, 2)}`)
      this.emit(name, payload, key)
      this.once({name, key}, response => {
        if (response.error) return reject(response.error)
        return resolve(response.result)
      })
    })
  }
}

module.exports = Socket
