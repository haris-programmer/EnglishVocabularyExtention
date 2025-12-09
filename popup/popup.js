document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    noSelection: document.getElementById('noSelection'),
    selectedTextContainer: document.getElementById('selectedTextContainer'),
    selectedText: document.getElementById('selectedText'),
    loadingContainer: document.getElementById('loadingContainer'),
    errorContainer: document.getElementById('errorContainer'),
    errorMessage: document.getElementById('errorMessage'),
    statusContainer: document.getElementById('statusContainer'),
    statusMessage: document.getElementById('statusMessage'),
    retryBtn: document.getElementById('retryBtn'),
    explanationContainer: document.getElementById('explanationContainer'),
    settingsBtn: document.getElementById('settingsBtn'),
    vocabularyBtn: document.getElementById('vocabularyBtn'),
    addVocabularyBtn: document.getElementById('addVocabularyBtn'),
    newSearchBtn: document.getElementById('newSearchBtn'),
    // New elements for Urdu Translation
    urduTranslationSection: document.getElementById('urduTranslationSection'),
    urduTranslationText: document.getElementById('urduTranslationText')
  };
  
  let currentSelectedText = '';
  let currentExplanation = null;
  
  await checkForSelectedText();
  
  elements.settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  elements.vocabularyBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'vocabulary/vocabulary.html' });
  });
  
  elements.retryBtn.addEventListener('click', () => {
    if (currentSelectedText) {
      explainText(currentSelectedText);
    }
  });

  if (elements.addVocabularyBtn) {
    elements.addVocabularyBtn.addEventListener('click', () => {
      if (currentSelectedText) {
        addWordToVocabulary(currentSelectedText, currentExplanation || {});
      } else {
        showStatus('No text selected', 'error');
      }
    });
  }
  
  if (elements.newSearchBtn) {
    elements.newSearchBtn.addEventListener('click', () => {
      showNoSelection();
    });
  }
  
  async function checkForSelectedText() {
    try {
      const { selectedText } = await chrome.storage.local.get(['selectedText']);
      
      if (selectedText && selectedText.trim()) {
        currentSelectedText = selectedText.trim();
        showSelectedText(currentSelectedText);
        chrome.storage.local.remove('selectedText');
      } else {
        showNoSelection();
      }
    } catch (error) {
      showNoSelection();
    }
  }
  
  function showNoSelection() {
    hideAll();
    elements.noSelection.style.display = 'block';
  }
  
  function showSelectedText(text) {
    hideAll();
    elements.selectedText.textContent = text;
    elements.selectedTextContainer.style.display = 'block';
    
    explainText(text);
  }
  
  function showLoading() {
    hideAll();
    elements.loadingContainer.style.display = 'block';
  }
  
  function showError(message) {
    hideAll();
    elements.errorMessage.textContent = message;
    elements.errorContainer.style.display = 'block';
  }

  function showStatus(message, type = 'success', duration = 3000) {
    elements.statusMessage.textContent = message;
    elements.statusContainer.className = `status ${type}`;
    elements.statusContainer.style.display = 'block';

    setTimeout(() => {
      elements.statusContainer.style.display = 'none';
    }, duration);
  }
  
  function showExplanation(data) {
    hideAll();
    currentExplanation = data;
    
    // Show loading state for Urdu translation
    elements.urduTranslationText.textContent = 'Loading translation...';
    elements.urduTranslationSection.style.display = 'block';
    
    // Fetch Urdu translation
    fetchUrduTranslation(currentSelectedText);
    
    elements.explanationContainer.style.display = 'block';
  }
  
  /*
  // Commented out - AI explanation display functions
  function showWordExplanation(data) {
    document.getElementById('definition').textContent = data.definition || 'Definition not available';
    
    // Show loading state for Urdu translation
    elements.urduTranslationText.textContent = 'Loading translation...';
    elements.urduTranslationSection.style.display = 'block';
    
    // Fetch Urdu translation separately
    fetchUrduTranslation(currentSelectedText);

    const examplesList = document.getElementById('examples');
    examplesList.innerHTML = '';
    if (data.examples && Array.isArray(data.examples)) {
      data.examples.forEach(example => {
        const li = document.createElement('li');
        li.textContent = example;
        examplesList.appendChild(li);
      });
    }
    
    document.querySelector('.explanation-section h3').textContent = '📝 Definition';
    document.querySelector('.explanation-section:nth-child(2) h3').textContent = '🎯 Usage';
  }
  
  function showSentenceExplanation(data) {
    document.getElementById('definition').textContent = data.rephrasing || 'Rephrasing not available';
    document.getElementById('context').textContent = data.meaning || 'Meaning not available';
    
    // Show loading state for Urdu translation
    elements.urduTranslationText.textContent = 'Loading translation...';
    elements.urduTranslationSection.style.display = 'block';
    
    // Fetch Urdu translation separately
    fetchUrduTranslation(currentSelectedText);

    const examplesList = document.getElementById('examples');
    examplesList.innerHTML = '';
    if (data.examples && Array.isArray(data.examples)) {
      data.examples.forEach(example => {
        const li = document.createElement('li');
        li.textContent = example;
        examplesList.appendChild(li);
      });
    }
    
    document.querySelector('.explanation-section h3').textContent = '📝 Simple Version';
    document.querySelector('.explanation-section:nth-child(2) h3').textContent = '🎯 Meaning';
  }
  */
  
  function hideAll() {
    elements.noSelection.style.display = 'none';
    elements.selectedTextContainer.style.display = 'none';
    elements.loadingContainer.style.display = 'none';
    elements.errorContainer.style.display = 'none';
    elements.explanationContainer.style.display = 'none';
    elements.statusContainer.style.display = 'none';
  }

  function addWordToVocabulary(text, explanation) {
    const newWord = {
      text: text,
      definition: explanation?.definition || explanation?.rephrasing || text, // Just store the text if no definition
      examples: explanation?.examples || [],
      urdu_translation: explanation?.urdu_translation || '' // Save Urdu translation
    };

    console.log('Attempting to add word:', newWord);

    chrome.storage.local.get({ vocabulary: [] }, (result) => {
      console.log('Current vocabulary list:', result.vocabulary);
      const vocabularyList = result.vocabulary;
      
      if (!vocabularyList.some(item => item.text === newWord.text)) {
        vocabularyList.push(newWord);
        chrome.storage.local.set({ vocabulary: vocabularyList }, () => {
          if (chrome.runtime.lastError) {
            console.error('Failed to save vocabulary:', chrome.runtime.lastError);
            showStatus(`Error saving "${text}"`, 'error');
          } else {
            console.log('New vocabulary list:', vocabularyList);
            showStatus(`"${text}" added to your vocabulary!`, 'success');
          }
        });
      } else {
        showStatus(`"${text}" is already in your vocabulary.`, 'error');
      }
    });
  }

  async function explainText(text) {
    if (!text || text.trim().length === 0) {
      showError('No text selected. Please select some text first.');
      return;
    }
    
    /* Commented out - AI/Gemini API check
    const { apiKey, geminiApiKey, model } = await chrome.storage.sync.get(['apiKey', 'geminiApiKey', 'model']);

    if (model && model.startsWith('gemini-') && !geminiApiKey) {
      showError('Gemini API key not configured. Click the settings button to add your API key.');
      return;
    } else if (model && model.startsWith('gpt-') && !apiKey) {
      showError('OpenAI API key not configured. Click the settings button to add your API key.');
      return;
    } else if (!apiKey && !geminiApiKey) {
      showError('No API key configured. Click the settings button to add an API key.');
      return;
    }
    */
    
    showLoading();
    
    try {
      /* Commented out - AI explanation call
      const response = await chrome.runtime.sendMessage({
        action: 'explainText',
        text: text
      });
      
      if (response.success) {
        showExplanation(response.data);
      } else {
        showError(response.error || 'Failed to get explanation. Please try again.');
      }
      */
      
      // Show only Urdu translation
      showExplanation({ text: text });
    } catch (error) {
      showError('Failed to connect to the service. Please check your internet connection and try again.');
    }
  }
  
  async function fetchUrduTranslation(text) {
    try {
      console.log('Fetching Urdu translation for:', text);
      const response = await chrome.runtime.sendMessage({
        action: 'translateToUrdu',
        text: text
      });
      
      console.log('Translation response:', response);
      
      if (response && response.success) {
        elements.urduTranslationText.textContent = response.translation;
        // Store translation with explanation
        if (!currentExplanation) {
          currentExplanation = {};
        }
        currentExplanation.urdu_translation = response.translation;
        currentExplanation.text = text;
      } else {
        console.warn('Translation failed:', response);
        elements.urduTranslationText.textContent = 'Translation unavailable';
      }
    } catch (error) {
      console.error('Translation error:', error);
      elements.urduTranslationText.textContent = 'Translation error: ' + error.message;
    }
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showExplanation,
    showWordExplanation,
    showSentenceExplanation
  };
}