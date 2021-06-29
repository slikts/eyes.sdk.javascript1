# Eyes SDK as a generic browser extension
<center>

  ![Applitools Eyes](https://i.ibb.co/3hWJK68/applitools-eyes-logo.png)

  </center>

The Applitools Eyes SDK can be executed from any general agent which can automate a browser, without prior determination of the specific automation technology (e.g. the "driver").
This is achieved by launching the browser with an installed Eyes SDK browser extension. Once the browser extension is running, it is possible for the automation agent to communicate with it, in order to perform any operation that Applitools SDK's support.

Being a browser extension means that this can be achieved only on browsers which support the WebExtension standard, namely Chrome, Firefox, Edge, and Safari.
At the moment, we support only Chrome.

## Usage

The automation environment should communicate with the Eyes SDK browser extension by executing JavaScript on the automated browser window.

### API

TBD
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

TBD