'use strict'

const {describe, it} = require('mocha')
const {expect} = require('chai')
const makeRenderingGridClient = require('../../../src/sdk/renderingGridClient')
const createFakeWrapper = require('../../util/createFakeWrapper')
const testServer = require('@applitools/sdk-shared/src/run-test-server')
const {presult} = require('@applitools/functional-commons')

describe('getRenderInfo', () => {
  let wrapper, closeServer, baseUrl

  before(async () => {
    const server = await testServer({port: 3454})
    baseUrl = `http://localhost:${server.port}`
    closeServer = server.close
    wrapper = createFakeWrapper(baseUrl)
    closeServer = server.close
  })

  after(async () => {
    await closeServer()
  })

  it('make sure getSetRenderInfo sets renderInfo and is not called twice', async () => {
    let apiKey = process.env.APPLITOOLS_API_KEY
    let checkIfGetRenderInfoIsCalled = false

    wrapper.getRenderInfo = async () => {
      checkIfGetRenderInfoIsCalled = true
    }
    const {openEyes, getSetRenderInfo} = await makeRenderingGridClient({
      apiKey,
      renderWrapper: wrapper,
    })

    //checkIfGetRenderInfoIsCalled should be changed to true as this is the first time
    //getRenderInfo is called
    await getSetRenderInfo()

    expect(checkIfGetRenderInfoIsCalled).to.equal(true)

    // resetting checkIfGetRenderInfoIsCalled to false
    checkIfGetRenderInfoIsCalled = false

    // checkIfGetRenderInfoIsCalled should not be changed back to true as doGetInitialData was already
    //called
    await presult(
      openEyes({
        wrappers: [wrapper],
        appName: 'bla',
      }),
    )

    expect(checkIfGetRenderInfoIsCalled).to.equal(false)
  })
})
