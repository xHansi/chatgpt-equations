// @ts-nocheck

import { initChatGptContent } from "./content/chatgptContent";
import { initNotionContent } from "./content/notionContent";

const isChatGptHost =
  location.host.includes("chat.openai.com") || location.host.includes("chatgpt.com");

const isNotionHost =
  location.host.includes("notion.so") || location.host.includes("notion.site");

const STORAGE_KEY = "gptEqDomains";

/**
 * Load domain configuration from chrome.storage.local, falling back to defaults.
 * @returns {Promise<Array<{ domain: string; enabled: boolean }>>}
 */
function loadDomainConfig() {
  const DEFAULT_DOMAINS = [
    { domain: "chat.openai.com", enabled: true },
    { domain: "chatgpt.com", enabled: true },
    { domain: "gemini.google.com", enabled: true },
    { domain: "perplexity.ai", enabled: true },
  ];

  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
      resolve(DEFAULT_DOMAINS);
      return;
    }
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const list = data && data[STORAGE_KEY];
      if (!list || !Array.isArray(list) || list.length === 0) {
        resolve(DEFAULT_DOMAINS);
      } else {
        resolve(list);
      }
    });
  });
}

loadDomainConfig().then((domains) => {
  if (isChatGptHost) {
    const host = location.host;
    const match = domains.find((d) => d.domain === host && d.enabled);
    if (match) {
      initChatGptContent();
    }
  }

  // Notion-Verhalten bleibt immer aktiv; die Domain-Liste steuert nur die
  // Hosts, auf denen ChatGPT-/LLM-Inhalte verarbeitet werden.
  if (isNotionHost) {
    initNotionContent();
  }
});

