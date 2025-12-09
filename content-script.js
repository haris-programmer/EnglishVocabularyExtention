let selectedText = '';
let selectionTimeout;
let lastSelectedText = '';

function getSelectedText() {
  const selection = window.getSelection();
  return selection.toString().trim();
}

document.addEventListener('dblclick', () => {
  const text = getSelectedText();
  if (text && text.length > 0 && text.length < 500 && text !== lastSelectedText) {
    lastSelectedText = text;
    chrome.runtime.sendMessage({
      action: 'textSelected',
      selectedText: text,
      url: window.location.href,
      openPopup: true
    });
  }
});

function handleTextSelection() {
  clearTimeout(selectionTimeout);
  
  selectionTimeout = setTimeout(() => {
    const text = getSelectedText();
    
    if (text && text.length > 0 && text.length < 500 && text !== lastSelectedText) {
      selectedText = text;
      lastSelectedText = text;
      
      chrome.runtime.sendMessage({
        action: 'textSelected',
        selectedText: text,
        url: window.location.href
      });
    }
  }, 500); // Increased from 300ms to 500ms for better debouncing
}

document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', (event) => {
  if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') {
    handleTextSelection();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const currentSelection = getSelectedText();
    sendResponse({
      selectedText: currentSelection || selectedText,
      url: window.location.href
    });
  }
  
  if (request.action === 'highlightText') {
    highlightSelectedText();
  }
});

function highlightSelectedText() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'english-helper-highlight';
    span.style.backgroundColor = '#ffeb3b';
    span.style.padding = '2px';
    span.style.borderRadius = '3px';
    
    try {
      range.surroundContents(span);
    } catch (e) {
      console.log('Could not highlight text:', e);
    }
  }
}