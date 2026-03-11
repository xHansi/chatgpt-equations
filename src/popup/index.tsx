import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { FiGithub, FiCoffee, FiHelpCircle, FiTrash2, FiInfo } from "react-icons/fi";
import type { ProviderId, ProviderDomainConfig } from "../core/providers";
import { getProviderForHost, withDefaultProvider, seedDefaultDomains } from "../core/providers";
import { LANGUAGES, type SupportedLanguage, loadLanguage, saveLanguage, t } from "../core/i18n";

type DomainConfig = Required<ProviderDomainConfig>;

const STORAGE_KEY = "equationAssistantDomains";

const DEFAULT_DOMAINS: DomainConfig[] = seedDefaultDomains().map((d) =>
  withDefaultProvider(d)
) as DomainConfig[];

const FIXED_DOMAIN_SET = new Set(DEFAULT_DOMAINS.map((d) => d.domain));

function normalizeDomain(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  try {
    const withProtocol =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : "https://" + trimmed;
    const url = new URL(withProtocol);
    return url.host;
  } catch {
    return trimmed;
  }
}

async function loadDomains(): Promise<DomainConfig[]> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
      const cleaned = DEFAULT_DOMAINS.filter(
        (d) => d.domain !== "perplexity.ai" && d.domain !== "www.perplexity.ai"
      );
      resolve(cleaned);
      return;
    }
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const raw = (data && (data as any)[STORAGE_KEY]) as any[] | undefined;
      if (!raw || !Array.isArray(raw) || raw.length === 0) {
        const cleanedDefaults = DEFAULT_DOMAINS.filter(
          (d) => d.domain !== "perplexity.ai" && d.domain !== "www.perplexity.ai"
        );
        chrome.storage.local.set({ [STORAGE_KEY]: cleanedDefaults }, () => {
          resolve([...cleanedDefaults]);
        });
        return;
      }
      const filteredRaw = raw.filter(
        (item: any) =>
          item &&
          item.domain !== "perplexity.ai" &&
          item.domain !== "www.perplexity.ai"
      );
      const normalized: DomainConfig[] = filteredRaw.map((item: any) =>
        withDefaultProvider({
          domain: item.domain,
          enabled: item.enabled !== false,
          provider: (item.provider as ProviderId | undefined) || getProviderForHost(item.domain),
        })
      ) as DomainConfig[];
      chrome.storage.local.set({ [STORAGE_KEY]: normalized }, () => {
        resolve(normalized);
      });
    });
  });
}

