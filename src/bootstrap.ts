// @ts-nocheck

import { initChatGptContent } from "./content/chatgptContent";
import { initNotionContent } from "./content/notionContent";

const isChatGptHost =
  location.host.includes("chat.openai.com") || location.host.includes("chatgpt.com");

const isNotionHost =
  location.host.includes("notion.so") || location.host.includes("notion.site");

if (isChatGptHost) {
  initChatGptContent();
}

if (isNotionHost) {
  initNotionContent();
}

