const {v4: uuidv4} = require('uuid')

function ping() {
  const id = uuidv4()
  const p = new Promise((res, rej) => {
    window.__eyes.promises[id] = {res, rej}
  })
  window.postMessage(
    {
      direction: 'from-page',
      command: 'ping',
      id,
    },
    '*'
  )
  return p.then(result => result)
}

window.addEventListener('message', event => {
  console.log(`page: ${JSON.stringify(event)}`)
  if (event.data && event.data.direction === 'from-background-script' && event.data.id) {
    window.__eyes.promises[event.data.id].res(event.data.result)
    delete window.__eyes.promises[event.data.id]
  }
})

window.__eyes = {
  ping,
  promises: {},
}

