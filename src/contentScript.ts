const overlayId = "dom-size-extension-overlay-canvas";

interface HostnameOverride {
  readonly selector: string;
}
type HostnameOverrides = Record<string, HostnameOverride>;
const hostnameOverrides: HostnameOverrides = {
  "www.youtube.com": { selector: "ytd-app" },
};

type GetCanvasElement = () => HTMLCanvasElement | null;
const getCanvasElement: GetCanvasElement = () =>
  document.querySelector(`#${overlayId}`);

function showOverlay() {
  const canvas: HTMLCanvasElement | null = getCanvasElement();
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

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

  canvas.style.display = "block";
}

function destroyOverlay() {
  const canvas = getCanvasElement();
  if (canvas) {
    document.body.removeChild(canvas);
  }
}

function getBodyElement(): Element {
  const override = hostnameOverrides[window.location.hostname];
  const overrideElement = override
    ? document.querySelector(override.selector)
    : null;
  return overrideElement || document.body;
}

function resetCanvas() {
  destroyOverlay();

  const bodyElement = getBodyElement();

  const canvas = document.createElement("canvas");
  canvas.id = overlayId;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  canvas.style.position = "absolute";
  canvas.style.top = "0px";
  canvas.style.right = "0px";
  canvas.style.bottom = "0px";
  canvas.style.left = "0px";
  canvas.style.zIndex = "99999999999";
  canvas.style.pointerEvents = "none";
  canvas.style.display = "none";

  canvas.height = bodyElement.clientHeight;
  canvas.width = bodyElement.clientWidth;

  ctx.globalCompositeOperation = "multiply";

  ctx.fillStyle = "rgba(255, 255, 255, .25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.body.append(canvas);
  window.scrollTo(0, 0);
}

function highlightElementInCanvas(
  element: Element,
  canvas: HTMLCanvasElement | null,
  opacity = 0.03
) {
  const rect = element.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top;
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
  ctx.fillRect(x, y, width, height);

  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(255, 0, 0, ${opacity})`;
  ctx.strokeRect(x, y, width, height);
}

function drawLineToElementInCanvas(element: Element) {
  const canvas = getCanvasElement();
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

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
  const canvas = getCanvasElement();

  document
    .querySelectorAll("*")
    .forEach((el) => highlightElementInCanvas(el, canvas));
  showOverlay();
}

function highlightElementsWithMoreThanSixtyChildElements() {
  resetCanvas();
  const canvas = getCanvasElement();

  document.querySelectorAll("*").forEach((el) => {
    if (el.childNodes.length > 60) {
      highlightElementInCanvas(el, canvas);
    }
  });
  showOverlay();
}

function highlightElementsWithDeepNesting() {
  resetCanvas();
  const canvas = getCanvasElement();

  const highlightedElements = new Map();
  let depth = 1;
  let selector = "* > *";
  let deepElements;
  while (document.querySelector(selector)) {
    deepElements = document.querySelectorAll(selector);

    if (depth >= 15) {
      deepElements.forEach((el) => {
        if (!highlightedElements.has(el)) {
          highlightElementInCanvas(el, canvas);
          highlightedElements.set(el, el);
        }
      });
    }

    selector += " > *";
    depth++;
  }

  showOverlay();
}

function highlightDeepestNestedElement() {
  resetCanvas();
  const canvas = getCanvasElement();

  let selector = "*";
  let element: Element;
  element = document.querySelector(selector) as Element;
  while (document.querySelector(selector)) {
    element = document.querySelector(selector) as Element;
    selector += " > *";
  }

  let traversedElement = element;
  let level = 0;
  const maxDepth = getMaxDepth();
  while (traversedElement.parentElement && level < maxDepth / 2) {
    highlightElementInCanvas(traversedElement, canvas);
    traversedElement = traversedElement.parentElement;
    level++;
  }

  drawLineToElementInCanvas(element);

  showOverlay();
}

function highlightElementsWithSingleChild() {
  resetCanvas();
  const canvas = getCanvasElement();

  document.querySelectorAll("*").forEach((el) => {
    if (el.childNodes.length === 1) {
      highlightElementInCanvas(el, canvas);
    }
  });

  showOverlay();
}

function highlightEmptyElements() {
  resetCanvas();
  const canvas = getCanvasElement();

  document.querySelectorAll("*:not(img)").forEach((el) => {
    if (!el.childNodes.length) {
      highlightElementInCanvas(el, canvas);
    }
  });

  showOverlay();
}

function highlightClasslessWrapperElements() {
  resetCanvas();
  const canvas = getCanvasElement();

  document
    .querySelectorAll("div:not([class]), span:not([class])")
    .forEach((el) => {
      highlightElementInCanvas(el, canvas);
    });

  showOverlay();
}
