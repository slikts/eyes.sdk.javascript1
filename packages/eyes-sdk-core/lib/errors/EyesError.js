/**
 * The base Applitools Eyes error type.
 */
class EyesError extends Error {
  constructor(message, {reason = 'internal', error, ...info} = {}) {
    super()
    this.name = this.constructor.name
    this.message = message
    this.reason = reason
    this.info = info
    this.originalError = error

    if (error instanceof Error) {
      this.message = `${message}: ${error.message}`
      this.stack = error.stack
    }
  }
}

module.exports = EyesError
