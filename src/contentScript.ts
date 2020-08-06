const overlayId = "dom-size-extension-overlay-canvas";
let overlay;
let ctx;

const hostnameOverrides = {
  "www.youtube.com": { selector: "ytd-app" },
};

function showOverlay() {
  const totalDomNodes = getTotalDomNodes();
  const maxDepth = getMaxDepth();

  // Info text background
  const boxWidth = 170;
  const boxHeight = 55;
  const boxPadding = 10;
  const boxTopOffset = 200;

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(255, 255, 255, .75)";
  ctx.fillRect(boxPadding, boxTopOffset, boxWidth, boxHeight);

  // Info text
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#333333";
  ctx.fillText(
    `${totalDomNodes} DOM Nodes`,
    boxPadding * 2,
    boxTopOffset + boxPadding + boxPadding
  );
  ctx.fillText(
    `${maxDepth} max depth`,
    boxPadding * 2,
    boxTopOffset + boxPadding + boxPadding + 25
  );

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 0, 0, .25)";
  ctx.strokeRect(boxPadding, boxTopOffset, boxWidth, boxHeight);

  document.body.append(overlay);
}

function hideOverlay() {
  try {
    document.body.removeChild(document.querySelector(`#${overlayId}`));
  } catch (e) {}
}

function getBodyElement() {
  const override = hostnameOverrides[window.location.hostname];
  if (override) {
    return document.querySelector(override.selector);
  }

  return document.body;
}

function resetCanvas() {
  hideOverlay();

  const bodyElement = getBodyElement();

  overlay = document.createElement("canvas");
  overlay.id = overlayId;

  // Move these styles to a CSS file
  overlay.style.position = "absolute";
  overlay.style.top = "0px";
  overlay.style.right = "0px";
  overlay.style.bottom = "0px";
  overlay.style.left = "0px";
  overlay.style.zIndex = 99999999999;
  overlay.style.pointerEvents = "none";

  overlay.height = bodyElement.clientHeight;
  overlay.width = bodyElement.clientWidth;

  ctx = overlay.getContext("2d");
  ctx.globalCompositeOperation = "multiply";

  ctx.fillStyle = "rgba(255, 255, 255, .25)";
  ctx.fillRect(0, 0, overlay.width, overlay.height);

  // ctx.clearRect(0, 0, overlay.width, overlay.height);

  window.scrollTo(0, 0);
}

function highlightElementInCanvas(element, opacity = 0.03) {
  const rect = element.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top;
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  // console.log(`${x}, ${y}, ${width}, ${height}`);

  ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
  ctx.fillRect(x, y, width, height);

  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(255, 0, 0, ${opacity})`;
  ctx.strokeRect(x, y, width, height);
}

function drawLineToElementInCanvas(element) {
  const lineWidth = 10;

  const rect = element.getBoundingClientRect();

  ctx.strokeStyle = `rgba(255, 0, 0, .5)`;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(document.body.clientWidth, 0);
  ctx.lineTo(rect.left + lineWidth, rect.top);
  ctx.stroke();
}

function getMaxDepth() {
  let depth = 1;
  let selector = "* > *";
  while (document.querySelector(selector)) {
    selector += " > *";
    depth++;
  }
  return depth;
}

function getTotalDomNodes() {
  return document.querySelectorAll("*").length;
}

function highlightAllElements() {
  resetCanvas();
  document.querySelectorAll("*").forEach((el) => highlightElementInCanvas(el));
  showOverlay();
}

function highlightElementsWithMoreThanSixtyChildElements() {
  resetCanvas();
  document.querySelectorAll("*").forEach((el) => {
    if (el.childNodes.length > 60) {
      highlightElementInCanvas(el);
    }
  });
  showOverlay();
}

function highlightElementsWithDeepNesting() {
  resetCanvas();

  const highlightedElements = new Map();
  let depth = 1;
  let selector = "* > *";
  let deepElements;
  while (document.querySelector(selector)) {
    deepElements = document.querySelectorAll(selector);

    if (depth >= 15) {
      deepElements.forEach((el) => {
        if (!highlightedElements.has(el)) {
          highlightElementInCanvas(el);
          highlightedElements.set(el, el);
        }
      });
    }

    selector += " > *";
    depth++;
  }

  showOverlay();
}

function highlightDeepestNestedElements() {
  resetCanvas();

  let selector = "*";
  let element = document.querySelector(selector);
  while (document.querySelector(selector)) {
    element = document.querySelector(selector);
    selector += " > *";
  }

  let traversedElement = element;
  let level = 0;
  const maxDepth = getMaxDepth();
  while (traversedElement.parentElement && level < maxDepth / 2) {
    highlightElementInCanvas(traversedElement);
    traversedElement = traversedElement.parentElement;
    level++;
  }

  drawLineToElementInCanvas(element);

  showOverlay();
}

function highlightElementsWithSingleChild() {
  resetCanvas();

  document.querySelectorAll("*").forEach((el) => {
    if (el.childNodes.length === 1) {
      highlightElementInCanvas(el);
    }
  });

  showOverlay();
}

function highlightEmptyElements() {
  resetCanvas();

  document.querySelectorAll("*:not(img)").forEach((el) => {
    if (!el.childNodes.length) {
      highlightElementInCanvas(el);
    }
  });

  showOverlay();
}

function getClasslessWrapperElements() {
  resetCanvas();

  document
    .querySelectorAll("div:not([class]), span:not([class])")
    .forEach((el) => {
      highlightElementInCanvas(el);
    });

  showOverlay();
}
