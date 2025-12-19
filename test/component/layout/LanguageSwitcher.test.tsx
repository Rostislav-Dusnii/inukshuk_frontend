import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useRouter } from "next/router";
import enTranslations from "../../../public/locales/en/common.json";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js i18n
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const keys = key.split(".");
      let value: any = enTranslations;
      for (const k of keys) {
        value = value[k];
      }
      return value || key;
    },
  }),
}));

describe("LanguageSwitcher Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: "/",
      asPath: "/",
      locale: "en",
    });
  });

  describe("Initial render", () => {
    it("should render the language switcher button", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      expect(button).toBeInTheDocument();
    });

    it("should display Globe icon", () => {
      render(<LanguageSwitcher />);

      const icon = document.querySelector(".lucide-globe");
      expect(icon).toBeInTheDocument();
    });

    it("should show current language flag", () => {
      render(<LanguageSwitcher />);

      // English flag should be visible
      expect(screen.getByText("🇬🇧")).toBeInTheDocument();
    });

    it("should not show dropdown initially", () => {
      render(<LanguageSwitcher />);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should have correct aria attributes when closed", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("aria-haspopup", "listbox");
    });
  });

  describe("Dropdown functionality", () => {
    it("should open dropdown when button is clicked", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("should close dropdown when button is clicked again", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });

      // Open
      fireEvent.click(button);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      // Close
      fireEvent.click(button);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should display all language options when open", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("Français")).toBeInTheDocument();
      expect(screen.getByText("Deutsch")).toBeInTheDocument();
      expect(screen.getByText("Español")).toBeInTheDocument();
    });

    it("should display flags for all languages", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getAllByText("🇬🇧").length).toBeGreaterThan(0);
      expect(screen.getByText("🇫🇷")).toBeInTheDocument();
      expect(screen.getByText("🇩🇪")).toBeInTheDocument();
      expect(screen.getByText("🇪🇸")).toBeInTheDocument();
    });

    it("should show checkmark for current language", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const checkmarks = screen.getAllByText("✓");
      expect(checkmarks.length).toBe(1);
    });

    it("should highlight current language with special styling", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const options = screen.getAllByRole("option");
      const englishOption = options.find((opt) =>
        opt.textContent?.includes("English")
      );

      expect(englishOption).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Language selection", () => {
    it("should change language when option is clicked", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const frenchOption = screen.getByText("Français");
      fireEvent.click(frenchOption);

      expect(mockPush).toHaveBeenCalledWith("/", "/", { locale: "fr" });
    });

    it("should close dropdown after selecting a language", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const germanOption = screen.getByText("Deutsch");
      fireEvent.click(germanOption);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should work for all language options", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const spanishOption = screen.getByText("Español");
      fireEvent.click(spanishOption);

      expect(mockPush).toHaveBeenCalledWith("/", "/", { locale: "es" });
    });

    it("should handle selecting current language", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const englishOption = screen.getByText("English");
      fireEvent.click(englishOption);

      // Should still call router.push even for same language
      expect(mockPush).toHaveBeenCalledWith("/", "/", { locale: "en" });
    });
  });

  describe("Different initial locales", () => {
    it("should display French flag when locale is fr", () => {
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        pathname: "/",
        asPath: "/",
        locale: "fr",
      });

      render(<LanguageSwitcher />);

      expect(screen.getByText("🇫🇷")).toBeInTheDocument();
    });

    it("should display German flag when locale is de", () => {
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        pathname: "/",
        asPath: "/",
        locale: "de",
      });

      render(<LanguageSwitcher />);

      expect(screen.getByText("🇩🇪")).toBeInTheDocument();
    });

    it("should display Spanish flag when locale is es", () => {
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        pathname: "/",
        asPath: "/",
        locale: "es",
      });

      render(<LanguageSwitcher />);

      expect(screen.getByText("🇪🇸")).toBeInTheDocument();
    });

    it("should default to English for unknown locale", () => {
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        pathname: "/",
        asPath: "/",
        locale: "unknown",
      });

      render(<LanguageSwitcher />);

      expect(screen.getByText("🇬🇧")).toBeInTheDocument();
    });
  });

  describe("Click outside behavior", () => {
    it("should close dropdown when clicking outside", () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <LanguageSwitcher />
        </div>
      );

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      const outside = screen.getByTestId("outside");
      fireEvent.mouseDown(outside);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should not close when clicking inside dropdown", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const listbox = screen.getByRole("listbox");
      fireEvent.mouseDown(listbox);

      // Dropdown should still be open (language will be selected instead)
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  describe("Keyboard interactions", () => {
    it("should close dropdown when Escape key is pressed", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should not close dropdown when other keys are pressed", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Enter" });

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper listbox role for dropdown", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should have option role for each language", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(4);
    });

    it("should have aria-selected for current language", () => {
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button", { name: /select language/i });
      fireEvent.click(button);

      const options = screen.getAllByRole("option");
      const selectedOptions = options.filter(
        (opt) => opt.getAttribute("aria-selected") === "true"
      );

      expect(selectedOptions).toHaveLength(1);
    });
  });
});
