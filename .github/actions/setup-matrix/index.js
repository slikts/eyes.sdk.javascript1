const core = require('@actions/core')

const ALIASES = {
  'eyes-playwright': ['playwright', '@applitools/eyes-playwright'],
  'eyes-puppeteer': ['pptr', 'puppeteer', '@applitools/eyes-puppeteer'],
  'eyes-webdriverio-5': ['wdio', 'webdriverio', 'eyes-webdriverio', '@applitools/eyes-webdriverio'],
  'eyes-webdriverio-4': ['wdio-legacy', 'webdriverio-legacy', 'eyes.webdriverio', '@applitools/eyes.webdriverio'],
  'eyes-selenium': ['selenium', '@applitools/eyes-selenium'],
  'eyes-protractor': ['protractor', '@applitools/eyes-protractor'],
  'eyes-nightwatch': ['nightwatch', '@applitools/eyes-nightwatch'],
  'eyes-testcafe': ['testcafe', '@applitools/eyes-testcafe'],
}

const PREFIXES = {
  'eyes-playwright': 'playwright',
  'eyes-puppeteer': 'puppeteer',
  'eyes-webdriverio-5': 'wdio',
  'eyes-webdriverio-4': 'wdio_legacy',
  'eyes-selenium': 'selenium',
  'eyes-protractor': 'protractor',
  'eyes-nightwatch': 'nightwatch',
  'eyes-testcafe': 'testcafe',
}

const settings = core.getInput('settings', {required: true})

const include = settings.split(/[\s,]+/).reduce((output, setting) => {
  const [_, name, version, protocol] = setting.match(/^(.*?)(?:@(\d+))?(?::(.+?))?$/i)
  const package = Object.keys(ALIASES).find(dirname => dirname === name || ALIASES[dirname].includes(name))
  if (!package) return output
  const prefix = PREFIXES[package].toUpperCase()
  output.push({
    setting,
    package,
    env: {
      [`APPLITOOLS_${prefix}_MAJOR_VERSION`]: version,
      [`APPLITOOLS_${prefix}_PROTOCOL`]: protocol
    },
  })
  return output
}, [])

core.setOutput('matrix', {include})