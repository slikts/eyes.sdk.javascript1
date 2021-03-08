const {v4: uuidv4} = require('uuid')

function executeScript(script, args = []) {
  const fn = new Function(
    script.startsWith('function') ? `return (${script}).apply(null, arguments)` : script,
  )
  return fn.apply(null, args)
}

function doCommand(name, options = {}) {
  const id = uuidv4()
  const p = new Promise((res, rej) => {
    window.__eyes.promises[id] = {res, rej}
  })
  window.postMessage(
    {
      direction: 'from-page',
      command: name,
      id,
      ...options,
    },
    '*'
  )
  return p.then(result => result)
}

function ping() {
  return doCommand('ping')
}

function executeScriptRoundTrip(script, args) {
  return doCommand('executeScriptRoundTrip', {script, args})
}

function open(params) {
  return doCommand('open', params)
}

function close(params) {
  return doCommand('close', params)
}

function abort(params) {
  return doCommand('abort', params)
}

function check(params) {
  return doCommand('check', params)
}

window.addEventListener('message', event => {
  if (event.data && event.data.direction === 'from-background-script' && event.data.id) {
    if (event.data.command === 'executeScript') {
      const result = executeScript(event.data.script, event.data.args)
      event.source.postMessage(
        {
          id: event.data.id,
          direction: 'from-page',
          command: 'executeScript',
          result,
        },
        '*'
      )
    } else {
      window.__eyes.promises[event.data.id].res(event.data.result)
      delete window.__eyes.promises[event.data.id]
    }
  }
})

window.__eyes = {
  abort,
  check,
  close,
  ping,
  promises: {},
  executeScript,
  executeScriptRoundTrip,
  open,
}
