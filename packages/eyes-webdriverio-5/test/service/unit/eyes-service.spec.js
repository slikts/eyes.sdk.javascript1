const EyesService = require('../../../dist/src/service')
const assert = require('assert')

describe('EyesService', () => {
  it('loads on an empty config (vg)', () => {
    assert.doesNotThrow(() => {
      new EyesService({useVisualGrid: true})
    })
  })
})
