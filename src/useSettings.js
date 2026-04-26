import { useState, useEffect } from "react";
import { config as fileConfig } from "./config.example2";

const STORAGE_KEY = "portfolio_settings";

// On a deployed/downloaded site, an injected window.__PORTFOLIO_CONFIG__ overrides the file config.
// On localhost (the editor), we use the file config and let localStorage persist edits.
const injected =
  typeof window !== "undefined" ? window.__PORTFOLIO_CONFIG__ : null;
const isDeployed = !!injected;
const defaultConfig = injected ? { ...fileConfig, ...injected } : fileConfig;

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    if (isDeployed) return defaultConfig;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.configVersion !== defaultConfig.configVersion) {
          localStorage.removeItem(STORAGE_KEY);
          return defaultConfig;
        }
        return { ...defaultConfig, ...parsed };
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  useEffect(() => {
    if (isDeployed) return;
    const { photo, ...toSave } = settings;
    if (photo && typeof photo === "string" && photo.startsWith("data:")) {
      toSave.photo = photo;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaultConfig);
  };

  return { settings, updateSetting, resetSettings, isDeployed };
}
