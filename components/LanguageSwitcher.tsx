"use client";

import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "next-i18next";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "dk", name: "Dansk", flag: "🇩🇰" },
];

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");

  const currentLanguage = languages.find((lang) => lang.code === router.locale) || languages[0];

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm hover:shadow-md h-[38px] focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 border-0"
        style={{ background: undefined, border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-auto min-w-[180px] rounded-xl bg-white dark:bg-gray-900 shadow-xl shadow-black/10 dark:shadow-black/30 border border-gray-200 dark:border-gray-700/50 overflow-hidden z-50 animate-scaleIn">
          <ul role="listbox" className="p-3 grid grid-cols-3 gap-2.5">
            {languages.map((language) => (
              <li key={language.code}>
                <button
                  onClick={() => changeLanguage(language.code)}
                  className={`w-full flex flex-col items-center gap-1.5 px-4 py-3 text-xs font-medium rounded-lg transition-all duration-150 focus:outline-none border-0 ${
                    currentLanguage.code === language.code
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  style={{ background: currentLanguage.code === language.code ? undefined : 'transparent', border: 'none', boxShadow: 'none' }}
                  role="option"
                  aria-selected={currentLanguage.code === language.code}
                  title={language.name}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <span className="uppercase text-[10px]">{language.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
