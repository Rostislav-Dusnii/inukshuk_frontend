import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AccessDenied from "../../../components/admin/AccessDenied";
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

describe("AccessDenied Component", () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  describe("Initial render", () => {
    it("should render the ACCESS DENIED title", () => {
      render(<AccessDenied />);

      expect(screen.getByText("ACCESS DENIED")).toBeInTheDocument();
    });

    it("should render the alert icon", () => {
      const { container } = render(<AccessDenied />);

      const icon = container.querySelector("svg.lucide-triangle-alert");
      expect(icon).toBeInTheDocument();
    });

    it("should render the access denied message", () => {
      render(<AccessDenied />);

      expect(
        screen.getByText(/You do not have permission to view this page/i)
      ).toBeInTheDocument();
    });

    it("should render the go back button", () => {
      render(<AccessDenied />);

      const button = screen.getByRole("button", { name: /go back/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Button functionality", () => {
    it("should call router.back when go back button is clicked", () => {
      render(<AccessDenied />);

      const button = screen.getByRole("button", { name: /go back/i });
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple clicks", () => {
      render(<AccessDenied />);

      const button = screen.getByRole("button", { name: /go back/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(3);
    });
  });

  describe("Styling", () => {
    it("should have correct styling for the title", () => {
      render(<AccessDenied />);

      const title = screen.getByText("ACCESS DENIED");
      expect(title).toHaveClass("text-6xl");
      expect(title).toHaveClass("font-extrabold");
      expect(title).toHaveClass("text-red-600");
    });

    it("should have correct styling for the icon", () => {
      const { container } = render(<AccessDenied />);

      const icon = container.querySelector("svg.lucide-triangle-alert");
      expect(icon).toHaveClass("w-20");
      expect(icon).toHaveClass("h-20");
      expect(icon).toHaveClass("text-red-600");
    });

    it("should have correct styling for the button", () => {
      render(<AccessDenied />);

      const button = screen.getByRole("button", { name: /go back/i });
      expect(button).toHaveClass("bg-brand-green");
      expect(button).toHaveClass("text-white");
      expect(button).toHaveClass("rounded-xl");
    });
  });
});
