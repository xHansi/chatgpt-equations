export type SupportedLanguage = "en" | "de" | "es" | "it" | "fr";

export const LANGUAGES: Record<
  SupportedLanguage,
  { code: string; flag: string; label: string }
> = {
  en: { code: "EN", flag: "🇺🇸", label: "English" },
  de: { code: "DE", flag: "🇩🇪", label: "Deutsch" },
  es: { code: "ES", flag: "🇪🇸", label: "Español" },
  it: { code: "IT", flag: "🇮🇹", label: "Italiano" },
  fr: { code: "FR", flag: "🇫🇷", label: "Français" },
};

type TranslationKey =
  | "title"
  | "domainsTitle"
  | "domainPlaceholder"
  | "addButton"
  | "trashTooltip"
  | "footerCoffee"
  | "footerHelp"
  | "footerGithub"
  | "deleteTitle"
  | "deleteMessage"
  | "deleteCancel"
  | "deleteConfirm"
  | "genericTooltip"
  | "copyButton"
  | "copySuccess"
  | "provider_chatgpt"
  | "provider_gemini"
  | "provider_claude"
  | "provider_generic_experimental";

const translations: Record<TranslationKey, Record<SupportedLanguage, string>> = {
  title: {
    en: "LLM → Notion",
    de: "LLM → Notion",
    es: "LLM → Notion",
    it: "LLM → Notion",
    fr: "LLM → Notion",
  },
  domainsTitle: {
    en: "Domains",
    de: "Domains",
    es: "Dominios",
    it: "Domini",
    fr: "Domaines",
  },
  domainPlaceholder: {
    en: "e.g. chat.openai.com",
    de: "z.B. chat.openai.com",
    es: "p.ej. chat.openai.com",
    it: "es. chat.openai.com",
    fr: "ex. chat.openai.com",
  },
  addButton: {
    en: "Add",
    de: "Hinzufügen",
    es: "Añadir",
    it: "Aggiungi",
    fr: "Ajouter",
  },
  trashTooltip: {
    en: "Remove",
    de: "Entfernen",
    es: "Eliminar",
    it: "Rimuovere",
    fr: "Supprimer",
  },
  footerCoffee: {
    en: "Buy me a coffee",
    de: "Spendiere mir einen Kaffee",
    es: "Invítame a un café",
    it: "Offrimi un caffè",
    fr: "Offrez-moi un café",
  },
  footerHelp: {
    en: "Help / Questions",
    de: "Hilfe / Fragen",
    es: "Ayuda / Preguntas",
    it: "Aiuto / Domande",
    fr: "Aide / Questions",
  },
  footerGithub: {
    en: "Contribute on GitHub",
    de: "Auf GitHub beitragen",
    es: "Contribuir en GitHub",
    it: "Contribuire su GitHub",
    fr: "Contribuer sur GitHub",
  },
  deleteTitle: {
    en: "Remove domain?",
    de: "Domain entfernen?",
    es: "¿Eliminar dominio?",
    it: "Rimuovere dominio?",
    fr: "Supprimer le domaine ?",
  },
  deleteMessage: {
    en: "Are you sure you want to remove {domain} from the list?",
    de: "Möchtest du {domain} wirklich aus der Liste entfernen?",
    es: "¿Seguro que quieres eliminar {domain} de la lista?",
    it: "Sei sicuro di voler rimuovere {domain} dalla lista?",
    fr: "Voulez-vous vraiment supprimer {domain} de la liste ?",
  },
  deleteCancel: {
    en: "Cancel",
    de: "Abbrechen",
    es: "Cancelar",
    it: "Annulla",
    fr: "Annuler",
  },
  deleteConfirm: {
    en: "Delete",
    de: "Löschen",
    es: "Eliminar",
    it: "Elimina",
    fr: "Supprimer",
  },
  genericTooltip: {
    en: "Manually added domains use a generic integration and may not work perfectly on every site.",
    de: "Manuell hinzugefügte Domains verwenden eine generische Integration und funktionieren möglicherweise nicht auf jeder Seite perfekt.",
    es: "Los dominios añadidos manualmente usan una integración genérica y puede que no funcionen perfectamente en todos los sitios.",
    it: "I domini aggiunti manualmente usano un'integrazione generica e potrebbero non funzionare perfettamente su ogni sito.",
    fr: "Les domaines ajoutés manuellement utilisent une intégration générique et peuvent ne pas fonctionner parfaitement sur tous les sites.",
  },
  copyButton: {
    en: "Copy for Notion",
    de: "Für Notion kopieren",
    es: "Copiar para Notion",
    it: "Copia per Notion",
    fr: "Copier pour Notion",
  },
  copySuccess: {
    en: "✓ Copied!",
    de: "✓ Kopiert!",
    es: "✓ Copiado",
    it: "✓ Copiato",
    fr: "✓ Copié",
  },
  provider_chatgpt: {
    en: "KaTeX DOM",
    de: "KaTeX-DOM",
    es: "DOM KaTeX",
    it: "DOM KaTeX",
    fr: "DOM KaTeX",
  },
  provider_gemini: {
    en: "LaTeX blocks",
    de: "LaTeX-Blöcke",
    es: "Bloques LaTeX",
    it: "Blocchi LaTeX",
    fr: "Blocs LaTeX",
  },
  provider_claude: {
    en: "KaTeX DOM",
    de: "KaTeX-DOM",
    es: "DOM KaTeX",
    it: "DOM KaTeX",
    fr: "DOM KaTeX",
  },
  provider_generic_experimental: {
    en: "Text heuristics",
    de: "Texterkennung",
    es: "Heurísticas texto",
    it: "Euristiche testo",
    fr: "Heuristiques texte",
  },
};

export function t(key: TranslationKey, lang: SupportedLanguage): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.en;
}

const LANG_STORAGE_KEY = "equationAssistantLanguage";

export function getDefaultLanguage(): SupportedLanguage {
  if (typeof navigator !== "undefined" && navigator.language) {
    const lower = navigator.language.toLowerCase();
    if (lower.startsWith("de")) return "de";
    if (lower.startsWith("es")) return "es";
    if (lower.startsWith("it")) return "it";
    if (lower.startsWith("fr")) return "fr";
  }
  return "en";
}

export function loadLanguage(): Promise<SupportedLanguage> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
      resolve(getDefaultLanguage());
      return;
    }
    chrome.storage.local.get(LANG_STORAGE_KEY, (data) => {
      const raw = (data && (data as any)[LANG_STORAGE_KEY]) as SupportedLanguage | undefined;
      if (raw === "en" || raw === "de" || raw === "es" || raw === "it" || raw === "fr") {
        resolve(raw);
      } else {
        resolve(getDefaultLanguage());
      }
    });
  });
}

export function saveLanguage(lang: SupportedLanguage): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
      resolve();
      return;
    }
    chrome.storage.local.set({ [LANG_STORAGE_KEY]: lang }, () => resolve());
  });
}

