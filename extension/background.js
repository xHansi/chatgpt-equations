// background.js
// - Registriert einen Kontextmenü-Eintrag in Notion
// - Leitet Klicks an das Content-Script weiter

chrome.runtime.onInstalled.addListener(() => {
  // Kontextmenü-Eintrag nur auf Notion-Seiten und in editierbaren Feldern
  chrome.contextMenus.create({
    id: "paste-from-chatgpt",
    title: "Paste from ChatGPT (Notion)",
    contexts: ["editable"],
    documentUrlPatterns: [
      "https://www.notion.so/*",
      "https://www.notion.site/*"
    ]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "paste-from-chatgpt" && tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: "PASTE_FROM_CHATGPT" });
  }
});

