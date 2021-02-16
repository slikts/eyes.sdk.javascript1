const assert = require('assert')
const spec = require('../../src/spec-driver')
const {Selector} = require('testcafe')

describe('spec-driver', () => {
  describe('prepareArgsFunctionString', () => {
    it('flat arguments', () => {
      const expected = 'let args = [...arguments]\n' + 'args[2] = args[2]()\n' + 'return args'
      assert.deepStrictEqual(spec.prepareArgsFunctionString([1, 2, Selector('html'), 4]), expected)
    })
    it('serialized arguments', () => {
      const expected = `
    let args = [...arguments]
args[0].element = args[0].element()
return args`.trim()
      assert.deepStrictEqual(
        spec.prepareArgsFunctionString([{properties: ['overflow'], element: Selector('html')}]),
        expected,
      )
    })
    it('nested args array', () => {
      // 2 levels
      let expected = `
    let args = [...arguments]
args[0][0] = args[0][0]()
return args`.trim()
      assert.deepStrictEqual(
        spec.prepareArgsFunctionString([[Selector('html'), {overflow: 'hidden'}]]),
        expected,
      )
      // 3 levels -- e.g., markElements snippet
      expected = `
    let args = [...arguments]
args[0][0][0] = args[0][0][0]()
return args`.trim()
      assert.deepStrictEqual(
        spec.prepareArgsFunctionString([
          [[Selector('html')], ['b55f35de-999d-4406-88f5-17e857813f14']],
        ]),
        expected,
      )
      // 3 levels (v2) -- e.g., markElements snippet
      const input = [
        [
          [Selector('a'), Selector('b')],
          ['aaaaa', 'bbbbb'],
        ],
      ]
      expected = `
    let args = [...arguments]
args[0][0][0] = args[0][0][0]()
args[0][0][1] = args[0][0][1]()
return args`.trim()
      assert.deepStrictEqual(spec.prepareArgsFunctionString(input), expected)
    })
  })
})
