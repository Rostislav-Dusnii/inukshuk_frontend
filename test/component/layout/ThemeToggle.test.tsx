import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ThemeToggle from "../../../components/ThemeToggle";
import { useTheme } from "../../../contexts/ThemeContext";

// Mock ThemeContext
jest.mock("../../../contexts/ThemeContext", () => ({
  useTheme: jest.fn(),
}));

// Mock Next.js Link
jest.mock("next/link", () => {
  return function MockLink({ children, onClick, ...props }: any) {
    return (
      <a onClick={onClick} {...props}>
        {children}
      </a>
    );
  };
});

describe("ThemeToggle Component", () => {
  const mockToggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Light theme", () => {
    beforeEach(() => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "light",
        toggleTheme: mockToggleTheme,
      });
    });

    it("should render Sun icon when theme is light", () => {
      render(<ThemeToggle />);

      const sunIcon = document.querySelector(".lucide-sun");
      expect(sunIcon).toBeInTheDocument();
    });

    it("should not render Moon icon when theme is light", () => {
      render(<ThemeToggle />);

      const moonIcon = document.querySelector(".lucide-moon");
      expect(moonIcon).not.toBeInTheDocument();
    });

    it("should have correct title attribute for light theme", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toHaveAttribute("title", "Switch to dark mode");
    });

    it("should call toggleTheme when clicked in light mode", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it("should prevent default link behavior", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");

      button.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Dark theme", () => {
    beforeEach(() => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "dark",
        toggleTheme: mockToggleTheme,
      });
    });

    it("should render Moon icon when theme is dark", () => {
      render(<ThemeToggle />);

      const moonIcon = document.querySelector(".lucide-moon");
      expect(moonIcon).toBeInTheDocument();
    });

    it("should not render Sun icon when theme is dark", () => {
      render(<ThemeToggle />);

      const sunIcon = document.querySelector(".lucide-sun");
      expect(sunIcon).not.toBeInTheDocument();
    });

    it("should have correct title attribute for dark theme", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toHaveAttribute("title", "Switch to light mode");
    });

    it("should call toggleTheme when clicked in dark mode", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "light",
        toggleTheme: mockToggleTheme,
      });
    });

    it("should have aria-label for screen readers", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toHaveAttribute("aria-label", "Toggle theme");
    });

    it("should be keyboard accessible", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it("should have proper link role", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toBeInTheDocument();
    });

    it("should have href attribute", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toHaveAttribute("href", "#");
    });
  });

  describe("Styling", () => {
    beforeEach(() => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "light",
        toggleTheme: mockToggleTheme,
      });
    });

    it("should have correct base styling classes", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toHaveClass("inline-flex");
      expect(button).toHaveClass("items-center");
      expect(button).toHaveClass("justify-center");
      expect(button).toHaveClass("px-4");
      expect(button).toHaveClass("py-2");
      expect(button).toHaveClass("rounded-lg");
    });

    it("should have hover and active state classes", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toHaveClass("hover:bg-gray-200");
      expect(button).toHaveClass("active:scale-95");
      expect(button).toHaveClass("transition-all");
    });

    it("should have dark mode styling classes", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toHaveClass("dark:bg-gray-800");
      expect(button).toHaveClass("dark:hover:bg-gray-700");
    });

    it("should have fixed height class", () => {
      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      expect(button).toHaveClass("h-[38px]");
    });
  });

  describe("Icon styling", () => {
    it("should have brand-orange color for sun icon", () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "light",
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeToggle />);

      const sunIcon = document.querySelector(".lucide-sun");
      expect(sunIcon).toHaveClass("text-brand-orange");
    });

    it("should have brand-orange color for moon icon", () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "dark",
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeToggle />);

      const moonIcon = document.querySelector(".lucide-moon");
      expect(moonIcon).toHaveClass("text-brand-orange");
    });

    it("should have correct size classes for sun icon", () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "light",
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeToggle />);

      const sunIcon = document.querySelector(".lucide-sun");
      expect(sunIcon).toHaveClass("w-5");
      expect(sunIcon).toHaveClass("h-5");
    });

    it("should have correct size classes for moon icon", () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "dark",
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeToggle />);

      const moonIcon = document.querySelector(".lucide-moon");
      expect(moonIcon).toHaveClass("w-5");
      expect(moonIcon).toHaveClass("h-5");
    });
  });

  describe("Theme switching", () => {
    it("should switch from light to dark", () => {
      const { rerender } = render(<ThemeToggle />);

      (useTheme as jest.Mock).mockReturnValue({
        theme: "light",
        toggleTheme: mockToggleTheme,
      });

      rerender(<ThemeToggle />);
      expect(document.querySelector(".lucide-sun")).toBeInTheDocument();

      const button = screen.getByRole("link");
      fireEvent.click(button);

      (useTheme as jest.Mock).mockReturnValue({
        theme: "dark",
        toggleTheme: mockToggleTheme,
      });

      rerender(<ThemeToggle />);
      expect(document.querySelector(".lucide-moon")).toBeInTheDocument();
    });

    it("should not call toggleTheme multiple times on single click", () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "light",
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("link");
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple clicks", () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: "light",
        toggleTheme: mockToggleTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole("link");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(3);
    });
  });
});
