document.addEventListener('DOMContentLoaded', () => {
  const vocabularyTableBody = document.getElementById('vocabularyTableBody');
  const vocabularyTableContainer = document.getElementById('vocabularyTableContainer');
  const emptyMessage = document.getElementById('emptyMessage');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearVocabularyBtn = document.getElementById('clearVocabularyBtn');
  const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
  const addWordBtn = document.getElementById('addWordBtn');
  const addWordForm = document.getElementById('addWordForm');
  const manualWordForm = document.getElementById('manualWordForm');
  const cancelAddBtn = document.getElementById('cancelAddBtn');

  loadVocabulary();

  exportCsvBtn.addEventListener('click', exportToCsv);
  clearVocabularyBtn.addEventListener('click', clearVocabulary);
  copyToClipboardBtn.addEventListener('click', copyToClipboard);
  addWordBtn.addEventListener('click', showAddWordForm);
  cancelAddBtn.addEventListener('click', hideAddWordForm);
  manualWordForm.addEventListener('submit', handleAddWord);

  function loadVocabulary() {
    chrome.storage.local.get({ vocabulary: [] }, (result) => {
      console.log('Vocabulary loaded:', result.vocabulary);
      const vocabularyList = result.vocabulary;
      
      vocabularyTableBody.innerHTML = ''; // Clear existing rows

      if (vocabularyList.length > 0) {
        vocabularyTableContainer.style.display = 'block';
        emptyMessage.style.display = 'none';
        vocabularyList.forEach(item => {
          const row = createTableRow(item);
          vocabularyTableBody.appendChild(row);
        });
      } else {
        vocabularyTableContainer.style.display = 'none';
        emptyMessage.style.display = 'block';
      }
    });
  }

  function createTableRow(item) {
    const row = document.createElement('tr');
    
    const wordCell = document.createElement('td');
    wordCell.innerHTML = `
      <strong>${item.text || ''}</strong>
      ${item.phonetic ? `<br><span class="phonetic">${item.phonetic}</span>` : ''}
      ${item.partOfSpeech ? `<br><span class="part-of-speech">${item.partOfSpeech}</span>` : ''}
    `;
    row.appendChild(wordCell);

    const definitionCell = document.createElement('td');
    definitionCell.textContent = item.definition || '';
    row.appendChild(definitionCell);

    const urduTranslationCell = document.createElement('td');
    urduTranslationCell.textContent = item.urdu_translation || 'N/A';
    row.appendChild(urduTranslationCell);

    const examplesCell = document.createElement('td');
    if (item.examples && item.examples.length > 0) {
      examplesCell.innerHTML = item.examples.map(ex => `<p>${ex}</p>`).join('');
    } else {
      examplesCell.textContent = 'N/A';
    }
    row.appendChild(examplesCell);
    
    // Actions cell
    const actionsCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'Delete word';
    deleteBtn.onclick = () => deleteWord(item.text);
    actionsCell.appendChild(deleteBtn);
    row.appendChild(actionsCell);

    return row;
  }

  function exportToCsv() {
    chrome.storage.local.get({ vocabulary: [] }, (result) => {
      const vocabularyList = result.vocabulary;
      if (vocabularyList.length === 0) {
        alert('Vocabulary list is empty.'); // Will replace with a better status later if needed
        return;
      }

      let csvContent = '"Word","Definition","Urdu Translation","Examples"\n'; // Updated header
      vocabularyList.forEach(item => {
        const word = `"${(item.text || '').replace(/"/g, '""')}"`;
        const definition = `"${(item.definition || '').replace(/"/g, '""')}"`;
        const urduTranslation = `"${(item.urdu_translation || '').replace(/"/g, '""')}"`; // New field
        const examples = `"${(item.examples || []).join('; ').replace(/"/g, '""')}"`;
        csvContent += `${word},${definition},${urduTranslation},${examples}\n`;
      });

      downloadCsv(csvContent);
    });
  }

  function downloadCsv(csvString) {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "english_helper_vocabulary.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function clearVocabulary() {
    if (confirm('Are you sure you want to clear your entire vocabulary list? This cannot be undone.')) {
      chrome.storage.local.set({ vocabulary: [] }, () => {
        loadVocabulary(); // Reload the list after clearing
        showNotification('Vocabulary list cleared.');
      });
    }
  }
  
  function copyToClipboard() {
    chrome.storage.local.get({ vocabulary: [] }, (result) => {
      const vocabularyList = result.vocabulary;
      if (vocabularyList.length === 0) {
        showNotification('Vocabulary list is empty.', 'error');
        return;
      }

      let textContent = '📚 MY VOCABULARY LIST\n';
      textContent += '═'.repeat(80) + '\n\n';
      
      vocabularyList.forEach((item, index) => {
        textContent += `${index + 1}. ${item.text.toUpperCase()}\n`;
        if (item.phonetic) {
          textContent += `   Pronunciation: ${item.phonetic}\n`;
        }
        if (item.partOfSpeech) {
          textContent += `   Part of Speech: ${item.partOfSpeech}\n`;
        }
        textContent += `   Definition: ${item.definition || 'N/A'}\n`;
        if (item.urdu_translation) {
          textContent += `   Urdu: ${item.urdu_translation}\n`;
        }
        if (item.examples && item.examples.length > 0) {
          textContent += `   Examples:\n`;
          item.examples.forEach(ex => {
            textContent += `      - ${ex}\n`;
          });
        }
        textContent += '\n' + '-'.repeat(80) + '\n\n';
      });
      
      textContent += `Total Words: ${vocabularyList.length}\n`;
      textContent += `Generated by English Helper Extension\n`;

      navigator.clipboard.writeText(textContent).then(() => {
        showNotification('Vocabulary copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy to clipboard.', 'error');
      });
    });
  }
  
  function showAddWordForm() {
    addWordForm.style.display = 'block';
    document.getElementById('wordInput').focus();
  }
  
  function hideAddWordForm() {
    addWordForm.style.display = 'none';
    manualWordForm.reset();
  }
  
  function handleAddWord(e) {
    e.preventDefault();
    
    const word = document.getElementById('wordInput').value.trim();
    const phonetic = document.getElementById('phoneticInput').value.trim();
    const partOfSpeech = document.getElementById('partOfSpeechInput').value.trim();
    const definition = document.getElementById('definitionInput').value.trim();
    const urduTranslation = document.getElementById('urduInput').value.trim();
    const examplesText = document.getElementById('examplesInput').value.trim();
    const examples = examplesText ? examplesText.split('\n').filter(ex => ex.trim()) : [];
    
    if (!word || !definition) {
      showNotification('Word and definition are required!', 'error');
      return;
    }
    
    const newWord = {
      text: word,
      phonetic: phonetic,
      partOfSpeech: partOfSpeech,
      definition: definition,
      urdu_translation: urduTranslation,
      examples: examples
    };
    
    chrome.storage.local.get({ vocabulary: [] }, (result) => {
      const vocabularyList = result.vocabulary;
      
      if (vocabularyList.some(item => item.text.toLowerCase() === word.toLowerCase())) {
        showNotification(`"${word}" is already in your vocabulary.`, 'error');
        return;
      }
      
      vocabularyList.push(newWord);
      chrome.storage.local.set({ vocabulary: vocabularyList }, () => {
        showNotification(`"${word}" added to vocabulary!`);
        hideAddWordForm();
        loadVocabulary();
      });
    });
  }
  
  function deleteWord(wordText) {
    if (confirm(`Delete "${wordText}" from vocabulary?`)) {
      chrome.storage.local.get({ vocabulary: [] }, (result) => {
        const vocabularyList = result.vocabulary.filter(item => item.text !== wordText);
        chrome.storage.local.set({ vocabulary: vocabularyList }, () => {
          showNotification(`"${wordText}" deleted.`);
          loadVocabulary();
        });
      });
    }
  }
  
  function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
});
