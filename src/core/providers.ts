export type ProviderId = "chatgpt" | "gemini" | "claude" | "generic";

export interface ProviderDomainConfig {
  domain: string;
  enabled: boolean;
  provider?: ProviderId;
}

const DEFAULT_PROVIDER_MAP: Array<{ domain: string; provider: ProviderId }> = [
  { domain: "chat.openai.com", provider: "chatgpt" },
  { domain: "chatgpt.com", provider: "chatgpt" },
  { domain: "grok.com", provider: "chatgpt" },
  { domain: "gemini.google.com", provider: "gemini" },
  { domain: "claude.ai", provider: "claude" },
];

export function getProviderForHost(host: string): ProviderId {
  const direct = DEFAULT_PROVIDER_MAP.find((d) => d.domain === host);
  if (direct) return direct.provider;
  // Fallback: generic when we don't know this host.
  return "generic";
}

export function hostMatchesDomain(host: string, domain: string): boolean {
  if (host === domain) return true;
  return host.endsWith("." + domain);
}

export function withDefaultProvider(config: ProviderDomainConfig): Required<ProviderDomainConfig> {
  if (config.provider) {
    return config as Required<ProviderDomainConfig>;
  }
  return {
    ...config,
    provider: getProviderForHost(config.domain),
  };
}

export function seedDefaultDomains(): ProviderDomainConfig[] {
  // Use one canonical entry per domain from DEFAULT_PROVIDER_MAP.
  const seen = new Set<string>();
  const result: ProviderDomainConfig[] = [];
  for (const { domain, provider } of DEFAULT_PROVIDER_MAP) {
    if (seen.has(domain)) continue;
    seen.add(domain);
    result.push({ domain, enabled: true, provider });
  }
  return result;
}

