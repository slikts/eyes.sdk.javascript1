function js(chunks, ...values) {
  const commands = []
  let code = ''
  values.forEach((value, index) => {
    if (typeof value === 'function' && !value.isRef) {
      code += chunks[index]
      commands.push(code, value)
      code = ''
    } else {
      code += chunks[index] + serialize(value)
    }
  })
  code += chunks[chunks.length - 1]
  commands.push(code)
  return commands
}

function serialize(data) {
  if (data && data.isRef) {
    return data.ref()
  } else if (Array.isArray(data)) {
    return `[${data.map(serialize).join(', ')}]`
  } else if (typeof data === 'object' && data !== null) {
    const properties = Object.entries(data).reduce((data, [key, value]) => {
      return value !== undefined ? data.concat(`${key}: ${serialize(value)}`) : data
    }, [])
    return `{${properties.join(', ')}}`
  } else {
    return JSON.stringify(data)
  }
}

module.exports = function(tracker, test) {
  const {addSyntax, addCommand, addExpression, addHook, withScope} = tracker

  addSyntax('var', ({constant, name, value}) => `${constant ? 'const' : 'let'} ${name} = ${value}`)
  addSyntax('getter', ({target, key}) => `${target}['${key}']`)
  addSyntax('call', ({target, args}) => `${target}(${js`...${args}`})`)
  addSyntax('return', ({value}) => `return ${value}`)

  addHook('deps', `const assert = require('assert')`)
  addHook('deps', `const path = require('path')`)
  addHook('deps', `const {getTestInfo, getTestDom} = require('@applitools/test-utils')`)
  addHook('deps', `const cwd = process.cwd()`)
  addHook('deps', `const spec = require(path.resolve(process.cwd(), './test/coverage/spec-driver'))`)

  addHook('vars', `let driver, destroyDriver`)

  addHook(
    'beforeEach',
    js`const env = ${test.env || {browser: 'chrome'}};
      env.args = [...(env.args || []), '--load-extension=' + path.resolve(cwd, '/extension')];
      env.headless = false;
      [driver, destroyDriver] = await spec.build(env)`,
  )

  addHook('afterEach', js`await driver.execute(() => __eyes.abort())`)
  addHook('afterEach', js`await destroyDriver(driver)`)

  const driver = {
    constructor: {
      isStaleElementError(error) {
        return addCommand(js`spec.isStaleElementError(${error})`)
      },
    },
    visit(url) {
      addCommand(js`await spec.visit(driver, ${url})`)
    },
    getUrl() {
      return addCommand(js`await spec.getUrl(driver)`)
    },
    executeScript(script, ...args) {
      return addCommand(js`await spec.executeScript(driver, ${script}, ...${args})`)
    },
    sleep(ms) {
      addCommand(js`await spec.sleep(driver, ${ms})`)
    },
    switchToFrame(selector) {
      addCommand(js`await spec.childContext(driver, ${selector})`)
    },
    switchToParentFrame() {
      addCommand(js`await spec.mainContext(driver)`)
    },
    findElement(selector) {
      return addExpression(js`await spec.findElement(driver, ${selector})`)
    },
    findElements(selector) {
      return addExpression(js`await spec.findElements(driver, ${selector})`)
    },
    click(element) {
      addCommand(js`await spec.click(driver, ${element})`)
    },
    type(element, keys) {
      addCommand(js`await spec.type(driver, ${element}, ${keys})`)
    },
    scrollIntoView(element, align) {
      addCommand(js`await spec.scrollIntoView(driver, ${element}, ${align})`)
    },
    hover(element, offset) {
      addCommand(js`await spec.hover(driver, ${element}, ${offset})`)
    },
  }

  const eyes = {
    constructor: {
      setViewportSize(viewportSize) {
        addCommand(js`await driver.execute(() => __applitools.setViewportSize({size: ${viewportSize}}))`)
      },
    },
    getViewportSize() {
      return addCommand(js`await driver.execute(() => __applitools.getViewportSize())`)
    },
    open({appName, testName, viewportSize}) {
      return addCommand(js`await driver.execute(async options => window.__eyes = await __applitools.makeEyes(options), ${{
        type: test.vg ? 'vg' : 'classic',
        concurrency: 10,
        config: {
          apiKey: process.env.APPLITOOLS_API_KEY_SDK,
          appName,
          testName: testName || test.config.baselineName,
          displayName: test.name,
          viewportSize: viewportSize,
          batch: {id: process.env.APPLITOOLS_BATCH_ID, name: process.env.APPLITOOLS_BATCH_NAME || 'JS Coverage Tests'},
          parentBranchName: 'master',
          branchName: 'master',
          dontCloseBatches: true,
          matchTimeout: 0,
          saveNewTests: false,
          ...test.config,
        },
      }})`)
    },
    check(settings = {}) {
      return addCommand(js`await driver.execute((settings) => __eyes.check({settings}), ${settings})`)
    },
    locate(settings) {
      return addCommand(js`await driver.execute((settings) => __eyes.locate({settings}), ${settings})`)
    },
    extractText(regions) {
      return addCommand(js`await driver.execute((regions) => __eyes.extractText({regions}), ${regions})`)
    },
    extractTextRegions(settings) {
      return addCommand(js`await driver.execute((settings) => __eyes.extractTextRegions({settings}), ${settings})`)
    },
    close(throwErr = true) {
      const results = addCommand(js`await driver.execute(() => __eyes.close())`)
      if (throwErr) {
        addCommand(js`if (${results.status} !== 'Passed') throw new Error()`)
      }
      return results
    },
    abort() {
      return addCommand(js`await driver.execute(() => __eyes.abort())`)
    },
  }

  const assert = {
    equal(actual, expected, message) {
      addCommand(js`assert.deepStrictEqual(${actual}, ${expected}, ${message})`)
    },
    notEqual(actual, expected, message) {
      addCommand(js`assert.notDeepStrictEqual(${actual}, ${expected}, ${message})`)
    },
    ok(value, message) {
      addCommand(js`assert.ok(${value}, ${message})`)
    },
    throws(func, check, message) {
      let command
      if (check) {
        command = js`await assert.rejects(
          async () => {${func}},
          error => {${withScope(check, ['error'])}},
          ${message},
        )`
      } else {
        command = js`await assert.rejects(
          async () => {${func}},
          undefined,
          ${message},
        )`
      }
      addCommand(command)
    },
  }

  const helpers = {
    delay(milliseconds) {
      return addCommand(js`await new Promise(r => setTimeout(r, ${milliseconds}))`)
    },
    getTestInfo(result) {
      return addCommand(js`await getTestInfo(${result})`)
    },
    getDom(result, domId) {
      return addCommand(js`await getTestDom(${result}, ${domId})`).methods({
        getNodesByAttribute: (dom, name) => addExpression(js`${dom}.getNodesByAttribute(${name})`)
      })
    },
    math: {
      round(number) {
        return addExpression(js`(Math.round(${number}) || 0)`)
      },
    }
  }

  return {driver, eyes, assert, helpers}
}
