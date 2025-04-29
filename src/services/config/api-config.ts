
export class ApiConfigService {
  private apiKeys: Record<string, string> = {};
  private baseUrls: Record<string, string> = {};
  private defaultBaseUrl: string = 'https://openrouter.ai/api/v1';
  
  constructor(initialApiKey: string = '') {
    // Initialize with the legacy single API key format
    this.apiKeys = {
      'openrouter': initialApiKey,
      'openai': '',
      'deepseek': ''
    };
    
    // Initialize base URLs with the default
    this.baseUrls = {
      'openrouter': this.defaultBaseUrl,
      'openai': this.defaultBaseUrl,
      'deepseek': this.defaultBaseUrl
    };
    
    // Load saved configurations
    this.loadApiKeys();
    this.loadBaseUrls();
  }
  
  loadApiKeys() {
    try {
      const savedApiKeys = localStorage.getItem('api_keys');
      if (savedApiKeys) {
        this.apiKeys = JSON.parse(savedApiKeys);
      }
    } catch (error) {
      console.error("Failed to load API keys from localStorage:", error);
    }
  }

  saveApiKeys() {
    try {
      localStorage.setItem('api_keys', JSON.stringify(this.apiKeys));
    } catch (error) {
      console.error("Failed to save API keys to localStorage:", error);
    }
  }
  
  loadBaseUrls() {
    try {
      const savedBaseUrls = localStorage.getItem('base_urls');
      if (savedBaseUrls) {
        this.baseUrls = JSON.parse(savedBaseUrls);
      }
    } catch (error) {
      console.error("Failed to load base URLs from localStorage:", error);
      // Ensure default URL is set
      this.baseUrls['openrouter'] = this.defaultBaseUrl;
      this.baseUrls['openai'] = this.defaultBaseUrl;
      this.baseUrls['deepseek'] = this.defaultBaseUrl;
    }
  }

  saveBaseUrls() {
    try {
      localStorage.setItem('base_urls', JSON.stringify(this.baseUrls));
    } catch (error) {
      console.error("Failed to save base URLs to localStorage:", error);
    }
  }

  setApiKey(key: string, provider: string = 'openai') {
    this.apiKeys[provider] = key;
    this.saveApiKeys();
  }

  getApiKey(provider: string = 'openai'): string {
    return this.apiKeys[provider] || '';
  }
  
  getAllApiKeys(): Record<string, string> {
    return {...this.apiKeys};
  }
  
  setBaseUrl(url: string, provider: string = 'openai') {
    // Always set to OpenRouter URL for all providers
    this.baseUrls[provider] = this.defaultBaseUrl;
    this.saveBaseUrls();
  }

  getBaseUrl(provider: string = 'openai'): string {
    return this.baseUrls[provider] || this.defaultBaseUrl;
  }
  
  getAllBaseUrls(): Record<string, string> {
    return {...this.baseUrls};
  }
  
  getDefaultBaseUrl(): string {
    return this.defaultBaseUrl;
  }
}
