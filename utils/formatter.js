class TextFormatter {
  static cleanText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s'-]/g, '');
  }
  
  static isValidText(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }
    
    const cleaned = this.cleanText(text);
    return cleaned.length > 0 && cleaned.length <= 500;
  }
  
  static truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
  }
  
  static formatExplanation(data) {
    const formatted = {
      definition: data.definition || 'Definition not available',
      context: data.context || 'Context not available',
      examples: this.formatExamples(data.examples),
      variations: data.variations || 'No variations available',
      level: this.formatLevel(data.level),
      tips: data.tips || 'No specific tips available',
      etymology: data.etymology || null
    };
    
    return formatted;
  }
  
  static formatExamples(examples) {
    if (!examples || !Array.isArray(examples)) {
      return ['No examples available'];
    }
    
    return examples.slice(0, 5).map((example, index) => {
      if (typeof example === 'string') {
        return example;
      }
      return `Example ${index + 1}: ${String(example)}`;
    });
  }
  
  static formatLevel(level) {
    if (!level || typeof level !== 'string') {
      return 'unknown';
    }
    
    const normalized = level.toLowerCase().trim();
    
    if (['beginner', 'basic', 'easy', 'simple'].includes(normalized)) {
      return 'beginner';
    }
    
    if (['intermediate', 'medium', 'moderate'].includes(normalized)) {
      return 'intermediate';
    }
    
    if (['advanced', 'hard', 'difficult', 'complex'].includes(normalized)) {
      return 'advanced';
    }
    
    return 'intermediate';
  }
  
  static highlightSearchTerm(text, searchTerm) {
    if (!text || !searchTerm) {
      return text;
    }
    
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  static escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  static formatTimestamp(timestamp) {
    if (!timestamp) {
      return 'Unknown time';
    }
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  static createSlug(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextFormatter;
}