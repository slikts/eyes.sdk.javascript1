import browser from 'webextension-polyfill'
import * as path from 'path'

export async function readFile(filePath, options, callback) {
  const directory = filePath.includes('dom-snapshot') ? 'dom-snapshot' : null
  const fileUrl = browser.runtime.getURL(`assets/${directory}/${path.basename(filePath)}`)
  console.log(fileUrl)
  try {
    const response = await fetch(fileUrl)
    const data = await response.text()
    callback(null, data)
    return data
  } catch (err) {
    callback(err)
    throw err
  }
}