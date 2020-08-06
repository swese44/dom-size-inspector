chrome.runtime.onConnect.addListener(function (devToolsConnection) {
  const devToolsListener = (message) => {
    chrome.tabs.executeScript(message.tabId, { file: message.scriptToInject });
  };

  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener(function () {
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});
