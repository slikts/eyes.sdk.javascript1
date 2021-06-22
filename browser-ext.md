# Eyes SDK as a generic browser extension
<center>

  ![Applitools Eyes](https://i.ibb.co/3hWJK68/applitools-eyes-logo.png)

  </center>

The Applitools Eyes SDK can be executed from any general agent which can automate a browser, without the need for prior knowledge on the technical automation technology (e.g. the "driver").
This is achieved by launching the browser with an installed Eyes SDK browser extension.

First and foremost, this means that this can be achieved only on browsers which support the WebExtension standard, namely Chrome, Firefox, Edge, and Safari.
At the moment, we support only Chrome.

## Usage

The automation environment should communicate with the Eyes SDK browser extension by executing JavaScript on the automated browser window.

### API

Here is the JS methods that are exposed 

```js
// TODO should we expose makeManager? Or pass EyesManagerConfig in eyesOpen? 

__eyesOpen(configuration: EyesConfig)

__eyesCheck(checkSettings)

__eyesClose()

```

#### __eyesOpen

This function should be called for opening the Eyes session. It expects as input a JSON object of the type [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25).

#### __eyesCheck

This function should be called for performing a visual checkpoint, after `__eyesOpen` was called. It expects as input a JSON object of the type [CheckSettings](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L66).

#### __eyesClose

This function should be called to close the Eyes session. It receives no input, and returns a JSON object of the type [TestResult](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205).

### Example

```js
// TODO example in C#

driver.exectueScript(`__eyesOpen({
    apiKey: "<API key>,
    appName: "My App",
    testName: "My test",
    viewportSize: {width: 1200, height: 800},
})`)

driver.executeScript(`__eyesCheck({

})`)

driver.executeScript(`__eyesClose()`)
```

### Script timeout and polling

 // TODO expose pollResult

 ## Tosca user API

 // TODO