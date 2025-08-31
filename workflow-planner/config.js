// Configuration loader for environment variables
class Config {
    constructor() {
        this.ready = this.loadEnvFile();
    }

    // Load environment variables from .env file
    async loadEnvFile() {
        try {
            const response = await fetch('.env');
            if (response.ok) {
                const envText = await response.text();
                this.parseEnvText(envText);
            } else {
                console.warn('.env file not found, using default configuration');
                this.setDefaults();
            }
        } catch (error) {
            console.warn('Error loading .env file:', error.message);
            this.setDefaults();
        }
    }

    // Parse .env file content
    parseEnvText(envText) {
        const lines = envText.split('\n');
        lines.forEach(line => {
            line = line.trim();
            // Skip comments and empty lines
            if (line.startsWith('#') || !line) return;
            
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                // Remove quotes if present
                const cleanValue = value.replace(/^['"](.*)['"]$/, '$1');
                window.ENV = window.ENV || {};
                window.ENV[key] = cleanValue;
            }
        });
    }

    // Set default values if .env is not available
    setDefaults() {
        window.ENV = window.ENV || {};
        window.ENV.OPENAI_API_KEY = 'your-openai-api-key-here';
        window.ENV.ANTHROPIC_API_KEY = 'your-anthropic-api-key-here';
    }

    // Get API key with validation
    async getApiKey(service) {
        await this.ready; // Wait for config to load
        const key = window.ENV?.[`${service.toUpperCase()}_API_KEY`];
        
        if (!key || key === `your-${service.toLowerCase()}-api-key-here`) {
            throw new Error(`${service} API key not configured. Please set ${service.toUpperCase()}_API_KEY in your .env file.`);
        }
        
        return key;
    }

    // Check if all required API keys are configured
    validateApiKeys() {
        const missingKeys = [];
        
        try {
            this.getApiKey('OPENAI');
        } catch (error) {
            missingKeys.push('OPENAI_API_KEY');
        }
        
        try {
            this.getApiKey('ANTHROPIC');
        } catch (error) {
            missingKeys.push('ANTHROPIC_API_KEY');
        }
        
        return {
            valid: missingKeys.length === 0,
            missing: missingKeys
        };
    }
}

// Initialize configuration
const config = new Config();
window.AppConfig = config;