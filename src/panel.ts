import { InjectScriptMessage } from "./background";

var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page",
});

function injectContentScript() {
  backgroundPageConnection.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "./contentScript.js",
  });
}

function attachClick(scriptId: string) {
  const element = document.getElementById(scriptId);
  if (!element) {
    return;
  }

  element.addEventListener("click", () => {
    const injectScriptMessage: InjectScriptMessage = {
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: `./${scriptId}.js`,
    };
    backgroundPageConnection.postMessage(injectScriptMessage);
  });
}

chrome.tabs.onUpdated.addListener(function (_tabId, changeInfo, tab) {
  if (changeInfo.status == "complete" && tab.active) {
    injectContentScript();
  }
});

attachClick("highlightDeepNodes");
attachClick("highlightDeepestNestedElement");
attachClick("highlightElementsWithSingleChild");
attachClick("highlightEmptyElements");
attachClick("highlightClasslessWrapperElements");
attachClick("highlightElementsWithMoreThanSixtyChildElements");
attachClick("highlightAllElements");
attachClick("destroyOverlay");

injectContentScript();
