const UniversalClient = require('../src/universal-client')

;(async function main() {
  const timeout = setTimeout(() => {}, 60000)
  const client = await UniversalClient.connectToServer({
    port: 4000,
    path: '/home/amit/applitools/eyes.sdk.javascript1-2/packages/eyes-universal/bin/app-linux',
  })
  const runner = await client.makeRunner({type: 'classic', concurrency: 3})
  console.log('runner', runner)
  clearTimeout(timeout)
})()
