# Testing Guide - Dictionary API Integration

## Quick Test Steps

### 1. Reload the Extension
```powershell
# In Chrome, go to: chrome://extensions/
# Click the refresh icon on "English Helper" extension
```

### 2. Test Single Word Lookup

**Test Word: "beautiful"**
- Go to any webpage
- Double-click on the word "beautiful" (or select it)
- Extension popup should show:
  ```
  beautiful
  /ˈbjuːtɪf(ə)l/
  
  adjective
  1. pleasing the senses or mind aesthetically
     Example: "beautiful poetry"
  
  Urdu Translation: خوبصورت
  ```

### 3. Test Different Word Types

**Nouns**: Try "happiness", "computer", "freedom"
**Verbs**: Try "run", "think", "create"
**Adjectives**: Try "amazing", "quick", "bright"
**Adverbs**: Try "quickly", "slowly", "happily"

### 4. Test Edge Cases

**Unknown Word**: "xyzabc123"
- Should show: "Word not found in dictionary"

**Phrase**: "hello world"
- Should show: Only Urdu translation (no dictionary lookup)

**Word with Multiple Meanings**: "bank"
- Should show multiple definitions:
  - noun: financial institution
  - noun: sloping land beside water
  - verb: to deposit money

### 5. Test Add to Vocabulary

1. Look up a word (e.g., "serendipity")
2. Click "Add to Vocabulary" button
3. Go to Vocabulary page
4. Verify saved data includes:
   - Word text
   - Definition
   - Examples
   - Phonetic
   - Part of speech
   - Urdu translation

## Expected Behavior

### ✅ Success Cases
| Input | Expected Output |
|-------|----------------|
| "hello" | Phonetic + definitions + examples + Urdu |
| "run" | Multiple meanings (verb forms) + Urdu |
| "beautiful" | Adjective definition + examples + Urdu |

### ⚠️ Error Cases
| Input | Expected Output |
|-------|----------------|
| "asdfgh" | "Word not found in dictionary" error |
| "" (empty) | "No text selected" error |
| "hello world" | Urdu translation only (no dictionary) |

## Console Logs

Open DevTools (F12) and check console for:
```javascript
Looking up definition for: beautiful
Dictionary API response status: 200
Dictionary API data: [...]
Dictionary lookup successful: {...}
Translation successful: خوبصورت
```

## Troubleshooting

### Problem: "Word not found" for common words
**Solution**: Check internet connection, API might be down

### Problem: No Urdu translation
**Solution**: MyMemory API might be rate-limited, try again later

### Problem: Popup doesn't open
**Solution**: Reload extension, check for console errors

### Problem: Styling looks broken
**Solution**: Clear browser cache, reload extension

## API Rate Limits

- **Dictionary API**: No official rate limit (but be reasonable)
- **MyMemory API**: 1000 requests/day (free tier)

## Browser Compatibility

Tested on:
- ✅ Chrome (recommended)
- ✅ Edge (Chromium)
- ⚠️ Firefox (may need manifest adjustments)

## Manual API Test

You can test the API directly in browser:
```
https://api.dictionaryapi.dev/api/v2/entries/en/hello
```

Should return JSON with word data.
