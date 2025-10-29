export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
  keyName: string;
  getApiKeyUrl: string;
  costPer1MTokens?: string;
  costInfo?: string;
  models?: string[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '🟢',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    keyName: 'gemini_api_key',
    getApiKeyUrl: 'https://makersuite.google.com/app/apikey',
    costPer1MTokens: '$0.50',
    costInfo: 'Custo baixo - ~$0.001 por roteiro',
    models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro']
  },
  {
    id: 'openai',
    name: 'OpenAI ChatGPT',
    icon: '🟡',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    keyName: 'openai_api_key',
    getApiKeyUrl: 'https://platform.openai.com/api-keys',
    costPer1MTokens: '$10.00',
    costInfo: 'Custo alto - ~$0.02 por roteiro',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: '🔵',
    endpoint: 'https://api.anthropic.com/v1/messages',
    keyName: 'claude_api_key',
    getApiKeyUrl: 'https://console.anthropic.com/',
    costPer1MTokens: '$3.00',
    costInfo: 'Custo médio - ~$0.006 por roteiro',
    models: ['claude-sonnet-4-5', 'claude-opus-4-1', 'claude-3-7-sonnet', 'claude-3-5-haiku']
  },
  {
    id: 'grok',
    name: 'Grok (X.AI)',
    icon: '⚫',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    keyName: 'grok_api_key',
    getApiKeyUrl: 'https://console.x.ai/',
    costPer1MTokens: '$5.00',
    costInfo: 'Custo médio - ~$0.01 por roteiro',
    models: ['grok-3', 'grok-2', 'grok-beta']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🟣',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    keyName: 'mistral_api_key',
    getApiKeyUrl: 'https://console.mistral.ai/',
    costPer1MTokens: '$4.00',
    costInfo: 'Custo médio - ~$0.008 por roteiro',
    models: ['mistral-large', 'mistral-medium', 'mistral-small', 'mistral-tiny']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔴',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    keyName: 'deepseek_api_key',
    getApiKeyUrl: 'https://platform.deepseek.com/api_keys',
    costPer1MTokens: '$0.14',
    costInfo: 'Custo muito baixo - ~$0.0003 por roteiro',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-v3']
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🟠',
    endpoint: 'https://api.perplexity.ai/chat/completions',
    keyName: 'perplexity_api_key',
    getApiKeyUrl: 'https://www.perplexity.ai/settings/api',
    costPer1MTokens: '$1.00',
    costInfo: 'Custo baixo - ~$0.002 por roteiro',
    models: ['llama-3.1-sonar-large', 'llama-3.1-sonar-small', 'llama-3.1-sonar-huge']
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    icon: '⚪',
    endpoint: 'https://api.githubcopilot.com/chat/completions',
    keyName: 'copilot_api_key',
    getApiKeyUrl: 'https://github.com/settings/copilot',
    costPer1MTokens: 'Assinatura',
    costInfo: 'Plano mensal - incluído na assinatura',
    models: ['gpt-4', 'gpt-3.5-turbo']
  },
  {
    id: 'microsoft-copilot',
    name: 'Microsoft Copilot (Azure)',
    icon: '🔷',
    endpoint: 'https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions',
    keyName: 'microsoft_copilot_api_key',
    getApiKeyUrl: 'https://portal.azure.com/',
    costPer1MTokens: 'Variável',
    costInfo: 'Depende da configuração Azure',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-35-turbo']
  },
  {
    id: 'meta',
    name: 'Meta AI (Llama)',
    icon: '🔵',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    keyName: 'meta_api_key',
    getApiKeyUrl: 'https://www.together.ai/products',
    costPer1MTokens: '$0.60',
    costInfo: 'Custo baixo - ~$0.0012 por roteiro',
    models: ['llama-3.3-70b', 'llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b']
  }
];

export interface ScriptData {
  topic: string;
  duration: string;
  style: string;
  styleKeywords: string;
  language: string;
  niche: string;
  subniche: string;
  microniche: string;
  nanoniche: string;
  audience: string;
  additionalInfo: string;
  youtubeLink: string;
  qualified: boolean;
  characteristics?: number;
}