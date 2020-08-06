var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page",
});

function injectContentScript() {
  backgroundPageConnection.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "./contentScript.js",
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete" && tab.active) {
    injectContentScript();
  }
});

document
  .getElementById("highlight_deep_nodes")
  .addEventListener("click", () => {
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: "./highlightDeepNodes.js",
    });
  });

document
  .getElementById("highlight_deepest_nodes")
  .addEventListener("click", () => {
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: "./highlightDeepestNodes.js",
    });
  });

document
  .getElementById("highlight_single_child_nodes")
  .addEventListener("click", () => {
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: "./highlightElementsWithSingleChild.js",
    });
  });

document
  .getElementById("highlight_empty_nodes")
  .addEventListener("click", () => {
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: "./highlightEmptyElements.js",
    });
  });

document
  .getElementById("highlight_classless_nodes")
  .addEventListener("click", () => {
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: "./getClasslessWrapperElements.js",
    });
  });

document
  .getElementById("highlight_large_parent_nodes")
  .addEventListener("click", () => {
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      scriptToInject: "./highlightElementsWithMoreThanSixtyChildElements.js",
    });
  });

document.getElementById("highlight_all_nodes").addEventListener("click", () => {
  backgroundPageConnection.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "./highlightAllElements.js",
  });
});

document.getElementById("hide_overlay").addEventListener("click", () => {
  backgroundPageConnection.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "./hideOverlay.js",
  });
});

injectContentScript();
