document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    apiKey: document.getElementById('apiKey'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    geminiApiKey: document.getElementById('geminiApiKey'),
    toggleGeminiApiKey: document.getElementById('toggleGeminiApiKey'),
    model: document.getElementById('model'),
    autoHighlight: document.getElementById('autoHighlight'),
    contextMenu: document.getElementById('contextMenu'),
    totalExplanations: document.getElementById('totalExplanations'),
    wordsLearned: document.getElementById('wordsLearned'),
    clearData: document.getElementById('clearData'),
    saveBtn: document.getElementById('saveBtn'),
    statusMessage: document.getElementById('statusMessage')
  };
  
  await loadSettings();
  await loadStats();
  
  elements.toggleApiKey.addEventListener('click', () => toggleApiKeyVisibility(elements.apiKey, elements.toggleApiKey));
  elements.toggleGeminiApiKey.addEventListener('click', () => toggleApiKeyVisibility(elements.geminiApiKey, elements.toggleGeminiApiKey));
  elements.saveBtn.addEventListener('click', saveSettings);
  elements.clearData.addEventListener('click', clearAllData);
  
  elements.apiKey.addEventListener('input', clearStatus);
  elements.geminiApiKey.addEventListener('input', clearStatus);
  
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get([
        'apiKey',
        'geminiApiKey',
        'model',
        'autoHighlight',
        'contextMenu'
      ]);
      
      if (settings.apiKey) {
        elements.apiKey.value = settings.apiKey;
      }
      if (settings.geminiApiKey) {
        elements.geminiApiKey.value = settings.geminiApiKey;
      }
      
      elements.model.value = settings.model || 'gemini-2.5-flash';
      elements.autoHighlight.checked = settings.autoHighlight !== false;
      elements.contextMenu.checked = settings.contextMenu !== false;
    } catch (error) {
      showStatus('Failed to load settings', 'error');
    }
  }
  
  async function loadStats() {
    try {
      const stats = await chrome.storage.local.get([
        'totalExplanations',
        'wordsLearned'
      ]);
      
      elements.totalExplanations.textContent = stats.totalExplanations || 0;
      elements.wordsLearned.textContent = stats.wordsLearned || 0;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }
  
  function toggleApiKeyVisibility(inputElement, toggleButton) {
    const isPassword = inputElement.type === 'password';
    inputElement.type = isPassword ? 'text' : 'password';
    toggleButton.textContent = isPassword ? '🙈 Hide' : '👁️ Show';
  }
  
  async function saveSettings() {
    const apiKey = elements.apiKey.value.trim();
    const geminiApiKey = elements.geminiApiKey.value.trim();
    const model = elements.model.value;

    if (model.startsWith('gpt-') && !apiKey) {
      showStatus('Please enter your OpenAI API key', 'error');
      elements.apiKey.focus();
      return;
    }

    if (model.startsWith('gemini-') && !geminiApiKey) {
      showStatus('Please enter your Gemini API key', 'error');
      elements.geminiApiKey.focus();
      return;
    }

    if (apiKey && !isValidOpenAIApiKey(apiKey)) {
      showStatus('Please enter a valid OpenAI API key (starts with sk-)', 'error');
      elements.apiKey.focus();
      return;
    }

    if (geminiApiKey && !isValidGeminiApiKey(geminiApiKey)) {
      showStatus('Please enter a valid Gemini API key', 'error');
      elements.geminiApiKey.focus();
      return;
    }
    
    try {
      const settings = {
        apiKey: apiKey,
        geminiApiKey: geminiApiKey,
        model: model,
        autoHighlight: elements.autoHighlight.checked,
        contextMenu: elements.contextMenu.checked
      };
      
      await chrome.storage.sync.set(settings);
      showStatus('Settings saved successfully!', 'success');
      
      setTimeout(clearStatus, 3000);
    } catch (error) {
      showStatus('Failed to save settings. Please try again.', 'error');
    }
  }
  
  async function clearAllData() {
    if (!confirm('Are you sure you want to clear all extension data? This action cannot be undone.')) {
      return;
    }
    
    try {
      await chrome.storage.local.clear();
      await chrome.storage.sync.clear();
      
      elements.apiKey.value = '';
      elements.geminiApiKey.value = '';
      elements.model.value = 'gemini-2.5-flash';
      elements.autoHighlight.checked = true;
      elements.contextMenu.checked = true;
      elements.totalExplanations.textContent = '0';
      elements.wordsLearned.textContent = '0';
      
      showStatus('All data cleared successfully!', 'success');
    } catch (error) {
      showStatus('Failed to clear data. Please try again.', 'error');
    }
  }
  
  function isValidOpenAIApiKey(key) {
    return key.startsWith('sk-') && key.length > 20;
  }

  function isValidGeminiApiKey(key) {
    // Gemini API keys don't have a fixed prefix, so we'll just check for a minimum length
    return key.length > 30;
  }
  
  function showStatus(message, type) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;
    elements.statusMessage.style.display = 'block';
  }
  
  function clearStatus() {
    elements.statusMessage.style.display = 'none';
    elements.statusMessage.textContent = '';
    elements.statusMessage.className = 'status-message';
  }
});