import type * as types from '@applitools/types'
import type {Driver, Context, Element, Selector} from './spec-driver'
import {makeSDK} from '@applitools/eyes-sdk-core'
import {makeServer} from './server'
import {makeSocket} from './socket'
import {makeSpec} from './spec-driver'
import {makeRefer} from './refer'

const IDLE_TIMEOUT = 900000 // 15min

export async function makeAPI({idleTimeout = IDLE_TIMEOUT, ...serverConfig} = {}) {
  const {server, port} = await makeServer(serverConfig)
  console.log(port) // NOTE: this is a part of the protocol
  if (!server) {
    console.log(
      `You trying to spawn a duplicated server, please use server on port ${port} instead`,
    )
    return null
  }
  let idle = setTimeout(() => server.close(), idleTimeout)

  server.on('connection', client => {
    let sdk: types.Core<Driver, Element, Selector> = null

    clearTimeout(idle)
    const socket = makeSocket<Driver, Context, Element, Selector>(client)
    const refer = makeRefer()

    socket.on('close', () => {
      if (server.clients.size === 0) {
        idle = setTimeout(() => server.close(), idleTimeout)
      }
    })

    socket.once('Session.init', config => {
      const commands = [
        'isDriver',
        'isElement',
        'isSelector',
        'extractSelector',
        'isStaleElementError',
        ...config.commands,
      ]
      const spec = makeSpec(socket, commands)

      sdk = makeSDK({
        name: `eyes-universal/${config.name}`,
        version: `${require('../package.json').version}/${config.version}`,
        spec,
        VisualGridClient: require('@applitools/visual-grid-client'),
      })
    })

    socket.command('Core.makeManager', async (config) => {
      const eyes = await sdk.makeManager(config)
      return refer.ref(eyes)
    })
    socket.command('Core.getViewportSize', async ({driver}) => {
      return sdk.getViewportSize({driver})
    })
    socket.command('Core.setViewportSize', async ({driver, size}) => {
      return sdk.setViewportSize({driver, size})
    })
    socket.command('Core.closeBatches', config => {
      return sdk.closeBatch(config)
    })
    socket.command('Core.deleteTest', config => {
      return sdk.deleteTest(config)
    })

    socket.command('EyesManager.makeEyes', async ({manager, driver, config}) => {
      const commands = await refer.deref(manager).open(driver, config)
      return refer.ref(commands, manager)
    })
    socket.command('EyesManager.closeAllEyes', async ({manager}) => {
      return await refer.deref(manager).closeAllEyes()
    })

    socket.command('Eyes.check', async ({eyes, settings, config}) => {
      return refer.deref(eyes).check({settings, config})
    })
    socket.command('Eyes.locate', async ({eyes, settings, config}) => {
      return refer.deref(eyes).locate({settings, config})
    })
    socket.command('Eyes.extractTextRegions', async ({eyes, settings, config}) => {
      return refer.deref(eyes).extractTextRegions({settings, config})
    })
    socket.command('Eyes.extractText', async ({eyes, regions, config}) => {
      return refer.deref(eyes).extractText({regions, config})
    })
    socket.command('Eyes.close', ({eyes}) => {
      const commands = refer.deref(eyes)
      refer.destroy(eyes)
      return commands.close()
    })
    socket.command('Eyes.abort', ({eyes}) => {
      const commands = refer.deref(eyes)
      refer.destroy(eyes)
      return commands.abort()
    })
  })

  return {port, close: () => server.close()}
}