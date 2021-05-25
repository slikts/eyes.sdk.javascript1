const UniversalClient = require('./src/universal-client')
const playwright = require('playwright')

;(async function main() {
  const browser = await playwright.chromium.launch({headless: true})
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://news.ycombinator.com/')

  const client = await UniversalClient.connectToServer({
    port: 4000,
    path: '/home/amit/applitools/eyes.sdk.javascript1-2/packages/eyes-universal/bin/app-linux',
  })
  const agent = await client.makeAgent({type: 'classic', concurrency: 3})
  const eyes = await agent.open(page, {appName: 'universal client demo', testName: 'test 1'})
  await eyes.check({region: '#hnmain > tbody > tr:nth-child(1) > td > table'})
  await eyes.check({fully: true})
  const results = await eyes.close()
  console.log(results)
  await browser.close()
})().catch(err => {
  console.log('error!', err)
  process.exit(1)
})
