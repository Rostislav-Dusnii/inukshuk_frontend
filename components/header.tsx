"use client";

import { useEffect, useState } from "react";
import { User } from "@types";
import Link from "next/link";
import HeaderNotification from "./HeaderNotification";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu } from "lucide-react";
import { useTranslation } from "next-i18next";

const Header: React.FC = () => {
  const { t } = useTranslation("common");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  // Measure header height and expose as CSS variable so pages can size main correctly
  useEffect(() => {
    const setHeaderHeight = () => {
      try {
        const headerEl = document.querySelector("header");
        if (headerEl) {
          const h = headerEl.getBoundingClientRect().height;
          document.documentElement.style.setProperty(
            "--header-height",
            `${h}px`
          );
        }
      } catch (e) {
        // ignore in non-browser environments
      }
    };

    setHeaderHeight();
    window.addEventListener("resize", setHeaderHeight);
    return () => window.removeEventListener("resize", setHeaderHeight);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-[2000] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative">
              <img
                src="/images/logo.png"
                alt="Treasure Hunt logo"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-brand-orange/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {t("app.name")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {!loggedInUser ? (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-brand-orange text-white hover:bg-brand-orange-dark active:scale-95 transition-all shadow-sm hover:shadow-md"
              >
                {t("nav.login")}
              </Link>
            ) : (
              <>
                <div className="text-gray-700 dark:text-gray-300 font-medium ms-3 hidden lg:block">
                  <span className="text-brand-orange">{t("nav.welcome")}</span>{" "}
                  {loggedInUser.username}!
                </div>
                <Link
                  href="/"
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {t("nav.logout")}
                </Link>
              </>
            )}

            {loggedInUser && <HeaderNotification />}

            {loggedInUser && (
              <Link
                href="/friends"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white active:scale-95 transition-all ml-1"
              >
                {t("nav.friends")}
              </Link>
            )}

            <Link
              href={loggedInUser ? "/map" : "/login"}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-brand-green text-brand-green hover:bg-brand-green hover:text-white active:scale-95 transition-all ml-1"
            >
              {t("nav.map")}
            </Link>

            {loggedInUser && loggedInUser.role?.toUpperCase() === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white active:scale-95 transition-all ml-1"
              >
                {t("nav.admin")}
              </Link>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {loggedInUser && <HeaderNotification />}

            {/* Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center px-4 text-brand-orange hover:text-white py-2 text-sm font-medium rounded-lg shadow-none m-0 transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-brand-orange dark:hover:bg-gray-700 hover:transform-none hover:shadow-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 " />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col gap-2">
              {!loggedInUser ? (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-brand-orange text-white hover:bg-brand-orange-dark active:scale-95 transition-all shadow-sm"
                >
                  {t("nav.login")}
                </Link>
              ) : (
                <>
                  <div className="text-gray-700 dark:text-gray-300 font-medium px-4 py-2 text-center">
                    <span className="text-brand-orange">{t("nav.welcome")}</span>{" "}
                    {loggedInUser.username}!
                  </div>

                  <Link
                    href="/friends"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white active:scale-95 transition-all"
                  >
                    {t("nav.friends")}
                  </Link>

                  <Link
                    href="/map"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-brand-green text-brand-green hover:bg-brand-green hover:text-white active:scale-95 transition-all"
                  >
                    {t("nav.map")}
                  </Link>

                  {loggedInUser.role?.toUpperCase() === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white active:scale-95 transition-all"
                    >
                      {t("nav.admin")}
                    </Link>
                  )}

                  <Link
                    href="/"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t("nav.logout")}
                  </Link>
                </>
              )}

              {!loggedInUser && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-brand-green text-brand-green hover:bg-brand-green hover:text-white active:scale-95 transition-all"
                >
                  {t("nav.map")}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
