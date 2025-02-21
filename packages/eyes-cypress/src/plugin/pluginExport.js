'use strict';
const isGlobalHooksSupported = require('./isGlobalHooksSupported');
const {presult} = require('@applitools/functional-commons');

function makePluginExport({startServer, eyesConfig, globalHooks}) {
  return function pluginExport(pluginModule) {
    let closeEyesServer;
    const pluginModuleExports = pluginModule.exports;
    pluginModule.exports = async function(...args) {
      const {eyesPort, closeServer} = await startServer();
      closeEyesServer = closeServer;
      const [origOn, config] = args;
      let isGlobalHookCalledFromUserHandler = false;
      eyesConfig.eyesIsGlobalHooksSupported = isGlobalHooksSupported(config);
      const moduleExportsResult = await pluginModuleExports(onThatCallsUserDefinedHandler, config);
      if (eyesConfig.eyesIsGlobalHooksSupported && !isGlobalHookCalledFromUserHandler) {
        for (const [eventName, eventHandler] of Object.entries(globalHooks)) {
          origOn.call(this, eventName, eventHandler);
        }
      }
      return Object.assign({}, eyesConfig, {eyesPort}, moduleExportsResult);

      // This piece of code exists because at the point of writing, Cypress does not support multiple event handlers:
      // https://github.com/cypress-io/cypress/issues/5240#issuecomment-948277554
      // So we wrap Cypress' `on` function in order to wrap the user-defined handler. This way we can call our own handler
      // in addition to the user's handler
      function onThatCallsUserDefinedHandler(eventName, handler) {
        const isRunEvent = eventName === 'before:run' || eventName === 'after:run';
        let handlerToCall = handler;
        if (eyesConfig.eyesIsGlobalHooksSupported && isRunEvent) {
          handlerToCall = handlerThatCallsUserDefinedHandler;
          isGlobalHookCalledFromUserHandler = true;
        }
        return origOn.call(this, eventName, handlerToCall);

        async function handlerThatCallsUserDefinedHandler() {
          const [err] = await presult(
            Promise.resolve(globalHooks[eventName].apply(this, arguments)),
          );
          await handler.apply(this, arguments);
          if (err) {
            throw err;
          }
        }
      }
    };
    return function getCloseServer() {
      return closeEyesServer;
    };
  };
}

module.exports = makePluginExport;
