export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
  keyName: string;
  getApiKeyUrl: string;
  costPer1MTokens?: string;
  costInfo?: string;
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
    costInfo: 'Custo baixo - ~$0.001 por roteiro'
  },
  {
    id: 'openai',
    name: 'OpenAI ChatGPT',
    icon: '🟡',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    keyName: 'openai_api_key',
    getApiKeyUrl: 'https://platform.openai.com/api-keys',
    costPer1MTokens: '$10.00',
    costInfo: 'Custo alto - ~$0.02 por roteiro'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: '🔵',
    endpoint: 'https://api.anthropic.com/v1/messages',
    keyName: 'claude_api_key',
    getApiKeyUrl: 'https://console.anthropic.com/',
    costPer1MTokens: '$3.00',
    costInfo: 'Custo médio - ~$0.006 por roteiro'
  },
  {
    id: 'grok',
    name: 'Grok (X.AI)',
    icon: '⚫',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    keyName: 'grok_api_key',
    getApiKeyUrl: 'https://console.x.ai/',
    costPer1MTokens: '$5.00',
    costInfo: 'Custo médio - ~$0.01 por roteiro'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🟣',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    keyName: 'mistral_api_key',
    getApiKeyUrl: 'https://console.mistral.ai/',
    costPer1MTokens: '$4.00',
    costInfo: 'Custo médio - ~$0.008 por roteiro'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔴',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    keyName: 'deepseek_api_key',
    getApiKeyUrl: 'https://platform.deepseek.com/api_keys',
    costPer1MTokens: '$0.14',
    costInfo: 'Custo muito baixo - ~$0.0003 por roteiro'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🟠',
    endpoint: 'https://api.perplexity.ai/chat/completions',
    keyName: 'perplexity_api_key',
    getApiKeyUrl: 'https://www.perplexity.ai/settings/api',
    costPer1MTokens: '$1.00',
    costInfo: 'Custo baixo - ~$0.002 por roteiro'
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    icon: '⚪',
    endpoint: 'https://api.githubcopilot.com/chat/completions',
    keyName: 'copilot_api_key',
    getApiKeyUrl: 'https://github.com/settings/copilot',
    costPer1MTokens: 'Assinatura',
    costInfo: 'Plano mensal - incluído na assinatura'
  },
  {
    id: 'microsoft-copilot',
    name: 'Microsoft Copilot (Azure)',
    icon: '🔷',
    endpoint: 'https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions',
    keyName: 'microsoft_copilot_api_key',
    getApiKeyUrl: 'https://portal.azure.com/',
    costPer1MTokens: 'Variável',
    costInfo: 'Depende da configuração Azure'
  },
  {
    id: 'meta',
    name: 'Meta AI (Llama)',
    icon: '🔵',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    keyName: 'meta_api_key',
    getApiKeyUrl: 'https://www.together.ai/products',
    costPer1MTokens: '$0.60',
    costInfo: 'Custo baixo - ~$0.0012 por roteiro'
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
}