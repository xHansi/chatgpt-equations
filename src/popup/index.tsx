import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { FiGithub, FiCoffee, FiHelpCircle, FiTrash2 } from "react-icons/fi";
import type { ProviderId, ProviderDomainConfig } from "../core/providers";
import { getProviderForHost, withDefaultProvider, seedDefaultDomains } from "../core/providers";

type DomainConfig = Required<ProviderDomainConfig>;

const STORAGE_KEY = "equationAssistantDomains";

const DEFAULT_DOMAINS: DomainConfig[] = seedDefaultDomains().map((d) =>
  withDefaultProvider(d)
) as DomainConfig[];

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
      resolve(DEFAULT_DOMAINS);
      return;
    }
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const raw = (data && (data as any)[STORAGE_KEY]) as any[] | undefined;
      if (!raw || !Array.isArray(raw) || raw.length === 0) {
        chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_DOMAINS }, () => {
          resolve([...DEFAULT_DOMAINS]);
        });
        return;
      }
      const normalized: DomainConfig[] = raw.map((item: any) =>
        withDefaultProvider({
          domain: item.domain,
          enabled: item.enabled !== false,
          provider: (item.provider as ProviderId | undefined) || getProviderForHost(item.domain),
        })
      ) as DomainConfig[];
      resolve(normalized);
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

  useEffect(() => {
    void (async () => {
      const list = await loadDomains();
      setDomains(list);
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
    const next = [...domains, withDefaultProvider({ domain: normalized, enabled: true }) as DomainConfig];
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

  const handleDelete = useCallback(
    (index: number) => {
      const next = domains.filter((_, i) => i !== index);
      void persist(next);
    },
    [domains, persist]
  );

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
          <img src="images/icon-t.png" className="popup-logo" alt="" />
          <span>ChatGPT → Notion Math</span>
        </div>
      </header>

      <section className="popup-section">
        <h2 className="section-title">Domains</h2>
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
            placeholder="z.B. chat.openai.com"
            autoComplete="off"
          />
          <button type="button" onClick={handleAdd}>
            Add
          </button>
        </div>
        <ul className="domain-list">
          {domains.map((d, i) => (
            <li key={d.domain} className="domain-item">
              <span className="domain-label">
                {d.domain}
                <span className="provider-badge">{d.provider}</span>
              </span>
              <div className="domain-controls">
                <Switch
                  checked={d.enabled}
                  onChange={(v) => handleToggle(i, v)}
                />
                <button
                  type="button"
                  className="trash-btn"
                  title="Entfernen"
                  onClick={() => handleDelete(i)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="popup-section links-section">
        <button
          type="button"
          className="link-row"
          onClick={() => openUrl("https://example.com/github")}
        >
          <span className="icon">
            <FiGithub />
          </span>
          <span>Open-source on GitHub</span>
        </button>
        <button
          type="button"
          className="link-row"
          onClick={() => openUrl("https://example.com/coffee")}
        >
          <span className="icon">
            <FiCoffee />
          </span>
          <span>Buy me a coffee</span>
        </button>
        <button
          type="button"
          className="link-row"
          onClick={() => openUrl("https://example.com/chrome-store")}
        >
          <span className="icon">
            <FiHelpCircle />
          </span>
          <span>Fragen / Hilfe</span>
        </button>
      </section>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}

