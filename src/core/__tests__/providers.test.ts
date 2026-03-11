import {
  getProviderForHost,
  hostMatchesDomain,
  withDefaultProvider,
  seedDefaultDomains,
  type ProviderDomainConfig,
} from "../providers";

describe("providers", () => {
  it("maps known hosts to providers", () => {
    expect(getProviderForHost("chat.openai.com")).toBe("chatgpt");
    expect(getProviderForHost("chatgpt.com")).toBe("chatgpt");
    expect(getProviderForHost("grok.com")).toBe("chatgpt");
    expect(getProviderForHost("gemini.google.com")).toBe("gemini");
    expect(getProviderForHost("claude.ai")).toBe("claude");
  });

  it("falls back to generic for unknown hosts", () => {
    expect(getProviderForHost("example.com")).toBe("generic");
  });

  it("matches exact hosts and subdomains", () => {
    expect(hostMatchesDomain("chat.openai.com", "chat.openai.com")).toBe(true);
    expect(hostMatchesDomain("sub.chat.openai.com", "chat.openai.com")).toBe(true);
    expect(hostMatchesDomain("chat.openai.com", "openai.com")).toBe(true);
    expect(hostMatchesDomain("openai.com", "chat.openai.com")).toBe(false);
  });

  it("withDefaultProvider preserves existing provider", () => {
    const cfg: ProviderDomainConfig = {
      domain: "custom.com",
      enabled: true,
      provider: "generic",
    };
    const out = withDefaultProvider(cfg);
    expect(out.provider).toBe("generic");
  });

  it("withDefaultProvider infers provider when missing", () => {
    const cfg: ProviderDomainConfig = {
      domain: "chat.openai.com",
      enabled: true,
    };
    const out = withDefaultProvider(cfg);
    expect(out.provider).toBe("chatgpt");
  });

  it("seedDefaultDomains returns one enabled entry per default domain", () => {
    const domains = seedDefaultDomains();
    const seen = new Set<string>();
    for (const d of domains) {
      expect(d.enabled).toBe(true);
      expect(d.provider).toBeDefined();
      expect(seen.has(d.domain)).toBe(false);
      seen.add(d.domain);
    }
  });
});

