import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MapClearComponent from "@components/map/MapTools/MapClearComponent";

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        "map.map_clear": "Clear Map",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock MapClearModal
jest.mock("@components/map/MapModals/MapClearModal", () => {
  return function MockMapClearModal({ isOpen, onClose, onClearComplete }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="map-clear-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onClearComplete}>Clear Complete</button>
      </div>
    );
  };
});

describe("MapClearComponent", () => {
  const mockOnClearComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the clear map button", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      const button = screen.getByRole("button", { name: /clear map/i });
      expect(button).toBeInTheDocument();
    });

    it("should render the Trash icon", () => {
      const { container } = render(
        <MapClearComponent onClearComplete={mockOnClearComplete} />
      );

      const trashIcon = container.querySelector("svg");
      expect(trashIcon).toBeInTheDocument();
      expect(trashIcon).toHaveClass("w-5", "h-5");
    });

    it("should not render modal initially", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      expect(screen.queryByTestId("map-clear-modal")).not.toBeInTheDocument();
    });
  });

  describe("Functionality", () => {
    it("should open modal when button is clicked", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      const button = screen.getByRole("button", { name: /clear map/i });
      fireEvent.click(button);

      expect(screen.getByTestId("map-clear-modal")).toBeInTheDocument();
    });

    it("should close modal when close is triggered", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      // Open modal
      const openButton = screen.getByRole("button", { name: /clear map/i });
      fireEvent.click(openButton);

      expect(screen.getByTestId("map-clear-modal")).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText("Close Modal");
      fireEvent.click(closeButton);

      expect(screen.queryByTestId("map-clear-modal")).not.toBeInTheDocument();
    });

    it("should call onClearComplete from modal", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      // Open modal
      const openButton = screen.getByRole("button", { name: /clear map/i });
      fireEvent.click(openButton);

      // Trigger clear complete
      const clearButton = screen.getByText("Clear Complete");
      fireEvent.click(clearButton);

      expect(mockOnClearComplete).toHaveBeenCalledTimes(1);
    });

    it("should work without onClearComplete prop", () => {
      render(<MapClearComponent />);

      const button = screen.getByRole("button", { name: /clear map/i });
      fireEvent.click(button);

      expect(screen.getByTestId("map-clear-modal")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should have correct button styling", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      const button = screen.getByRole("button", { name: /clear map/i });
      expect(button).toHaveClass("bg-white");
      expect(button).toHaveClass("dark:bg-gray-800");
      expect(button).toHaveClass("border-red-600/20");
      expect(button).toHaveClass("rounded-xl");
    });

    it("should have hover effects", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      const button = screen.getByRole("button", { name: /clear map/i });
      expect(button).toHaveClass("hover:enabled:shadow-md");
      expect(button).toHaveClass("hover:enabled:border-red-600");
      expect(button).toHaveClass("hover:enabled:bg-red-500");
    });

    it("should have disabled state styling", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      const button = screen.getByRole("button", { name: /clear map/i });
      expect(button).toHaveClass("disabled:opacity-50");
      expect(button).toHaveClass("disabled:cursor-not-allowed");
    });

    it("should display text only on medium screens", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      const text = screen.getByText("Clear Map");
      expect(text).toHaveClass("hidden", "md:block");
    });
  });

  describe("Accessibility", () => {
    it("should have a title attribute", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      const button = screen.getByRole("button", { name: /clear map/i });
      expect(button).toHaveAttribute("title", "Clear Map");
    });

    it("should be a button element", () => {
      render(<MapClearComponent onClearComplete={mockOnClearComplete} />);

      const button = screen.getByRole("button", { name: /clear map/i });
      expect(button.tagName).toBe("BUTTON");
    });
  });
});
