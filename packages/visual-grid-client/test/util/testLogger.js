'use strict'

const {Logger} = require('@applitools/eyes-sdk-core/shared')

module.exports = new Logger(process.env.APPLITOOLS_SHOW_LOGS)
