'use strict';

const {describe, it} = require('mocha');
const {expect} = require('chai');
const {delay} = require('@applitools/functional-commons');
const makeEyesCheckWindow = require('../../../src/browser/eyesCheckWindow');

describe('eyesCheckWindow', () => {
  const fakeCypressFunction = () => {
    return {
      wait: async () => Promise.resolve(),
      viewport: async () => Promise.resolve(),
    };
  };
  const cypress = {viewport: fakeCypressFunction, wrap: fakeCypressFunction};

  it('handles string input', async () => {
    let sendRequestInput;
    const resourcesPutted = [];

    const blob1 = {url: 'blobUrl1', type: 'blobType1', value: {someKey: 'bla'}};
    const blob2 = {url: 'blobUrl2', type: 'blobType2', value: {someKey: 'blabla'}};
    const blobs = [blob1, blob2];
    const resourceUrls = 'resourceUrls';
    const url = 'url';
    const cdt = 'cdt';
    const frames = [];
    const eyesCheckWindow = makeEyesCheckWindow({
      sendRequest,
      processPage,
      cypress,
    });

    const tag = 'some tag';
    // eyesCheckWindow has all args dealt in commands.js
    // therefore it can no longer accept a string directly
    await eyesCheckWindow('bla doc', {tag});
    expect(sendRequestInput).to.eql({
      command: 'checkWindow',
      data: {
        url,
        snapshot: {
          cdt,
          url,
          resourceUrls,
          blobData: [
            {url: 'blobUrl1', type: 'blobType1'},
            {url: 'blobUrl2', type: 'blobType2'},
          ],
          frames,
        },
        tag,
      },
    });
    expect(resourcesPutted).to.eql([
      {
        command: `resource/blobUrl1`,
        data: {someKey: 'bla'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
      {
        command: `resource/blobUrl2`,
        data: {someKey: 'blabla'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
    ]);

    async function sendRequest(arg) {
      await delay(50);
      if (arg.command === 'checkWindow') sendRequestInput = arg;
      else {
        resourcesPutted.push(arg);
      }
    }

    async function processPage() {
      return {resourceUrls, blobs, frames, url, cdt};
    }
  });

  it('handles object input', async () => {
    let sendRequestInput;
    const resourcesPutted = [];

    const blob1 = {url: 'blobUrl1', type: 'blobType1', value: {someKey: 'bla'}};
    const blob2 = {url: 'blobUrl2', type: 'blobType2', value: {someKey: 'blabla'}};
    const blobs = [blob1, blob2];
    const resourceUrls = 'resourceUrls';
    const url = 'url';
    const cdt = 'cdt';
    const frames = [];
    const eyesCheckWindow = makeEyesCheckWindow({
      sendRequest,
      processPage,
      cypress,
    });

    const tag = 'some tag';
    const sizeMode = 'sizeMode';
    const target = 'target';
    const fully = 'fully';
    const selector = 'selector';
    const region = 'region';
    const scriptHooks = 'scriptHooks';
    const ignore = 'ignore';
    const floating = 'floating';
    const layout = 'layout';
    const content = 'content';
    const strict = 'strict';
    const sendDom = 'sendDom';
    const useDom = 'useDom';
    const enablePatterns = 'enablePatterns';
    const ignoreDisplacements = 'ignoreDisplacements';
    const accessibility = 'accessibility';
    const matchLevel = 'matchLevel';
    const visualGridOptions = 'visualGridOptions';
    const variationGroupId = 'variationGroupId';

    await eyesCheckWindow('bla doc', {
      tag,
      sizeMode,
      target,
      fully,
      selector,
      region,
      scriptHooks,
      ignore,
      floating,
      layout,
      content,
      strict,
      sendDom,
      useDom,
      enablePatterns,
      ignoreDisplacements,
      accessibility,
      matchLevel,
      visualGridOptions,
      variationGroupId,
    });
    expect(sendRequestInput).to.eql({
      command: 'checkWindow',
      data: {
        url,
        snapshot: {
          cdt,
          url,
          resourceUrls,
          blobData: [
            {url: 'blobUrl1', type: 'blobType1'},
            {url: 'blobUrl2', type: 'blobType2'},
          ],
          frames,
        },
        tag,
        sizeMode,
        target,
        fully,
        selector,
        region,
        scriptHooks,
        ignore,
        floating,
        layout,
        content,
        strict,
        sendDom,
        useDom,
        enablePatterns,
        ignoreDisplacements,
        accessibility,
        matchLevel,
        visualGridOptions,
        variationGroupId,
      },
    });
    expect(resourcesPutted).to.eql([
      {
        command: `resource/blobUrl1`,
        data: {someKey: 'bla'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
      {
        command: `resource/blobUrl2`,
        data: {someKey: 'blabla'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
    ]);

    async function sendRequest(arg) {
      await delay(50);
      if (arg.command === 'checkWindow') sendRequestInput = arg;
      else {
        resourcesPutted.push(arg);
      }
    }

    async function processPage() {
      return {resourceUrls, blobs, frames, url, cdt};
    }
  });

  it('uploads blobs from all frames and then sends only url+type (blobData)', async () => {
    let sendRequestInput;
    const resourcesPutted = [];

    const blob1 = {url: 'blobUrl1', type: 'blobType1', value: {someKey1: 'bla1'}};
    const blob2 = {url: 'blobUrl2', type: 'blobType2', value: {someKey2: 'bla2'}};
    const blob3 = {url: 'blobUrl3', type: 'blobType3', value: {someKey3: 'bla3'}};
    const blobs = [blob1];
    const resourceUrls = 'resourceUrls';
    const url = 'url';
    const cdt = 'cdt';
    const innerFrame = {
      url: 'url2',
      resourceUrls: [],
      blobs: [blob1, blob3],
      cdt: 'cdt2',
      frames: [],
    };
    const frames = [
      {url: 'url1', resourceUrls: [], blobs: [blob1, blob2], cdt: 'cdt1', frames: [innerFrame]},
    ];
    const eyesCheckWindow = makeEyesCheckWindow({
      sendRequest,
      processPage,
      cypress,
    });

    await eyesCheckWindow('bla doc');

    expect(sendRequestInput).to.eql({
      command: 'checkWindow',
      data: {
        url,
        snapshot: {
          url,
          cdt,
          resourceUrls,
          blobData: [{url: 'blobUrl1', type: 'blobType1'}],
          frames: [
            {
              url: 'url1',
              resourceUrls: [],
              blobData: [
                {url: 'blobUrl1', type: 'blobType1'},
                {url: 'blobUrl2', type: 'blobType2'},
              ],
              cdt: 'cdt1',
              frames: [
                {
                  url: 'url2',
                  resourceUrls: [],
                  blobData: [
                    {url: 'blobUrl1', type: 'blobType1'},
                    {url: 'blobUrl3', type: 'blobType3'},
                  ],
                  cdt: 'cdt2',
                  frames: [],
                },
              ],
            },
          ],
        },
      },
    });
    expect(resourcesPutted).to.eql([
      {
        command: `resource/blobUrl1`,
        data: {someKey1: 'bla1'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
      {
        command: `resource/blobUrl2`,
        data: {someKey2: 'bla2'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
      {
        command: `resource/blobUrl3`,
        data: {someKey3: 'bla3'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
    ]);

    async function sendRequest(arg) {
      await delay(50);
      if (arg.command === 'checkWindow') sendRequestInput = arg;
      else {
        resourcesPutted.push(arg);
      }
    }

    async function processPage() {
      return {resourceUrls, blobs, frames, url, cdt};
    }
  });

  it('uploads blobs from all frames and then sends only url+type (blobData)', async () => {
    let sendRequestInput;
    const resourcesPutted = [];

    const blob1 = {url: 'blobUrl', value: {someKey: 'bla'}};
    const blobs = [blob1];
    const resourceUrls = 'resourceUrls';
    const url = 'url';
    const cdt = 'cdt';
    const eyesCheckWindow = makeEyesCheckWindow({
      sendRequest,
      processPage,
      cypress,
    });

    await eyesCheckWindow('bla doc');

    expect(sendRequestInput).to.eql({
      command: 'checkWindow',
      data: {
        url,
        snapshot: {
          url,
          cdt,
          resourceUrls,
          blobData: [{url: 'blobUrl', type: 'application/x-applitools-unknown'}],
          frames: [],
        },
      },
    });
    expect(resourcesPutted).to.eql([
      {
        command: `resource/blobUrl`,
        data: {someKey: 'bla'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
    ]);

    async function sendRequest(arg) {
      await delay(50);
      if (arg.command === 'checkWindow') sendRequestInput = arg;
      else {
        resourcesPutted.push(arg);
      }
    }

    async function processPage() {
      return {resourceUrls, blobs, frames: [], url, cdt};
    }
  });

  it('handles failure to put resource', async () => {
    let sendRequestInput;
    const resourcesPutted = [];

    const blob1 = {url: 'blobUrl1', type: 'blobType1', value: {someKey: 'bla'}};
    const blob2 = {url: 'blobUrl2', type: 'blobType2', value: {someKey: 'blabla'}};
    const blob3 = {url: 'blobUrl3', type: 'blobType3', value: {someKey: 'blablabla'}};
    const blobs = [blob1, blob2, blob3];
    const resourceUrls = ['resourceUrls'];
    const url = 'url';
    const cdt = 'cdt';
    const frames = [];
    const eyesCheckWindow = makeEyesCheckWindow({
      sendRequest,
      processPage,
      cypress,
    });

    const tag = 'some tag';

    await eyesCheckWindow('bla doc', {tag});

    expect(sendRequestInput).to.eql({
      command: 'checkWindow',
      data: {
        url,
        snapshot: {
          url,
          cdt,
          resourceUrls: ['resourceUrls', 'blobUrl2', 'blobUrl3'],
          blobData: [{url: 'blobUrl1', type: 'blobType1'}],
          frames,
        },
        tag,
      },
    });
    expect(resourcesPutted).to.eql([
      {
        command: `resource/blobUrl1`,
        data: {someKey: 'bla'},
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      },
    ]);

    async function sendRequest(arg) {
      await delay(50);
      if (arg.command === 'checkWindow') {
        sendRequestInput = arg;
      } else if (arg.command === 'resource/blobUrl1') {
        resourcesPutted.push(arg);
      } else {
        throw new Error('some err');
      }
    }

    async function processPage() {
      return {resourceUrls, blobs, frames, url, cdt};
    }
  });

  it('handles non-200 resources (blobs with errorStatusCode)', async () => {
    let sendRequestInput;
    const resourcesPutted = [];

    const blob = {url: 'blobUrl1', errorStatusCode: 500};
    const blobs = [blob];
    const resourceUrls = 'resourceUrls';
    const url = 'url';
    const cdt = 'cdt';
    const frames = [];
    const eyesCheckWindow = makeEyesCheckWindow({
      sendRequest,
      processPage,
      cypress,
    });

    const tag = 'some tag';

    await eyesCheckWindow('bla doc', {tag});
    expect(sendRequestInput).to.eql({
      command: 'checkWindow',
      data: {
        url,
        snapshot: {
          cdt,
          url,
          resourceUrls,
          blobData: [{url: 'blobUrl1', errorStatusCode: 500}],
          frames,
        },
        tag,
      },
    });
    expect(resourcesPutted).to.eql([]);

    async function sendRequest(arg) {
      await delay(50);
      if (arg.command === 'checkWindow') sendRequestInput = arg;
      else {
        resourcesPutted.push(arg);
      }
    }

    async function processPage() {
      return {resourceUrls, blobs, frames, url, cdt};
    }
  });
});
