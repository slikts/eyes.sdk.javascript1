const fetch = require('node-fetch')
const {URL} = require('url')

async function getTestInfo(
  testResults,
  apiKey = process.env.APPLITOOLS_API_KEY_SDK || process.env.APPLITOOLS_API_KEY,
) {
  const url = `${testResults
    .getApiUrls()
    .getSession()}?format=json&AccessToken=${testResults.getSecretToken()}&apiKey=${apiKey}`

  const response = await fetch(url)
  return response.json()
}

async function getDom(testResults, domId) {
  const sessionUrl = new URL(testResults.getAppUrls().getSession())
  const accountId = sessionUrl.searchParams.get('accountId')
  const url = `${sessionUrl.origin}/api/images/dom/${domId}/?accountId=${accountId}&apiKey=${process.env.APPLITOOLS_API_KEY_READ}`

  const response = await fetch(url)
  const dom = await response.json()

  return {
    ...dom,
    getNodesByAttribute: attr => getNodesByAttribute(dom, attr),
  }

  function getNodesByAttribute(node, attr) {
    const result = []
    if (node.attributes && node.attributes[attr]) {
      result.push(node)
    }
    if (node.childNodes) {
      node.childNodes.forEach(node => result.push(...getNodesByAttribute(node, attr)))
    }
    return result
  }
}

module.exports = {getTestInfo, getDom}
