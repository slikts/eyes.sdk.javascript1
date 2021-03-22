const fs = require('fs').promises;
const path = require('path')
const exec = require('util').promisify(require('child_process').exec)

const skipList = ['eyes-universal-poc', 'eyes-leanft', 'eyes-images-legacy', 'eyes-sdk-core-legacy']

const packageTemplate = `
    - package-ecosystem: "npm"
      directory: "/packages/_PACKAGE_"
      schedule:
        interval: "daily"`

let template = `  version: 2\n  updates:`

;(async () => {
  try {
    const {stdout: items} = await exec('ls packages')
    const packages = items.split('\n')
    for (const package of packages) {
      if (!skipList.includes(package)) {
        template += `  ${packageTemplate.replace('_PACKAGE_', package)}`
      }
    }
    await fs.writeFile(path.join(__dirname,'../../../.github/dependabot.yml'), template)
  } catch (error) {
    throw error
  }
})()
