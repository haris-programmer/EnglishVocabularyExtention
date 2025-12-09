document.addEventListener('DOMContentLoaded', () => {
  const vocabularyTableBody = document.getElementById('vocabularyTableBody');
  const vocabularyTableContainer = document.getElementById('vocabularyTableContainer');
  const emptyMessage = document.getElementById('emptyMessage');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearVocabularyBtn = document.getElementById('clearVocabularyBtn');

  loadVocabulary();

  exportCsvBtn.addEventListener('click', exportToCsv);
  clearVocabularyBtn.addEventListener('click', clearVocabulary);

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
    wordCell.textContent = item.text || '';
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
        alert('Vocabulary list cleared.'); // Will replace with a better status later if needed
      });
    }
  }
});
