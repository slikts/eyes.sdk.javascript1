const fs = require('fs').promises;
const path = require('path');

const skipList = ['eyes-universal-poc', 'eyes-leanft', 'eyes-images-legacy', 'eyes-sdk-core-legacy'];
let template = `  version: 2\n  updates:`;

;(async () => {
    const items = await fs.readdir(path.join(__dirname, '../../'));
    const packages = items.filter(package => !skipList.includes(package) && !package.startsWith('.'));
    for (const package of packages) {
        template += `
  - package-ecosystem: "npm"
    directory: "/packages/${package}"
    schedule:
      interval: "daily"`;
    }
    await fs.writeFile(path.join(__dirname,'../../../.github/dependabot.yml'), template);
})()
