# 🔤 English Helper - Enhanced Learning Chrome Extension

A powerful Chrome extension that provides comprehensive English explanations using AI to help improve your language skills beyond simple definitions.

## ✨ Features

- **Comprehensive Explanations**: Get detailed word/phrase explanations including:
  - Clear definitions
  - Context and usage scenarios
  - Real-world examples
  - Related words and variations
  - Difficulty levels
  - Learning tips and memory aids
  - Etymology (when relevant)

- **Easy Text Selection**: Simply select text on any webpage and get instant explanations
- **Multiple Access Methods**: Context menu, extension popup, or keyboard shortcuts
- **Vocabulary List**: Save words and their explanations to a personal vocabulary list.
- **Export to CSV**: Export your vocabulary list to a CSV file.
- **Smart Highlighting**: Auto-highlight explained text on pages
- **Usage Statistics**: Track your learning progress
- **Secure Storage**: API keys stored locally and never shared
- **Multiple AI Models**: Choose between OpenAI (GPT-3.5, GPT-4) and Google (Gemini Pro, Gemini 2.5 Flash) models.

## 🚀 Installation

### Method 1: Manual Installation (Recommended for Development)

1. **Download the Extension**:
   - Clone or download this repository
   - Extract the files to a folder on your computer

2. **Enable Developer Mode in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**:
   - Click "Load unpacked" button
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Configure API Key**:
   - Click the extension icon in your Chrome toolbar
   - Click the settings (⚙️) button
   - Enter your OpenAI or Gemini API key.
   - Save the settings

### Method 2: Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store soon.

## 🔑 API Key Setup

1. **For OpenAI**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign in or create an account and create a new API key.
2. **For Gemini**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in or create an account and create a new API key.
3. **In the extension**:
   - Copy the key and paste it in the extension settings.
   - Choose your preferred AI model.

**Note**: Your API keys are stored locally on your device and are never sent to our servers. Usage charges apply based on your chosen provider's pricing.

## 📖 How to Use

### Method 1: Text Selection + Context Menu
1. Visit any webpage
2. Select (highlight) any English word or phrase
3. Right-click and choose "Explain with English Helper"
4. View the comprehensive explanation in the popup

### Method 2: Text Selection + Extension Icon
1. Select any English word or phrase on a webpage
2. Click the English Helper extension icon in your toolbar
3. View the explanation in the popup

### Method 3: Direct Input
1. Click the extension icon without selecting text
2. Follow the instructions to select text on the current page

### Managing Your Vocabulary
1. After getting an explanation, click the "Add to Vocabulary" button.
2. Access your vocabulary list by clicking the "📚" button in the popup.
3. On the vocabulary page, you can view all your saved words, export them to a CSV file, or clear the list.

## 🎯 What You'll Learn

The extension automatically detects whether you've selected a **word** or **sentence** and provides tailored explanations:

### For Words:
- **📝 Simple Definition**: Clear meaning using easy words
- **🎯 Usage**: When and where to use this word
- **💡 Examples**: Two easy example sentences
- **🔗 Synonyms**: Other words with similar meanings
- **📊 Tone/Style**: Whether it's formal, casual, etc.

### For Sentences:
- **📝 Simple Version**: The sentence rewritten in easier words
- **🎯 Meaning**: What situation this sentence is used in
- **💡 Examples**: Two similar example sentences
- **🔗 Alternatives**: Other ways to say the same thing

## ⚙️ Settings

Access settings by clicking the gear (⚙️) icon in the popup:

- **API Configuration**: Set your OpenAI and/or Gemini API key.
- **AI Model**: Choose between the available models.
- **Auto-highlight**: Automatically highlight explained text.
- **Context Menu**: Show/hide context menu option.
- **Usage Statistics**: View your learning progress.

## 🔒 Privacy & Security

- Your API keys and vocabulary list are stored locally using Chrome's secure storage.
- No data is sent to our servers.
- All communication is directly between your browser and the AI provider (OpenAI or Google).
- No tracking or analytics.
- Your search history is stored locally and can be cleared anytime.

## 💰 Cost Information

This extension uses third-party APIs, which charge based on usage. Please refer to the pricing pages of [OpenAI](https://openai.com/pricing) and [Google AI](https://ai.google/pricing/) for more information.

## 🛠️ Troubleshooting

### Extension not working?
1. Make sure you have a valid API key for the selected model.
2. Check that the extension has permissions for the current website.
3. Try refreshing the page and selecting text again.

### API errors?
1. Verify your API key is correct.
2. Check your API provider account has sufficient credits.
3. Ensure you have access to the selected AI model.

### Text selection not detected?
1. Make sure text is properly selected (highlighted).
2. Try using the context menu instead of the toolbar icon.
3. Refresh the page and try again.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have suggestions:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Contact support through the extension's settings page

---

**Made with ❤️ for English learners worldwide**