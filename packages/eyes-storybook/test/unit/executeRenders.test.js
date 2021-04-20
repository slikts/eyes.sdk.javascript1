const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeExecuteRenders = require('../../src/executeRenders');

describe('executeRenders', () => {
  it('should call executeRender for each config', async () => {
    const results = {};
    let counter = 0;
    const executeRenders = makeExecuteRenders({
      timeItAsync: (_a, b) => b(),
      renderStories: async function(stories, config) {
        Object.assign(results[counter], {stories, config});
        return stories;
      },
      pagePool: {},
      stories: [{hello: 'world'}],
      logger: {
        verbose: function(log) {
          counter++;
          results[counter] = {log};
        },
      },
      setRenderIE: {},
    });
    const viewport = {width: 800, height: 600};

    await executeRenders([
      {browser: [{name: 'chrome', ...viewport}]},
      {browser: [{name: 'firefox', ...viewport}]},
    ]);
    expect(results.pagePoolDrained).to.be.undefined;
    expect(results).to.deep.equal({
      '1': {
        log: 'executing render story with {"browser":[{"name":"chrome","width":800,"height":600}]}',
        stories: [
          {
            hello: 'world',
          },
        ],
        config: {
          browser: [
            {
              name: 'chrome',
              width: 800,
              height: 600,
            },
          ],
        },
      },
      '2': {
        log:
          'executing render story with {"browser":[{"name":"firefox","width":800,"height":600}]}',
        stories: [
          {
            hello: 'world',
          },
        ],
        config: {
          browser: [
            {
              name: 'firefox',
              width: 800,
              height: 600,
            },
          ],
        },
      },
    });
  });

  it('should drain pool in case of IE', async () => {
    const results = {};
    let counter = 0;
    let poolDrained = false;
    let renderIE = false;

    const executeRenders = makeExecuteRenders({
      timeItAsync: (_a, b) => b(),
      renderStories: async function(stories, config) {
        Object.assign(results[counter], {stories, config});
        return stories;
      },
      pagePool: {drain: () => (poolDrained = true)},
      stories: [{hello: 'world'}],
      logger: {
        verbose: function(log) {
          counter++;
          results[counter] = {log};
        },
      },
      setRenderIE: value => (renderIE = value),
    });
    const viewport = {width: 800, height: 600};

    await executeRenders([
      {browser: [{name: 'chrome', ...viewport}]},
      {browser: [{name: 'ie', ...viewport}], fakeIE: true},
    ]);

    expect(poolDrained).to.be.true;
    expect(renderIE).to.be.true;
    expect(results).to.deep.equal({
      '1': {
        log: 'executing render story with {"browser":[{"name":"chrome","width":800,"height":600}]}',
        stories: [
          {
            hello: 'world',
          },
        ],
        config: {
          browser: [
            {
              name: 'chrome',
              width: 800,
              height: 600,
            },
          ],
        },
      },
      '2': {
        log:
          'executing render story with {"browser":[{"name":"ie","width":800,"height":600}],"fakeIE":true}',
        stories: [
          {
            hello: 'world',
          },
        ],
        config: {
          browser: [
            {
              name: 'ie',
              width: 800,
              height: 600,
            },
          ],
          fakeIE: true,
        },
      },
    });
  });
});
