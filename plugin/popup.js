const toggleButton = document.querySelector("#toggle");
const sizeInput = document.querySelector("#size");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function toggleFocusLine(height) {
  const existing = document.querySelector("#focus-line-extension-layer");
  if (existing) {
    existing.remove();
    document.removeEventListener("mousemove", window.__focusLineMoveHandler);
    window.__focusLineMoveHandler = null;
    return false;
  }

  const layer = document.createElement("div");
  layer.id = "focus-line-extension-layer";
  layer.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483647;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, .38) 0,
      rgba(0, 0, 0, .38) calc(var(--focus-y) - ${height / 2}px),
      rgba(255, 244, 204, .16) calc(var(--focus-y) - ${height / 2}px),
      rgba(255, 244, 204, .16) calc(var(--focus-y) + ${height / 2}px),
      rgba(0, 0, 0, .38) calc(var(--focus-y) + ${height / 2}px),
      rgba(0, 0, 0, .38) 100%
    );
    box-shadow: inset 0 0 0 2px rgba(255, 210, 93, .18);
    --focus-y: 50vh;
  `;
  document.documentElement.appendChild(layer);
  window.__focusLineMoveHandler = (event) => {
    layer.style.setProperty("--focus-y", `${event.clientY}px`);
  };
  document.addEventListener("mousemove", window.__focusLineMoveHandler);
  return true;
}

async function runToggle() {
  const tab = await getActiveTab();
  if (!tab?.id || tab.url?.startsWith("chrome://")) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleFocusLine,
    args: [Number(sizeInput.value)]
  });
}

toggleButton.addEventListener("click", runToggle);
