const {describe, it} = require('mocha')
const {expect} = require('chai')
const WebSocket = require('ws')
const UniversalClient = require('../src/universal-client')

function start() {
  return UniversalClient.connectToServer({
    port: 4000,
    path: '/home/amit/applitools/eyes.sdk.javascript1-2/packages/eyes-universal/bin/app-linux',
  })
}

describe('universal client', () => {
  describe('initialize', () => {
    let client
    beforeEach(async () => {
      client = await start()
    })
    afterEach(async () => {
      await client.closeServer()
    })
    it('starts server process', async () => {
      const s = new WebSocket('http://localhost:4000/eyes')
      await new Promise(r => {
        s.on('open', r)
      })
      s.terminate()
    })
  })

  describe('makeRunner', async () => {
    let client
    beforeEach(async () => {
      client = await start()
    })
    afterEach(async () => {
      // await client.closeServer()
    })
    it.only('creates runner', async () => {
      const runner = await client.makeRunner({type: 'classic', concurrency: 3})
      console.log('runner', runner)
    })
  })
})
