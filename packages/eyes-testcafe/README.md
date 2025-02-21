# Eyes-Testcafe

<img src="https://img.shields.io/badge/node-%3E%3D%2010-green">

Applitools Eyes SDK for [Testcafe](https://devexpress.github.io/testcafe/).

## Installation

Install Eyes-Testcafe as a local dev dependency in your tested project:

```bash
npm i -D @applitools/eyes-testcafe
```

## Applitools API key

In order to authenticate via the Applitools server, you need to supply the Eyes-Testcafe SDK with the API key you got from Applitools. Read more about how to obtain the API key [here](https://applitools.com/docs/topics/overview/obtain-api-key.html).

To to this, set the environment variable `APPLITOOLS_API_KEY` to the API key before running your tests.
For example, on Linux/Mac:

```bash
export APPLITOOLS_API_KEY=<your_key>
npx testcafe chrome:headless some-test-dir
```

And on Windows:

```bash
set APPLITOOLS_API_KEY=<your_key>
npx testcafe chrome:headless some-test-dir
```

It's also possible to specify the API key in the `applitools.config.js` file. The property name is `apiKey`. For example:

```js
module.exports = {
  apiKey: 'YOUR_API_KEY',
  ...
}
```

See the [Advanced configuration](#method-3-the-applitoolsconfigjs-file) section below for more information on using the config file.

## Usage

After defining the API key, you will be able to use commands from Eyes-Testcafe in your testcafe tests to take screenshots and use Applitools Eyes to manage them:

### Example

```js
import Eyes from '@applitools/eyes-testcafe';
const eyes = new Eyes();

fixture`Hello world`
  .page('https://applitools.com/helloworld')
  .afterEach(async () => eyes.close())
  .after(async () => eyes.waitForResults());
  
test('Cookies', async t => {
  await eyes.open({
      appName: 'Hello World!',
      testName: 'My first JavaScript test!',
      browser: [{ width: 800, height: 600, name: 'firefox' }],
      t
  });
  await eyes.checkWindow('Main Page');
  await t.click('button')
  await eyes.checkWindow('Click!');
});
```
<br/>

### Index
- [Eyes-Testcafe](#eyes-testcafe)
  - [Installation](#installation)
  - [Applitools API key](#applitools-api-key)
  - [Usage](#usage)
    - [Example](#example)
    - [Index](#index)
- [API](#api)
    - [**open**](#open)
    - [**checkWindow**](#checkwindow)
      - [Arguments to `eyes.checkWindow`](#arguments-to-eyescheckwindow)
    - [**close**](#close)
    - [**waitForResults**](#waitforresults)
  - [Best practice for using the SDK](#best-practice-for-using-the-sdk)
  - [Concurrency](#concurrency)
    - [Running wih testcafe concurrency](#running-wih-testcafe-concurrency)
    - [Applitools concurrency](#applitools-concurrency)
  - [Advanced configuration](#advanced-configuration)
      - [Configuration properties:](#configuration-properties)
    - [Global configuration properties:](#global-configuration-properties)
    - [Method 1: Arguments for `eyes.open`](#method-1-arguments-for-eyesopen)
    - [Method 2: Environment variables](#method-2-environment-variables)
    - [Method 3: The `applitools.config.js` file](#method-3-the-applitoolsconfigjs-file)
  - [Configuring the browser](#configuring-the-browser)
    - [Previous browser versions](#previous-browser-versions)
    - [Getting a screenshot of multiple browsers in parallel](#getting-a-screenshot-of-multiple-browsers-in-parallel)
    - [Device emulation](#device-emulation)
    - [iOS device](#ios-device)
  - [Troubleshooting](#troubleshooting)

<br/><br/><br/>

# API

### **open**

Create an Applitools test.
This will start a session with the Applitools server.

```js
eyes.open({
  appName: '',
  testName: '',
  t
});
```

It's possible to pass a config object to `open` with all the possible configuration properties. Read the [Advanced configuration](#advanced-configuration) section for a detailed description.

### **checkWindow**

Generate a screenshot of the current page and add it to the Applitools Test.

```js
eyes.checkWindow(tag)

OR

eyes.checkWindow({ tag: 'your tag', target: 'your target mode' })
```

#### Arguments to `eyes.checkWindow`

- #### tag 
  (optional): A logical name for this check.
- #### target
   (optional): Possible values are:

  - **`window`**: This is the default value. Capture the entire window or only the viewport. If set then add [fully](#fully) as sibling to determine weather to capture full screen or viewport.
  - **`region`**: Take a screenshot of a region of the page, specified by coordinates or a selector. If set then add [region](#region) or [selector](#selector) as siblings for specifying the region/s.

- #### fully: 
  (optional) In case [target](#target) is `window`, determines wether to capture full page or viewport only. if `true` (default) then captures full page, if `false` then captures viewport.

    ```js
        // capture viewport only
        eyes.checkWindow({
          target: 'window',
          fully: false,
        });
    ```
- #### selector 
  (optional) In case [target](#target) is `region`, this should be the actual css, xpath or [a Testcafe Selector](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors/) to an element, and the screenshot would be the content of that element. For example:

  ```js
      // Using a Testcafe Selector
      import {Selector} from 'testcafe';
      eyes.checkWindow({
        target: 'region',
        selector: Selector('.my-region')
      });

      // Using a Testcafe Selector to reference an element within a shadow DOM
      import {Selector} from 'testcafe';
      eyes.checkWindow({
        target: 'region',
        selector: Selector('#has-shadow-root').shadowRoot().find('.my-region')
      });

      // The shorthand string version defaults to css selectors
      eyes.checkWindow({
        target: 'region',
        selector: '.my-element'
      });

      // Using a css selector
      eyes.checkWindow({
        target: 'region',
        selector: {
          type: 'css',
          selector: '.my-element' // or '//button'
        }
      });

      // Using an xpath selector
      eyes.checkWindow({
        target: 'region',
        selector: {
          type: 'xpath',
          selector: '//button[1]'
        }
      });
  ```

- #### region 
  (optional) In case [target](#target) is `region`, this should be an object describing the region's coordinates. For example:

    ```js
    eyes.checkWindow({
      target: 'region',
      region: {top: 100, left: 0, width: 1000, height: 200}
    });
    ```

- #### ignore 
  (optional): A single or an array of regions to ignore when checking for visual differences. For example:

    ```js
    eyes.checkWindow({
      ignore: [
        {top: 100, left: 0, width: 1000, height: 100},
        {selector: '.some-div-to-ignore'},
        {selector: Selector('.some-div')}
      ]
    });
    ```

- #### floating
  (optional): A single or an array of floating regions to ignore when checking for visual differences. More information about floating regions can be found in Applitools docs [here](https://help.applitools.com/hc/en-us/articles/360006915292-Testing-of-floating-UI-elements). For example:

    ```js
    eyes.checkWindow({
      floating: [
        {top: 100, left: 0, width: 1000, height: 100, maxUpOffset: 20, maxDownOffset: 20, maxLeftOffset: 20, maxRightOffset: 20},
        {selector: '.some-div-to-float', maxUpOffset: 20, maxDownOffset: 20, maxLeftOffset: 20, maxRightOffset: 20},
        {selector: Selector('.some-div'), maxUpOffset: 20, maxDownOffset: 20, maxLeftOffset: 20, maxRightOffset: 20}
      ]
    });
    ```

- #### layout
  (optional): A single or an array of regions to match as [layout level.](https://help.applitools.com/hc/en-us/articles/360007188591-Match-Levels) For example:
    ```js
    eyes.checkWindow({
      layout: [
        {top: 100, left: 0, width: 1000, height: 100},
        {selector: '.some-div-to-test-as-layout'},
        {selector: Selector('.some-div')}
      ]
    });
    ```

- #### strict
  (optional): A single or an array of regions to match as [strict level.](https://help.applitools.com/hc/en-us/articles/360007188591-Match-Levels) For example:
    ```js
    eyes.checkWindow({
      strict: [
        {top: 100, left: 0, width: 1000, height: 100},
        {selector: '.some-div-to-test-as-strict'},
        {selector: Selector('.some-div')}
      ]
    });
    ```

- #### content
  (optional): A single or an array of regions to match as [content level.](https://help.applitools.com/hc/en-us/articles/360007188591-Match-Levels) For example:
    ```js
    eyes.checkWindow({
      content: [
        {top: 100, left: 0, width: 1000, height: 100},
        {selector: '.some-div-to-test-as-content'},
        {selector: Selector('.some-div')}
      ]
    });
    ```

- #### accessibility
  (optional): A single or an array of regions for checking accessibility on. For example:

  ```js
  eyes.checkWindow({
    accessibility: [
      {accessibilityType: 'RegularText', selector: '.some-div'},
      {accessibilityType: 'RegularText', selector: Selector('.some-div-2')},
      {accessibilityType: 'LargeText', selector: '//*[@id="main"]/h1', type: 'xpath'},
      {accessibilityType: 'BoldText', top: 100, left: 0, width: 1000, height: 100},
    ]
  });
  ```

    Possible accessibilityType values are: `IgnoreContrast`,`RegularText`,`LargeText`,`BoldText` and `GraphicalObject`.
    
- #### scriptHooks 
  (optional): A set of scripts to be run by the browser during the rendering. It is intended to be used as a means to alter the page's state and structure at the time of rendering.
    An object with the following properties:
      - `beforeCaptureScreenshot`: a script that runs after the page is loaded but before taking the screenshot. For example:

        ```js
        eyes.checkWindow({
          scriptHooks: {
            beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'"
          }
        })
        ```

- #### sendDom
  (optional): A flag to specify whether a capture of DOM and CSS should be taken when rendering the screenshot. The default value is true. This should only be modified to troubleshoot unexpected behavior, and not for normal production use.

    ```js
    eyes.checkWindow({sendDom: false})
    ```

- #### ignoreDisplacements
  (optional): A flag to specify whether Test Manager should intially display mismatches for image features that have only been displaced, as opposed to real mismatches.

    ```js
    eyes.checkWindow({ignoreDisplacements: true})
    ```

### **close**

Close the applitools test and check that all screenshots are valid.

It is important to call this at the end of each test, symmetrically to `open`(or in `afterEach()`, see [Best practice for using the SDK](#best-practice-for-using-the-sdk)).

Close receives no arguments.

```js
eyes.close();
```

### **waitForResults**

Wait until all tests in the fixture are completed and return their results.

* it is recommended to wait for the results in the testcafe `after()` hook. 

```js
await eyes.waitForResults()
```

waitForResults receives an argument of `throwEx`,

* If `true` (default) and a visual test fails then reject with an `Error` (in case of a general error reject as well).
If the rejection is not handled then Testcafe fails the fixture.

* If `false` and a visual test fails then `waitForResults` resolves with an `Error`.
In case of a general `Error` reject with the `Error`. 

In case all the tests passed then waitForResults resolves with the test results. If using `tapDirPath`, then a tap file will be written to disk with the results as well.

___
<br/>

## Best practice for using the SDK

Every call to `eyes.open` and `eyes.close` defines a test in Applitools Eyes, and all the calls to `eyes.checkWindow` between them are called "steps". In order to get a test structure in Applitools that corresponds to the test structure in Testcafe, it's best to open/close tests in every `test` call. **You can use `afterEach` for calling `eyes.close()`**
 
After all tests are done you should call eyes.waitForResults, **you can use `after()` for calling `eyes.waitForResults`**, this is is done for two reasons:
1. to signal testcafe to wait until all the tests have been completed.
2. to obtain test results if needed.

```js
fixture`Hello world`
  .page('https://applitools.com/helloworld')
  .afterEach(async () => eyes.close());
  .after(async () => eyes.waitForResults())
```

Applitools will take screenshots and perform the visual comparisons in the background. Performance of the tests will not be affected during the test run, but there will be a small phase at the end of the test run that waits for visual tests to end.

* When running tests [concurrently](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/run-tests.html#run-tests-concurrently) you should create an eyes instance for each test, see [Running wih testcafe concurrency.](#Running-wih-testcafe-concurrency)
___
<br/>

## Concurrency

### Running wih testcafe concurrency

Since Applitools tests are started by calling `eyes.open()` and ended by calling `eyes.close()` then when running Testcafe [concurrently](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/run-tests.html#run-tests-concurrently) you should create an eyes instance per test, so you can call `eyes.open()` and `eyes.close()` on a per test basis, see example:

```js
fixture `hello world`.page`https://www.example.com/hello.html`

test('test 1', async t => {
  const eyes = new Eyes();
  await eyes.open({appName: 'TestCafe', testName: 'test 1', t});
  await eyes.checkWindow({tag: 'Page 1'});
  await eyes.close()
  await eyes.waitForResults()
});

test('test 2', async t => {
  const eyes = new Eyes();
  await eyes.open({appName: 'TestCafe', testName: 'test 2', t});
  await eyes.checkWindow({tag: 'Page 2'});
  await eyes.close()
  await eyes.waitForResults() 
});
```

* Note that now each test would result in a different Applitools [batch](#Configuration-properties:), if you want to keep all the tests in the same batch you can set [batchId:](#Configuration-properties:)
   
  ```js
  const batchId = `bid_${String(Math.random()).slice(2)}`
  fixture `hello world`.page`https://www.example.com/hello.html`
  test('test 1', async t => {
    const eye = new Eyes();
    await eyes.open({batchId, t ...});
    ...
  });

  test('test 2', async t => {
    const eyes = new Eyes();
    await eyes.open({batchId, t ...});
  ...
  });
  ```

### Applitools concurrency

The default level of concurrency for free accounts is `1`. This means that visual tests will not run in parallel during your tests, and will therefore be slow.
If your account does support a higher level of concurrency, it's possible to pass a different value by specifying it in the property `concurrency` in the applitools.config.js file (see [Advanced configuration](#advanced-configuration) section below).

If you are interested in speeding up your visual tests, contact sdr@applitools.com to get a trial account and faster tests with more concurrency.
___
<br/>

## Advanced configuration

There are 3 ways to specify test configuration:
1) Arguments to `eyes.open()`
2) Environment variables
3) The `applitools.config.js` file

The list above is also the order of precedence, which means that if you pass a property to `eyes.open` it will override the environment variable, and the environment variable will override the value defined in the `applitools.config.js` file.

#### Configuration properties:

| Property name             | Default value               | Description   |
| -------------             |:-------------               |:-----------   |
| `testName`                | undefined | The test name |
| `browser`                 | { width: 800, height: 600, name: 'chrome' } | The size and browser of the generated screenshots. This doesn't need to be the same as the browser that Testcafe is running. It could be a different size and also a different browser. For more info and possible values, see the [browser section below](#configuring-the-browser).<br/><br/>*Note: for best performance if possible eyes resizes the viewport to the given browser size.*|
| `batchId`                 | random                      | Provides ability to group tests into batches. Read more about batches [here](https://applitools.com/docs/topics/working-with-test-batches/how-to-group-tests-into-batches.html). |
| `batchName`               | The name of the first test in the batch                   | Provides a name to the batch (for display purpose only). |
| `baselineEnvName`         | undefined                   | The name of the environment of the baseline. |
| `envName`                 | undefined                   | A name for the environment in which the application under test is running. |
| `ignoreCaret`             | false                       | Whether to ignore or the blinking caret or not when comparing images. |
| `matchLevel`              | Strict                      | The method to use when comparing two screenshots, which expresses the extent to which the two images are expected to match. Possible values are `Strict`, `Exact`, `Layout` and `Content`. Read more about match levels [here](http://support.applitools.com/customer/portal/articles/2088359). |
| `baselineBranchName`      | undefined                   | The name of the baseline branch. |
| `parentBranchName`        | undefined                   | Sets the branch under which new branches are created. |
| `saveFailedTests`         | false                       | Set whether or not failed tests are saved by default. |
| `saveNewTests`            | false                       | Set whether or not new tests are saved by default. |
| `properties`              | undefined                   | Custom properties for the eyes test. The format is an array of objects with name/value properties. For example: `[{name: 'My prop', value:'My value'}]`. |
| `ignoreDisplacements`     | false                       | Sets whether Test Manager should intially display mismatches for image features that have only been displaced, as opposed to real mismatches. |
| `compareWithParentBranch` | false                       |  |
| `ignoreBaseline`          | false                       |  |
| `notifyOnCompletion`  | false | If `true` batch completion notifications are sent. |
| `accessibilityValidation` | undefined | An object that specifies the accessibility level and guidelines version to use for the screenshots. Possible values for **level** are `None`, `AA` and `AAA`, and possible values for **guidelinesVersion** are `WCAG_2_0` and `WCAG_2_1`. For example: `{level: 'AA', guidelinesVersion: 'WCAG_2_0'}`|
<br/>
<!-- | `accessibilityLevel` | None | The accessibility level to use for the screenshots. Possible values are `None`, `AA` and `AAA`. | -->

### Global configuration properties:

The following configuration properties cannot be defined using the first method of passing them to `eyes.open`. They should be defined either in the `applitools.config.js` file or as environment variables.

| Property name             | Default value               | Description   |
| -------------             |:-------------               |:-----------   |
| `apiKey`                  | undefined                   | The API key used for working with the Applitools Eyes server. See more info in the [Applitools API key](#applitools-api-key) section above |
| `showLogs`                | false                       | Whether or not you want to see logs. Logs are written to the same output of the Testcafe process. <br/><br/>_Note that you can also use [DEBUG=eyes*](https://github.com/visionmedia/debug) for debugging._|
| `serverUrl`               | Default Eyes server URL     | The URL of Eyes server |
| `proxy`                   | undefined                   | Sets the proxy settings to be used in network requests to Eyes server. This can be either a string to the proxy URI, or an object containing the URI, username and password.<br/><br/>For example:<br/>`{url: 'https://myproxy.com:443', username: 'my_user', password: 'my_password', isHttpOnly: false}`<br/>or:<br/>`"https://username:password@myproxy.com:443"` |
| `isDisabled`              | false                       | If true, all api calls to Eyes-Testcafe are ignored. |
| `failTestcafeOnDiff`       | true                        | If true, then the Testcafe test fails if an eyes visual test fails. If false and an eyes test fails, then the Testcafe test does not fail. 
| `tapDirPath`              | undefined                   | Directory path of a results file. If set, then a [TAP](https://en.wikipedia.org/wiki/Test_Anything_Protocol#Specification) file is created in this directory when using the `waitForResults` command in your test. The tap file name is created with the name eyes-[\<ISO-DATE\>](https://en.wikipedia.org/wiki/ISO_8601)\.tap and contains the Eyes test results <br><br/> _Note that results are scoped per spec file, this means that the results file is created once for each fixture file)._|
| `concurrency`             | 1                           | The maximum number of tests that can run concurrently. The default value is the allowed amount for free accounts. For paid accounts, set this number to the quota set for your account. |
| `dontCloseBatches`| false | If true, batches are not closed for  [notifyOnCompletion](#advanced-configuration).|
| `disableBrowserFetching` | false | When true, the SDK will fetch the resources needed for UFG rendering from outside of the browser (useful for sites with large payloads).

### Method 1: Arguments for `eyes.open`

Pass a config object as the only argument. For example:

```js
eyes.open({
  appName: 'My app',
  batchName: 'My batch',
  ...
  // all other configuration variables apply
})
```

### Method 2: Environment variables

The name of the corresponding environment variable is in uppercase, with the `APPLITOOLS_` prefix, and separating underscores instead of camel case:

```js
APPLITOOLS_APP_NAME
APPLITOOLS_SHOW_LOGS
APPLITOOLS_BATCH_NAME
APPLITOOLS_CONCURRENCY
APPLITOOLS_SAVE_DEBUG_DATA
APPLITOOLS_BATCH_ID
APPLITOOLS_BATCH_NAME
APPLITOOLS_BASELINE_ENV_NAME
APPLITOOLS_ENV_NAME
APPLITOOLS_IGNORE_CARET
APPLITOOLS_IS_DISABLED
APPLITOOLS_MATCH_LEVEL
APPLITOOLS_MATCH_TIMEOUT
APPLITOOLS_BRANCH_NAME
APPLITOOLS_BASELINE_BRANCH_NAME
APPLITOOLS_PARENT_BRANCH_NAME
APPLITOOLS_SAVE_FAILED_TESTS
APPLITOOLS_SAVE_NEW_TESTS
APPLITOOLS_COMPARE_WITH_PARENT_BRANCH
APPLITOOLS_IGNORE_BASELINE
APPLITOOLS_SERVER_URL
APPLITOOLS_PROXY
APPLITOOLS_NOTIFY_ON_COMPLETION
```
<!-- APPLITOOLS_ACCESSIBILITY_LEVEL -->

### Method 3: The `applitools.config.js` file

It's possible to have a file called `applitools.config.js` at the same folder location as `.testcaferc.json`. _(The directory from which you run TestCafe. This is usually the project's root directory)_. <br>In this file specify the desired configuration, in a valid JSON format. For example:

```js
module.exports = {
  appName: 'My app',
  showLogs: true,
  batchName: 'My batch'
  ...
  // all other configuration variables apply
}
```
<br/>

## Configuring the browser

Eyes-Testcafe will take a screenshot of the page in the requested browser, the browser can be set in the `applitools.config.js` or by passing it to `eyes.open`.

Possible values are:

- `chrome`
- `firefox`
- `edgechromium`
- `edgelegacy`
- `ie10`
- `ie11`
- `safari`
- `chrome-one-version-back`
- `chrome-two-versions-back`
- `firefox-one-version-back`
- `firefox-two-versions-back`
- `safari-one-version-back`
- `safari-two-versions-back`
- `edgechromium-one-version-back`
- `edgechromium-two-versions-back`

### Previous browser versions

`*-one-version-back` and `*-two-versions-back` are relative to the version of the same browser. For example, if `chrome` refers to version 79, then `chrome-one-version-back` will be Chrome 78 and `chrome-two-versions-back` will be Chrome 77.

### Getting a screenshot of multiple browsers in parallel

It's also possible to send an array of browsers, for example:

```js
eyes.open({
  ...
  browser: [
    {width: 800, height: 600, name: 'firefox'},
    {width: 1024, height: 768, name: 'chrome'},
    {width: 1024, height: 768, name: 'ie11'}
  ]
}
```
**Note**: that if only a single browser is set, then Eyes-Testcafe changes the testcafe's browser viewport to that size.  

### Device emulation

To enable chrome's device emulation, it's possible to send a device name and screen orientation, for example:

```js
eyes.open({
  // ...
  browser: {
    deviceName: 'iPhone X',
    screenOrientation: 'landscape',
    name: 'chrome' // optional, just to make it explicit this is browser emulation and not a real device. Only chrome is supported for device emulation.
  }
}
```

Possible values for screen orientation are `landscape` and `portrait`, and if no value is specified, the default is `portrait`.

The list of device names is taken from [chrome devtools predefined devices](https://raw.githubusercontent.com/chromium/chromium/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/devtools/front_end/emulated_devices/module.json), and can be obtained by running the following command in a unix-based shell (installing [`jq`](https://stedolan.github.io/jq/) might be needed):

```sh
curl -s https://raw.githubusercontent.com/chromium/chromium/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/devtools/front_end/emulated_devices/module.json | jq '.extensions[].device.title'
```

In addition, it's possible to use chrome's device emulation with custom viewport sizes, pixel density and mobile mode, by passing `deviceScaleFactor` and `mobile` in addition to `width` and `height`. For example:

```js
eyes.open({
  // ...
  browser: {
    width: 800,
    height: 600,
    deviceScaleFactor: 3,
    mobile: true,
    name: 'chrome' // optional, just to make it explicit this is browser emulation and not a real device. Only chrome is supported for device emulation.
  }
}
```

### iOS device

```js
eyes.open({
  // ...
  browser: {
    iosDeviceInfo: {
      deviceName: 'iPhone XR',
      screenOrientation: 'landscape', // optional, default: 'portrait'
      iosVersion: 'latest' // optional, default: undefined (i.e. the default is determined by the Ultrafast grid)
    },
  }
})
```

The list of devices is available at https://github.com/applitools/eyes.sdk.javascript1/blob/master/packages/eyes-sdk-core/lib/config/IosDeviceName.js

Possible values for `iosVersion` are:

- `'latest'` - the latest iOS version that's supported by the UFG
- `'latest-1'` - one version prior to the latest version
- `undefined` - the UFG's default
___
## Troubleshooting

* If issues occur, DEBUG_SAVE=1 env variable can be set to save helpful information. The information will be saved under a folder named `.applitools` in the current working directory. This could be then used for getting support on your issue.
 * You can also use [DEBUG=eyes*](https://github.com/visionmedia/debug) for debugging.

