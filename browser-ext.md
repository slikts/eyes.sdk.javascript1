# Eyes SDK browser extension
<center>

  ![Applitools Eyes](https://i.ibb.co/3hWJK68/applitools-eyes-logo.png)

  </center>

The Applitools Eyes SDK can be executed from any general agent which can automate a browser, without prior determination of the specific automation technology (e.g. the "driver").
This is achieved by launching the browser with an installed Eyes SDK browser extension. Once the browser extension is running, it is possible for the automation agent to communicate with it, in order to perform any operation that Applitools SDK's support.

Being a browser extension means that this can be achieved only on browsers which support the WebExtension standard, namely Chrome, Firefox, Edge, and Safari.
At the moment, we support only Chrome.

The Eyes SDK browser extension supports both UFG and Classic modes of operation, with all features currently supported in standard JS SDK's, e.g. the JavaScript Selenium SDK.

## Limitations

No headless Chrome.

## Installation

GitHub releases

## Usage

The automation environment should communicate with the Eyes SDK browser extension by executing JavaScript on the automated browser window.

### API

Here is the JS methods that are exposed 

#### __applitools.openEyes

of the type [EyesManagerConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L19).

This function should be called for opening the Eyes session. It expects as input a JSON object of the type [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25).

#### __eyes.check

This function should be called for performing a visual checkpoint, after `__eyesOpen` was called. It expects as input a JSON object of the type [CheckSettings](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L66).

#### __eyesClose

This function should be called to close the Eyes session. It receives no input, and returns a JSON object of the type [TestResult](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205).

-->

### Example

In JavaScript Selenium this would look similar to the following:

```js
driver.exectueScript(`TBD for open operation`)
driver.exectueScript(`TBD for check operation`)
driver.exectueScript(`TBD for close operation`)
```

### Script timeout and polling

TBD

## Tosca user API

As an automation environment using the Eyes SDK browser extension, Tosca should expose to the end user the relevant configuration, and transform the user input into the input for the Eyes browser extension.

The various configuration types that should be passed are the following (these will be described in further detail when we add the API details to this document):

- [EyesConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L25)
- [EyesManagerConfig](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/config.ts#L19)
- [CheckSettings](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/setting.ts#L66)

In addition, the test result data returned from the Eyes browser extension should be surfaced to the user. This data is of the following type:

- [TestResult](https://github.com/applitools/eyes.sdk.javascript1/blob/0eec1b760d07489f62d95b9441d0ee5c560c24a1/packages/types/src/data.ts#L205)
