'use strict'

const assert = require('assert')
const Axios = require('axios')
const {makeLogger} = require('@applitools/logger')
const {ProxySettings, Configuration} = require('../../..')
const {configureAxios, configAxiosProxy, handleRequestError} = require('../../../lib/server/requestHelpers')
const {presult} = require('../../../lib/utils/GeneralUtils')
const logger = makeLogger()

describe('requestHelpers', () => {
  it('configureAxios works', () => {
    const APPLITOOLS_API_KEY = process.env.APPLITOOLS_API_KEY || 'ApiKey'
    const REQUEST_ID = 'RequestId'
    const TIMESTAMP = new Date()

    const agentId = 'testAgent'
    const configuration = new Configuration()
    configuration.setApiKey(APPLITOOLS_API_KEY)
    configuration.setProxy({
      url: 'http://some.proxy.url:3000',
      username: 'username',
      password: 'password',
    })
    const axiosConfig = {
      withApiKey: true,
      method: 'POST',
      url: 'https://some.url/some/api',
      data: {},
      requestId: REQUEST_ID,
      timestamp: TIMESTAMP,
    }

    configureAxios({axiosConfig, configuration, logger, agentId})

    assert.deepStrictEqual(axiosConfig, {
      withApiKey: true,
      method: 'POST',
      url: 'https://some.url/some/api',
      params: {
        apiKey: APPLITOOLS_API_KEY,
      },
      requestId: REQUEST_ID,
      timestamp: TIMESTAMP,
      headers: {
        'x-applitools-eyes-client': 'testAgent',
        'x-applitools-eyes-client-request-id': REQUEST_ID,
        'Eyes-Expect': '202+location',
        'Eyes-Expect-Version': '2',
        'Eyes-Date': TIMESTAMP.toUTCString(),
      },
      data: {},
      proxy: {
        auth: {
          username: 'username',
          password: 'password',
        },
        protocol: 'http:',
        host: 'some.proxy.url',
        port: '3000',
        isHttpOnly: false,
      },
    })
  })

  it('configAxiosProxy works with https proxy', () => {
    const proxy = new ProxySettings('https://some.url:2323', 'daniel', '1234')
    const axiosConfig = {}
    configAxiosProxy({axiosConfig, proxy, logger})

    assert.deepStrictEqual(axiosConfig, {
      proxy: {
        auth: {
          password: '1234',
          username: 'daniel',
        },
        host: 'some.url',
        isHttpOnly: false,
        port: '2323',
        protocol: 'https:',
      },
    })
  })

  it('configAxiosProxy works with http only proxy and port 80 specified', () => {
    const proxy = new ProxySettings('http://some.url:80', 'daniel', '1234', true)
    const axiosConfig = {}
    configAxiosProxy({axiosConfig, proxy, logger})

    assert.deepStrictEqual(axiosConfig.proxy, false)
    assert.deepStrictEqual(axiosConfig.httpsAgent.proxyOptions, {
      host: 'some.url',
      port: '80',
      proxyAuth: 'daniel:1234',
    })
  })

  it('configAxiosProxy works with http only proxy and no port specified', () => {
    const proxy = new ProxySettings('http://some.url', 'daniel', '1234', true)
    const axiosConfig = {}
    configAxiosProxy({axiosConfig, proxy, logger})

    assert.deepStrictEqual(axiosConfig.proxy, false)
    assert.deepStrictEqual(axiosConfig.httpsAgent.proxyOptions, {
      host: 'some.url',
      port: 8080,
      proxyAuth: 'daniel:1234',
    })
  })

  it('handleRequestError retry request', () => {
    const RETRY_COUNT = 3
    const axios = Axios.create({
      async adapter(config) {
        if (config.retry > 0) {
          const error = new Error('Fake Error')
          error.response = {status: 500, data: {}, headers: {}}
          error.request = {}
          error.config = config
          error.code = null
          throw error
        }
        return {status: 200, config, data: {}, headers: {}, request: {}}
      },
    })

    axios.interceptors.response.use(
      response => {
        assert.strictEqual(response.config.retry, 0)
        assert.strictEqual(response.config.repeat, RETRY_COUNT)
      },
      err => handleRequestError({err, axios, logger}),
    )

    axios.request({
      retry: RETRY_COUNT,
      repeat: 0,
      url: 'http://some.url',
    })
  })

  it('handleRequestError output', async () => {
    const axios = Axios.create({
      async adapter(config) {
        const error = new Error('Fake Error')
        error.response = {status: 400, statusText: 'Bad request', data: 'Issue #1\nIssue#2', headers: {}}
        error.request = {}
        error.config = config
        error.code = null
        throw error
      },
    })

    axios.interceptors.response.use(undefined, err => handleRequestError({err, axios, logger}))

    const requestName = 'bla'

    const [err] = await presult(
      axios.request({
        name: requestName,
        url: 'http://some.url',
      }),
    )

    assert.deepStrictEqual(
      err,
      new Error(`Error in request ${requestName}: Fake Error (Bad request)\nIssue #1\nIssue#2`),
    )
  })
})
