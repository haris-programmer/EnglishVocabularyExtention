# Dictionary API Integration

## Overview
This extension now uses the free Dictionary API (https://dictionaryapi.dev/) to fetch word definitions, pronunciations, examples, and more.

## API Details

### Endpoint
```
https://api.dictionaryapi.dev/api/v2/entries/en/<word>
```

### Features
- ✅ **Free to use** - No API key required
- ✅ **Comprehensive data** - Definitions, phonetics, examples, synonyms, antonyms
- ✅ **Multiple meanings** - Different parts of speech (noun, verb, adjective, etc.)
- ✅ **Etymology** - Word origins when available
- ✅ **Audio pronunciations** - Links to pronunciation audio files

### Example Response
For the word "hello":
```json
[
  {
    "word": "hello",
    "phonetic": "həˈləʊ",
    "phonetics": [
      {
        "text": "həˈləʊ",
        "audio": "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3"
      }
    ],
    "origin": "early 19th century: variant of earlier hollo ; related to holla.",
    "meanings": [
      {
        "partOfSpeech": "exclamation",
        "definitions": [
          {
            "definition": "used as a greeting or to begin a phone conversation.",
            "example": "hello there, Katie!",
            "synonyms": [],
            "antonyms": []
          }
        ]
      }
    ]
  }
]
```

## How It Works in the Extension

1. **User selects a word** - Single word selections trigger dictionary lookup
2. **Background script** - Calls the Dictionary API via the `lookupDefinition()` function
3. **Data formatting** - Extracts and organizes:
   - Word and phonetic pronunciation
   - Etymology/origin
   - Multiple meanings grouped by part of speech
   - Definitions with examples
   - Synonyms and antonyms
4. **Display** - Shows formatted data in the popup with nice styling
5. **Urdu translation** - Simultaneously fetches Urdu translation using MyMemory API

## Usage in Code

### Background Script (background.js)
```javascript
async function lookupDefinition(word) {
  const cleanWord = word.trim().toLowerCase();
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    word: data[0].word,
    phonetic: data[0].phonetic,
    meanings: data[0].meanings,
    origin: data[0].origin
  };
}
```

### Popup Script (popup.js)
```javascript
const response = await chrome.runtime.sendMessage({
  action: 'lookupDefinition',
  word: text
});

if (response.success && !response.definition.error) {
  showExplanation(response.definition);
}
```

## Supported Features

### ✅ Implemented
- Word definitions
- Phonetic pronunciations (text)
- Multiple meanings by part of speech
- Examples for each definition
- Synonyms and antonyms
- Word origin/etymology
- Urdu translation (via separate API)

### 🔄 Future Enhancements
- Audio pronunciation playback
- Save pronunciation with vocabulary
- Support for phrases/idioms
- Alternative dictionary sources fallback

## Limitations
- Only works for single words (not phrases or sentences)
- English language only for definitions
- Requires internet connection
- May not have definitions for very obscure or new words

## Credits
Dictionary API is provided free of charge by https://dictionaryapi.dev/
