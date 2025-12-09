// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  },
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    openOptionsPage: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
    sendMessage: jest.fn()
  }
};

// Mock DOM
document.body.innerHTML = `
  <div id="noSelection"></div>
  <div id="selectedTextContainer">
    <p id="selectedText"></p>
  </div>
  <div id="loadingContainer"></div>
  <div id="errorContainer">
    <p id="errorMessage"></p>
  </div>
  <div id="statusContainer">
    <p id="statusMessage"></p>
  </div>
  <div id="explanationContainer">
    <div id="urduTranslationSection">
      <p id="urduTranslationText"></p>
    </div>
    <div class="explanation-section">
      <h3></h3>
      <p id="definition"></p>
    </div>
    <div class="explanation-section">
      <h3></h3>
      <p id="context"></p>
    </div>
    <ul id="examples"></ul>
    <div class="explanation-section">
      <h3></h3>
      <p id="variations"></p>
    </div>
    <div class="level-section">
      <h3></h3>
      <span id="level"></span>
    </div>
    <p id="tips"></p>
  </div>
  <button id="settingsBtn"></button>
  <button id="vocabularyBtn"></button>
  <button id="retryBtn"></button>
  <button id="highlightBtn"></button>
  <button id="addVocabularyBtn"></button>
  <button id="newSearchBtn"></button>
`;

require('../popup.js');

describe('Popup UI', () => {
  test('should display "Translation not available" when Urdu translation is missing', async () => {
    // Arrange
    const data = {
      textType: 'word',
      definition: 'A test definition',
      usage: 'A test usage',
      examples: ['Test example 1', 'Test example 2'],
      synonyms: 'Test synonyms',
      tone: 'neutral',
      // urdu_translation is missing
    };

    // Act
    const { showExplanation } = require('../popup.js');
    showExplanation(data);

    // Assert
    const urduTranslationSection = document.getElementById('urduTranslationSection');
    const urduTranslationText = document.getElementById('urduTranslationText');
    expect(urduTranslationSection.style.display).toBe('block');
    expect(urduTranslationText.textContent).toBe('Translation not available');
  });
});
