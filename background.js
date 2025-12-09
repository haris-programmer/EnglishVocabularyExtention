// Response cache to avoid duplicate API calls
const responseCache = new Map();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'englishHelper',
    title: 'Explain "%s" with English Helper',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'englishHelper') {
    chrome.storage.local.set({
      selectedText: info.selectionText,
      currentTab: tab.id
    });
    
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'textSelected') {
    chrome.storage.local.set({
      selectedText: request.selectedText,
      currentTab: sender.tab.id,
      currentUrl: request.url
    });

    if (request.openPopup) {
      chrome.action.openPopup();
    }
  }
  
  // Commented out AI/Gemini API calls
  /*
  if (request.action === 'explainText') {
    handleExplainText(request.text)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  */
  
  if (request.action === 'translateToUrdu') {
    translateToUrdu(request.text)
      .then(translation => sendResponse({ success: true, translation: translation }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'highlightText') {
    chrome.tabs.sendMessage(sender.tab.id, { action: 'highlightText' });
  }
});

function isWordOrSentence(text) {
  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).length;
  const hasMultipleWords = wordCount > 1;
  const hasPunctuation = /[.!?;:]/.test(cleanText);
  
  if (wordCount >= 5 || hasPunctuation) {
    return 'sentence';
  } else if (wordCount <= 3 && !hasPunctuation) {
    return 'word';
  } else {
    return 'word';
  }
}

async function fetchWithRetry(apiCall, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`API call failed. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function handleExplainText(text) {
  const { apiKey, geminiApiKey, model } = await chrome.storage.sync.get(['apiKey', 'geminiApiKey', 'model']);
  
  const apiCall = () => {
    if (model.startsWith('gemini-')) {
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured. Please set it in the extension options.');
      }
      return callGeminiApi(text, geminiApiKey, model);
    } else {
      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please set it in the extension options.');
      }
      return callOpenAIApi(text, apiKey, model);
    }
  };

  return fetchWithRetry(apiCall);
}

async function translateToUrdu(text) {
  try {
    console.log('Translating text:', text);
    // Using MyMemory Translation API (free, no API key required)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ur`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Translation API response status:', response.status);

    if (!response.ok) {
      console.warn('MyMemory API failed:', response.statusText);
      return 'Translation unavailable';
    }

    const data = await response.json();
    console.log('Translation API data:', data);
    
    // MyMemory returns translation in responseData.translatedText
    if (data.responseData && data.responseData.translatedText) {
      console.log('Translation successful:', data.responseData.translatedText);
      return data.responseData.translatedText;
    }
    
    console.warn('No translation in response data');
    return 'Translation unavailable';
  } catch (error) {
    console.error('Translation error:', error);
    return 'Translation unavailable';
  }
}

/*
// Commented out - AI/Gemini functions
function getPromptAndSystemMessage(text) {
  const textType = isWordOrSentence(text);
  let prompt, systemMessage;

  if (textType === 'word') {
    prompt = `Explain "${text}" simply. JSON format:
"definition": simple meaning
"examples": [2 easy sentences]
"usage": when/where used
"synonyms": similar words
"tone": formal/casual/neutral
Be brief and clear.`;
    
    systemMessage = 'English teacher for beginners. Simple words, short sentences. JSON only.';
  } else {
    prompt = `Explain sentence "${text}" simply. JSON format:
"rephrasing": simpler version
"meaning": what it means
"examples": [2 similar sentences]
"alternatives": other ways to say it
Be brief and clear.`;
    
    systemMessage = 'English teacher for beginners. Simple words, short sentences. JSON only.';
  }

  return { prompt, systemMessage, textType };
}

function normalizeResponse(parsedContent, textType) {
  const normalized = { ...parsedContent };
  normalized.textType = textType;
  return normalized;
}

async function callOpenAIApi(text, apiKey, model) {
  const { prompt, systemMessage, textType } = getPromptAndSystemMessage(text);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsedResponse = JSON.parse(content);
    return normalizeResponse(parsedResponse, textType);
  } catch (e) {
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

async function callGeminiApi(text, apiKey, model) {
  // Check cache first
  const cacheKey = `${model}:${text.toLowerCase().trim()}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log('Returning cached response');
    return cached.data;
  }

  const { prompt, textType } = getPromptAndSystemMessage(text);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.2,
        maxOutputTokens: 400,
        topK: 40,
        topP: 0.95
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  try {
    const parsedResponse = JSON.parse(content);
    const result = normalizeResponse(parsedResponse, textType);
    
    // Cache the response
    responseCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    // Limit cache size to 100 entries
    if (responseCache.size > 100) {
      const firstKey = responseCache.keys().next().value;
      responseCache.delete(firstKey);
    }
    
    return result;
  } catch (e) {
    throw new Error('Failed to parse Gemini response. Please try again.');
  }
}
*/