const core = require('@actions/core')

const ALIASES = {
  'playwright': ['eyes-playwright', '@applitools/eyes-playwright'],
  'puppeteer': ['pptr', 'eyes-puppeteer', '@applitools/eyes-puppeteer'],
  'webdriverio': ['wdio', 'eyes-webdriverio-5', 'eyes-webdriverio', '@applitools/eyes-webdriverio'],
  'webdriverio-legacy': ['wdio-legacy', 'eyes-webdriverio-4', 'eyes.webdriverio', '@applitools/eyes.webdriverio'],
  'selenium': ['eyes-selenium', '@applitools/eyes-selenium'],
  'protractor': ['eyes-protractor', '@applitools/eyes-protractor'],
  'nightwatch': ['eyes-nightwatch', '@applitools/eyes-nightwatch'],
  'testcafe': ['eyes-testcafe', '@applitools/eyes-testcafe'],
}

const DIR_NAME = {
  'playwright': 'eyes-playwright',
  'puppeteer': 'eyes-puppeteer',
  'webdriverio': 'eyes-webdriverio-5',
  'webdriverio-legacy': 'eyes-webdriverio-4',
  'selenium': 'eyes-selenium',
  'protractor': 'eyes-protractor',
  'nightwatch': 'eyes-nightwatch',
  'testcafe': 'eyes-testcafe',
}

const settings = core.getInput('settings', {required: true})

const include = settings.split(/[\s,]+/).reduce((output, setting) => {
  const [_, name, version, protocol] = setting.match(/^(.*?)(?:@(\d+))?(?::(.+?))?$/i)
  const package = Object.keys(ALIASES).find(dirname => dirname === name || ALIASES[dirname].includes(name))
  if (!package) return output
  const modifiers = Object.entries({version, protocol})
    .reduce((parts, [key, value]) => [...parts, `${key}: ${value}`], [])
    .join('; ')
  output.push({
    name: `${package} ${modifiers ? `(${modifiers})` : ''}`,
    package: DIR_NAME[package],
    env: {
      [`APPLITOOLS_${package.toUpperCase()}_MAJOR_VERSION`]: version,
      [`APPLITOOLS_${package.toUpperCase()}_PROTOCOL`]: protocol
    },
  })
  return output
}, [])

core.setOutput('matrix', {include})