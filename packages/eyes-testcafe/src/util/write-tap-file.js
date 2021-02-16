const {resolve} = require('path')
const fs = require('fs')

function writeTapFile({tapDirPath, formatter}) {
  const tapFilePath = resolve(tapDirPath, 'eyes.tap')
  const includeSubTests = false
  const markNewAsPassed = true
  fs.writeFileSync(tapFilePath, formatter.asHierarchicTAPString(includeSubTests, markNewAsPassed))
  return tapFilePath
}

module.exports = writeTapFile
