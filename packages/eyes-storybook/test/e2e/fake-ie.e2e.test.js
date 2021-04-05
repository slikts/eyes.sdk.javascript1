const {describe, it, _before, _after} = require('mocha');
const {expect} = require('chai');
const path = require('path');
const {delay: _psetTimeout, presult} = require('@applitools/functional-commons');
const {sh} = require('@applitools/sdk-shared/src/process-commons');

describe('fake ie', () => {
  it('fake ie in storybook', async () => {
    const [err, result] = await presult(
      sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          '../fixtures/fakeIE/applitools.config.js',
        )}`,
        {
          spawnOptions: {stdio: 'pipe'},
        },
      ),
    );
    const stdout = err ? err.stdout : result.stdout;
    const splittedResult = stdout.split('\n');
    const testResult = `${splittedResult[7]}\n${splittedResult[8]}`;
    expect(testResult).to.equal(
      `Fake IE: Fake IE Page [Chrome 89.0] [800x600] - Passed\nFake IE: Fake IE Page [IE 11.0] [800x600] - Passed`,
    );
  });
});
