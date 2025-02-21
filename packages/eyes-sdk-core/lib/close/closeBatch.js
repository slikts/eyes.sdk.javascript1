'use strict'

const {makeLogger} = require('@applitools/logger')
const ServerConnector = require('../server/ServerConnector')
const Configuration = require('../config/Configuration')
const {presult} = require('../utils/GeneralUtils')

async function closeBatch({batchIds, serverUrl, apiKey, proxy, logger}) {
  if (!batchIds) throw new Error('no batchIds were set')
  const serverConnector = new ServerConnector({
    logger: logger || makeLogger(),
    configuration: new Configuration({serverUrl, apiKey, proxy}),
    getAgentId: () => '',
  })

  const promises = batchIds.map(batchId => serverConnector.deleteBatchSessions(batchId))
  const results = await Promise.all(promises.map(presult))
  const error = results.find(([err]) => !!err)
  if (error) throw error[0]
}

module.exports = closeBatch
