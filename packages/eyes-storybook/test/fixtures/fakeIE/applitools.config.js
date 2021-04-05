const path = require('path');
const dir = path.resolve(__dirname, './');

module.exports = {
  appName: 'faking IE',
  batchName: 'Fake IE story',
  storybookConfigDir: dir,
  storybookStaticDir: dir,
  browser: [
    {width: 800, height: 600, name: 'chrome'},
    {width: 800, height: 600, name: 'ie11'},
  ],
};
