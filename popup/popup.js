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
    vocabularyBtn: document.getElementById('vocabularyBtn')
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
    
    // Clear previous content
    const explanationContainer = elements.explanationContainer;
    explanationContainer.innerHTML = '';
    
    // If dictionary data is available
    if (data.word && data.meanings) {
      // Create word header with phonetic
      const wordHeader = document.createElement('div');
      wordHeader.className = 'word-header';
      wordHeader.innerHTML = `
        <h2>${data.word}</h2>
        ${data.phonetic ? `<div class="phonetic">${data.phonetic}</div>` : ''}
      `;
      explanationContainer.appendChild(wordHeader);
      
      // Display meanings (limit to first 2 definitions per part of speech)
      data.meanings.forEach((meaning, index) => {
        const meaningSection = document.createElement('div');
        meaningSection.className = 'meaning-section';
        
        const partOfSpeech = document.createElement('h3');
        partOfSpeech.textContent = meaning.partOfSpeech;
        partOfSpeech.className = 'part-of-speech';
        meaningSection.appendChild(partOfSpeech);
        
        // Display only first 2 definitions
        const definitionsToShow = meaning.definitions.slice(0, 2);
        definitionsToShow.forEach((def, defIndex) => {
          const defDiv = document.createElement('div');
          defDiv.className = 'definition-item';
          
          const defText = document.createElement('p');
          defText.innerHTML = `<strong>${defIndex + 1}.</strong> ${def.definition}`;
          defDiv.appendChild(defText);
          
          // Add example if available
          if (def.example) {
            const exampleText = document.createElement('p');
            exampleText.className = 'example-text';
            exampleText.innerHTML = `<em>Example: "${def.example}"</em>`;
            defDiv.appendChild(exampleText);
          }
          
          meaningSection.appendChild(defDiv);
        });
        
        explanationContainer.appendChild(meaningSection);
      });
    }
    
    // Show loading state for Urdu translation
    const urduSection = document.createElement('div');
    urduSection.id = 'urduTranslationSection';
    urduSection.className = 'explanation-section';
    urduSection.innerHTML = `
      <h3>🌐 Urdu Translation</h3>
      <p id="urduTranslationText">Loading translation...</p>
    `;
    explanationContainer.appendChild(urduSection);
    
    // Add action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';
    actionsDiv.innerHTML = `
      <button id="addVocabularyBtn" class="action-btn">Add to Vocabulary</button>
      <button id="newSearchBtn" class="action-btn secondary">🔍 New Search</button>
    `;
    explanationContainer.appendChild(actionsDiv);
    
    // Re-attach event listeners for dynamically created buttons
    setTimeout(() => {
      const addVocabBtn = document.getElementById('addVocabularyBtn');
      const newSearchBtnDynamic = document.getElementById('newSearchBtn');
      
      if (addVocabBtn) {
        addVocabBtn.addEventListener('click', () => {
          if (currentSelectedText) {
            addWordToVocabulary(currentSelectedText, currentExplanation || {});
          } else {
            showStatus('No text selected', 'error');
          }
        });
      }
      
      if (newSearchBtnDynamic) {
        newSearchBtnDynamic.addEventListener('click', () => {
          showNoSelection();
        });
      }
    }, 0);
    
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
      definition: explanation?.meanings?.[0]?.definitions?.[0]?.definition || 
                  explanation?.definition || 
                  explanation?.rephrasing || 
                  text,
      examples: [],
      urdu_translation: explanation?.urdu_translation || '',
      phonetic: explanation?.phonetic || '',
      partOfSpeech: explanation?.meanings?.[0]?.partOfSpeech || ''
    };
    
    // Extract examples from dictionary data
    if (explanation?.meanings) {
      explanation.meanings.forEach(meaning => {
        meaning.definitions.forEach(def => {
          if (def.example) {
            newWord.examples.push(def.example);
          }
        });
      });
    } else if (explanation?.examples) {
      newWord.examples = explanation.examples;
    }

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
      
      // Check if it's a single word or multiple words
      const wordCount = text.trim().split(/\s+/).length;
      
      if (wordCount === 1) {
        // Single word - look up in dictionary
        const response = await chrome.runtime.sendMessage({
          action: 'lookupDefinition',
          word: text
        });
        
        if (response.success && !response.definition.error) {
          showExplanation(response.definition);
        } else {
          showError(response.definition.error || 'Word not found in dictionary. Please try another word.');
        }
      } else {
        // Multiple words or sentence - show only Urdu translation
        showExplanation({ text: text });
      }
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
      
      // Get the dynamically created element
      const urduTranslationText = document.getElementById('urduTranslationText');
      
      if (response && response.success) {
        if (urduTranslationText) {
          urduTranslationText.textContent = response.translation;
        }
        // Store translation with explanation
        if (!currentExplanation) {
          currentExplanation = {};
        }
        currentExplanation.urdu_translation = response.translation;
        currentExplanation.text = text;
      } else {
        console.warn('Translation failed:', response);
        if (urduTranslationText) {
          urduTranslationText.textContent = 'Translation unavailable';
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      const urduTranslationText = document.getElementById('urduTranslationText');
      if (urduTranslationText) {
        urduTranslationText.textContent = 'Translation error: ' + error.message;
      }
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