async function saveDomains(list: DomainConfig[]): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
      resolve();
      return;
    }
    chrome.storage.local.set({ [STORAGE_KEY]: list }, () => resolve());
  });
}

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({
  checked,
  onChange,
}) => {
  return (
    <button
      type="button"
      className={`switch ${checked ? "switch-on" : "switch-off"}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="switch-track" />
      <span className="switch-thumb" />
      <span className="switch-label">{checked ? "On" : "Off"}</span>
    </button>
  );
};

const PopupApp: React.FC = () => {
  const [domains, setDomains] = useState<DomainConfig[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      const list = await loadDomains();
      setDomains(list);
      const storedLang = await loadLanguage();
      setLanguage(storedLang);
    })();
  }, []);

  const persist = useCallback(
    async (next: DomainConfig[]) => {
      setDomains(next);
      await saveDomains(next);
    },
    [setDomains]
  );

  const handleAdd = useCallback(() => {
    const normalized = normalizeDomain(inputValue);
    if (!normalized) return;
    if (domains.some((d) => d.domain === normalized)) {
      setInputValue("");
      return;
    }
    const next = [
      ...domains,
      withDefaultProvider({ domain: normalized, enabled: true }) as DomainConfig,
    ];
    void persist(next);
    setInputValue("");
  }, [domains, inputValue, persist]);

  const handleToggle = useCallback(
    (index: number, value: boolean) => {
      const next = domains.map((d, i) => (i === index ? { ...d, enabled: value } : d));
      void persist(next);
    },
    [domains, persist]
  );

  const handleProviderChange = useCallback(
    (index: number, provider: ProviderId) => {
      const next = domains.map((d, i) => (i === index ? { ...d, provider } : d));
      void persist(next);
    },
    [domains, persist]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const next = domains.filter((_, i) => i !== index);
      void persist(next);
    },
    [domains, persist]
  );

  const pendingDomain = pendingDeleteIndex !== null ? domains[pendingDeleteIndex] : null;

  const formatProviderLabel = (provider: ProviderId, lang: SupportedLanguage): string => {
    switch (provider) {
      case "chatgpt":
        return t("provider_chatgpt", lang);
      case "gemini":
        return t("provider_gemini", lang);
      case "claude":
        return t("provider_claude", lang);
      case "generic":
      default:
        return t("provider_generic_experimental", lang);
    }
  };

  const openUrl = (url: string) => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="popup-root">
      <header className="popup-header">
        <div className="popup-title">
          <img
            src="images/llm-to-notion.png"
            className="popup-main-logo"
            alt="LLM to Notion"
          />
          <span className="popup-title-text">{t("title", language)}</span>
        </div>
        <div className="lang-switcher-wrapper">
          <button
            type="button"
            className="lang-switcher"
            aria-haspopup="listbox"
            aria-expanded={languageMenuOpen}
            onClick={() => setLanguageMenuOpen((open) => !open)}
          >
            <span className="lang-flag">
              {LANGUAGES[language].flag}
            </span>
            <span className="lang-code">
              {LANGUAGES[language].code}
            </span>
          </button>
          {languageMenuOpen && (
            <div className="lang-menu" role="listbox">
              {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`lang-menu-item ${lang === language ? "active" : ""}`}
                  onClick={() => {
                    setLanguage(lang);
                    void saveLanguage(lang);
                    setLanguageMenuOpen(false);
                  }}
                >
                  <span className="lang-flag">{LANGUAGES[lang].flag}</span>
                  <span className="lang-code">{LANGUAGES[lang].code}</span>
                  <span className="lang-label">{LANGUAGES[lang].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="popup-section">
        <h2 className="section-title">
          {t("domainsTitle", language)}
          <button
            type="button"
            className="info-icon heading-info"
            aria-label="More info about generic domains"
          >
            <FiInfo className="info-icon-svg" />
            <span className="info-tooltip">
              {t("genericTooltip", language)}
            </span>
          </button>
        </h2>
        <div className="domain-input-row">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            type="text"
            placeholder={t("domainPlaceholder", language)}
            autoComplete="off"
          />
          <button type="button" onClick={handleAdd}>
            {t("addButton", language)}
          </button>
        </div>
        <ul className="domain-list">
          {domains.map((d, i) => {
            const isFixed = FIXED_DOMAIN_SET.has(d.domain);
            return (
              <li key={d.domain} className="domain-item">
                <span className="domain-label">
                  {d.domain}
                  <span
                    className={
                      "provider-badge" + (isFixed ? "" : " provider-badge--selectable")
                    }
                  >
                    {isFixed ? (
                      formatProviderLabel(d.provider, language)
                    ) : (
                      <select
                        className="provider-select"
                        value={d.provider}
                        onChange={(e) =>
                          handleProviderChange(i, e.target.value as ProviderId)
                        }
                      >
                        <option value="chatgpt">
                          {formatProviderLabel("chatgpt", language)}
                        </option>
                        <option value="gemini">
                          {formatProviderLabel("gemini", language)}
                        </option>
                        <option value="generic">
                          {formatProviderLabel("generic", language)}
                        </option>
                      </select>
                    )}
                  </span>
                </span>
                <div className="domain-controls">
                  <Switch
                    checked={d.enabled}
                    onChange={(v) => handleToggle(i, v)}
                  />
                  <button
                    type="button"
                    className="trash-btn"
                    title={t("trashTooltip", language)}
                    onClick={() => setPendingDeleteIndex(i)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="popup-section links-section">
        <button
          type="button"
          className="link-row"
          onClick={() => openUrl("https://example.com/coffee")}
        >
          <span className="icon">
            <FiCoffee />
          </span>
          <span>{t("footerCoffee", language)}</span>
        </button>
        <button
          type="button"
          className="link-row"
          onClick={() => openUrl("https://example.com/chrome-store")}
        >
          <span className="icon">
            <FiHelpCircle />
          </span>
          <span>{t("footerHelp", language)}</span>
        </button>
        <button
          type="button"
          className="link-row"
          onClick={() => openUrl("https://example.com/github")}
        >
          <span className="icon">
            <FiGithub />
          </span>
          <span>{t("footerGithub", language)}</span>
        </button>
      </section>

      {pendingDomain && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <h3 className="modal-title">{t("deleteTitle", language)}</h3>
            <p className="modal-text">
              {t("deleteMessage", language).replace("{domain}", "")}
              <span className="modal-domain">{pendingDomain.domain}</span>
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn secondary"
                onClick={() => setPendingDeleteIndex(null)}
              >
                {t("deleteCancel", language)}
              </button>
              <button
                type="button"
                className="modal-btn danger"
                onClick={() => {
                  if (pendingDeleteIndex !== null) {
                    handleDelete(pendingDeleteIndex);
                  }
                  setPendingDeleteIndex(null);
                }}
              >
                {t("deleteConfirm", language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}

