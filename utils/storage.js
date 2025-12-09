class StorageUtil {
  static async get(keys, useSync = false) {
    const storage = useSync ? chrome.storage.sync : chrome.storage.local;
    return await storage.get(keys);
  }
  
  static async set(data, useSync = false) {
    const storage = useSync ? chrome.storage.sync : chrome.storage.local;
    return await storage.set(data);
  }
  
  static async remove(keys, useSync = false) {
    const storage = useSync ? chrome.storage.sync : chrome.storage.local;
    return await storage.remove(keys);
  }
  
  static async clear(useSync = false) {
    const storage = useSync ? chrome.storage.sync : chrome.storage.local;
    return await storage.clear();
  }
  
  static async incrementStat(statName) {
    const data = await this.get([statName]);
    const currentValue = data[statName] || 0;
    await this.set({ [statName]: currentValue + 1 });
    return currentValue + 1;
  }
  
  static async addToHistory(word, explanation) {
    const { searchHistory = [] } = await this.get(['searchHistory']);
    
    const newEntry = {
      word: word,
      explanation: explanation,
      timestamp: Date.now(),
      id: Date.now().toString()
    };
    
    const updatedHistory = [newEntry, ...searchHistory.slice(0, 49)];
    
    await this.set({ searchHistory: updatedHistory });
    return updatedHistory;
  }
  
  static async getHistory(limit = 10) {
    const { searchHistory = [] } = await this.get(['searchHistory']);
    return searchHistory.slice(0, limit);
  }
  
  static async removeFromHistory(id) {
    const { searchHistory = [] } = await this.get(['searchHistory']);
    const updatedHistory = searchHistory.filter(entry => entry.id !== id);
    await this.set({ searchHistory: updatedHistory });
    return updatedHistory;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageUtil;
}