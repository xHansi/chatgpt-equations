// @ts-nocheck

import { initNotionContent } from "./content/notionContent";
import { initEquationAssistant } from "./content/equationAssistant";
import { getProviderForHost, withDefaultProvider, seedDefaultDomains, hostMatchesDomain } from "./core/providers";

const isNotionHost =
  location.host.includes("notion.so") || location.host.includes("notion.site");

const STORAGE_KEY = "equationAssistantDomains";

/**
 * Load domain configuration from chrome.storage.local, falling back to defaults
 * and ensuring each entry has a provider field.
 */
function loadDomainConfig() {
  const DEFAULT_DOMAINS = seedDefaultDomains();

  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
      resolve(DEFAULT_DOMAINS);
      return;
    }
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const rawList = data && data[STORAGE_KEY];
      if (!rawList || !Array.isArray(rawList) || rawList.length === 0) {
        resolve(DEFAULT_DOMAINS);
        return;
      }
      const normalized = rawList.map((item) =>
        withDefaultProvider({
          domain: item.domain,
          enabled: item.enabled !== false,
          provider: item.provider || getProviderForHost(item.domain),
        })
      );
      resolve(normalized);
    });
  });
}

loadDomainConfig().then((domains) => {
  const host = location.host;
  const entry = domains.find((d) => d.enabled && hostMatchesDomain(host, d.domain));
  if (entry) {
    initEquationAssistant(entry.provider);
  } else {
    // No explicit entry: fall back to generic provider on known chat-style hosts if desired.
    // For now: do nothing when host is not explicitly enabled.
  }

  if (isNotionHost) {
    initNotionContent();
  }
});

