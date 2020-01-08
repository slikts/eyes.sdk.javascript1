'use strict'
const rest = require('rest-api-handler')
const {Builder, By} = require('selenium-webdriver')
const {Options} = require('selenium-webdriver/chrome')
const {Eyes, Target, ClassicRunner, Region} = require('../../index')
const appName = 'Test Fluent Api'
describe('Test ', () => {
  let driver
  let eyes
  let runner
  let stitchMode = 'CSS'

  beforeEach(async function() {
    driver = new Builder()
      .forBrowser('chrome')
      // .setChromeOptions(new Options().headless())
      .build()
    await driver.get('https://applitools.github.io/demo/TestPages/FramesTestPage/')
    runner = new ClassicRunner()
    eyes = new Eyes(runner)
    eyes.setStitchMode(stitchMode)
    eyes.setBatch('JS test')
  })

  afterEach(async function() {
    await eyes.abortIfNotClosed()
    await driver.quit()
  })

  it('TestCheckWindowWithIgnoreRegion_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Check Window with Ignore region', {
      width: 800,
      height: 600,
    })
    await driver.findElement(By.css('input')).sendKeys('My Input')
    await eyes.check(
      'Fluent - Window with Ignore region',
      Target.window()
        .fully()
        .timeout(5)
        .ignoreCaret()
        .ignoreRegions(new Region(50, 50, 100, 100)),
    )
    await eyes.close()
  })

  it('TestCheckRegionWithIgnoreRegion_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Check Region with Ignore region', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Region with Ignore region',
      Target.region(By.id('overflowing-div')).ignoreRegions(new Region(50, 50, 100, 100)),
    )
    await eyes.close()
  })

  it('TestCheckRegionBySelectorAfterManualScroll_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Region by selector after manual scroll', {
      width: 800,
      height: 600,
    })
    await driver.executeScript(() => window.scrollBy(0, 900))
    await eyes.check(
      'Fluent - Region by selector after manual scroll',
      Target.region(By.id('centered')),
    )
    await eyes.close()
  })

  it('TestCheckWindow_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Window', {
      width: 800,
      height: 600,
    })
    await eyes.check('Fluent - Window', Target.window())
    await eyes.close()
  })

  it('TestCheckWindowWithIgnoreBySelector_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Window with ignore region by selector', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Window with ignore region by selector',
      Target.window().ignoreRegions(By.id('overflowing-div')),
    )
    await eyes.close()
  })

  it('TestCheckWindowWithIgnoreBySelector_Centered_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Window with ignore region by selector centered', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Window with ignore region by selector centered',
      Target.window().ignoreRegions(By.id('centered')),
    )
    await eyes.close()
  })

  it('TestCheckWindowWithIgnoreBySelector_Stretched_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Window with ignore region by selector stretched', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Window with ignore region by selector stretched',
      Target.window().ignoreRegions(By.id('stretched')),
    )
    await eyes.close()
  })

  it('TestCheckWindowWithFloatingBySelector_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Window with ignore region by selector', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Window with ignore region by selector',
      Target.window().floatingRegion(By.id('overflowing-div'), 3, 3, 20, 30),
    )
    await eyes.close()
  })

  it('TestCheckRegionByCoordinates_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Region by coordinates', {
      width: 800,
      height: 600,
    })
    await eyes.check('Fluent - Region by coordinates', Target.region(new Region(50, 70, 90, 110)))
    await eyes.close()
  })

  it('TestCheckOverflowingRegionByCoordinates_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Region by overflowing coordinates', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Region by overflowing coordinates',
      Target.region(new Region(50, 110, 90, 550)),
    )
    await eyes.close()
  })

  it('TestCheckElementWithIgnoreRegionByElementOutsideTheViewport_Fluent', async function() {
    await eyes.open(
      driver,
      appName,
      'Fluent - Region by element with ignore region by element outside the viewport',
      {
        width: 800,
        height: 600,
      },
    )
    let element = driver.findElement(By.id('overflowing-div-image'))
    let ignoreElement = driver.findElement(By.id('overflowing-div'))
    await eyes.check(
      'Fluent - Region by element with ignore region by element outside the viewport',
      Target.region(element).ignoreRegions(ignoreElement),
    )
    await eyes.close()
  })

  it('TestCheckElementWithIgnoreRegionBySameElement_Fluent', async function() {
    await eyes.open(
      driver,
      appName,
      'Fluent - Region by element with ignore region by the same element',
      {
        width: 800,
        height: 600,
      },
    )
    let element = driver.findElement(By.id('overflowing-div-image'))
    await eyes.check(
      'Fluent - Region by element with ignore region by the same element',
      Target.region(element).ignoreRegions(element),
    )
    await eyes.close()
  })

  it('TestScrollbarsHiddenAndReturned_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Scroll bars hidden and returned', {
      width: 800,
      height: 600,
    })
    await eyes.check('Fluent - Window (Before)', Target.window().fully())
    await eyes.check(
      'Fluent - Inner frame div',
      Target.frame('frame1')
        .region(By.id('inner-frame-div'))
        .fully(),
    )
    await eyes.check('Fluent - Window (After)', Target.window().fully())
    await eyes.close()
  })

  it('TestCheckFullWindowWithMultipleIgnoreRegionsBySelector_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent - Window with multiple ignore regions by selectors', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Window with multiple ignore regions by selectors',
      Target.window()
        .fully()
        .ignoreRegions(By.css('.ignore')),
    )
    await eyes.close()
  })

  it('TestCheckMany', async function() {
    await eyes.open(driver, appName, 'Fluent - Check many', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Check many',
      Target.region(By.id('overflowing-div-image')).withName('overflowing div image'),
      Target.region(By.id('overflowing-div-image'))
        .fully()
        .withName('overflowing div image (fully)'),
      Target.region(By.id('overflowing-div')).withName('overflowing div'),
      Target.region(new Region(30, 50, 300, 620)).withName('rectangle'),
      Target.frame('frame1')
        .frame('frame1-1')
        .fully()
        .withName('Full Frame in Frame'),
      Target.frame('frame1').withName('frame1'),
    )
    await eyes.close()
  })

  it('TestCheckScrollableModal', async function() {
    await eyes.open(driver, appName, 'Fluent - Check many', {
      width: 800,
      height: 600,
    })
    await eyes.check(
      'Fluent - Check many',
      Target.region(By.id('overflowing-div-image')).withName('overflowing div image'),
      Target.region(By.id('overflowing-div-image'))
        .fully()
        .withName('overflowing div image (fully)'),
      Target.region(By.id('overflowing-div')).withName('overflowing div'),
      Target.region(new Region(30, 50, 300, 620)).withName('rectangle'),
      Target.frame('frame1')
        .frame('frame1-1')
        .fully()
        .withName('Full Frame in Frame'),
      Target.frame('frame1').withName('frame1'),
    )
    await eyes.close()
  })

  it('TestCheckScrollableModal', async function() {
    await eyes.open(driver, appName, 'Fluent - Check many', {
      width: 800,
      height: 600,
    })
    driver.findElement(By.id('centered')).click()
    let scrollRootLocator = stitchMode === 'CSS' ? 'modal-content' : 'modal1'
    let scrollRootElement = driver.findElement(By.id(scrollRootLocator))
    await eyes.check(
      'Fluent - Scrollable Modal',
      Target.region(By.id('modal-content'))
        .fully()
        .scrollRootElement(scrollRootElement),
    )
    await eyes.close()
  })

  it('TestCheckScrollableModal', async function() {
    await eyes.open(driver, appName, 'Fluent - Check many', {
      width: 800,
      height: 600,
    })
    driver.findElement(By.id('centered')).click()
    let scrollRootLocator = stitchMode === 'CSS' ? 'modal-content' : 'modal1'
    let scrollRootSelector = By.id(scrollRootLocator)
    await eyes.check(
      'Fluent - Scrollable Modal',
      Target.region(By.id('modal-content'))
        .fully()
        .scrollRootElement(scrollRootSelector),
    )
    await eyes.close()
  })

  let ignoreDisplacements = [true, false]

  ignoreDisplacements.forEach(function(ignoreDisplacement) {
    it(`TestIgnoreDisplacements ${ignoreDisplacement}`, async function() {
      await eyes.open(driver, appName, `Fluent - Ignore displacement ${ignoreDisplacement}`, {
        width: 800,
        height: 600,
      })
      await eyes.check(
        `Fluent - Ignore displacement ${ignoreDisplacement}`,
        Target.window()
          .fully()
          .ignoreDisplacements(ignoreDisplacement),
      )
      await eyes.close()
    })
  })

  it('TestCheckWindowWithFloatingByRegion_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent -  Window with floating region by region', {
      width: 800,
      height: 600,
    })
    let settings = Target.window().floatingRegion(new Region(10, 10, 20, 20), 3, 3, 20, 30)
    await eyes.check('Fluent -  Window with floating region by region', settings)
    await eyes.close()
  })

  it('TestCheckWindowWithFloatingByRegion_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent -  Window with floating region by region', {
      width: 800,
      height: 600,
    })
    let settings = Target.window().floatingRegion(new Region(10, 10, 20, 20), 3, 3, 20, 30)
    await eyes.check('Fluent -  Window with floating region by region', settings)
    await eyes.close()
  })

  it('TestCheckElementFully_Fluent', async function() {
    await eyes.open(driver, appName, 'Fluent -  Region by element - fully', {
      width: 800,
      height: 600,
    })
    let element = driver.findElement(By.id('overflowing-div-image'))
    await eyes.check('Fluent -  Region by element - fully', Target.region(element).fully())
    await eyes.close()
  })
})

async function checkSettedRegionsInTheSessionsDetails() {
  let results = await runner.getAllTestResults()
  results = results.getAllResults()
  let session = results[0]
    .getTestResults()
    .getApiUrls()
    .getSession()
  let apiKey = results[0].getTestResults()
  console.log(session)
  let response = await getSessionResults(
    session,
    eyes.getApiKey(),
    results[0].getTestResults()._secretToken,
  )
  // need proper implementation
  /*console.log(uri)
  console.log(apiKey)
  console.log(secretToken)
  const api = new rest.Api(uri)
  return await api.get('', [], {
    format: 'json',
    AccessToken: secretToken,
    apiKey: apiKey,
  })*/
}
