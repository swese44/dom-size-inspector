export interface InjectScriptMessage {
  readonly tabId: number;
  readonly scriptToInject: string;
}

chrome.runtime.onConnect.addListener(function (devToolsConnection) {
  const devToolsListener = (message: InjectScriptMessage) => {
    chrome.tabs.executeScript(message.tabId, { file: message.scriptToInject });
  };

  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener(function () {
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});
