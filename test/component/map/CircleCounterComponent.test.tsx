import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CircleCounterComponent from "@components/map/MapTools/CircleCounterComponent";

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        "map.circleList.title": "Circles",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CircleCounterComponent", () => {
  describe("Rendering", () => {
    it("should render the counter value", () => {
      render(<CircleCounterComponent counter={5} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should render zero counter", () => {
      render(<CircleCounterComponent counter={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should render large counter values", () => {
      render(<CircleCounterComponent counter={999} />);

      expect(screen.getByText("999")).toBeInTheDocument();
    });

    it("should render the title text on medium screens and up", () => {
      render(<CircleCounterComponent counter={3} />);

      const title = screen.getByText("Circles");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("hidden", "md:block");
    });
  });

  describe("Styling", () => {
    it("should have the correct container classes", () => {
      const { container } = render(<CircleCounterComponent counter={5} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("bg-white");
      expect(wrapper).toHaveClass("dark:bg-gray-800");
      expect(wrapper).toHaveClass("rounded-xl");
      expect(wrapper).toHaveClass("shadow-sm");
    });

    it("should have gradient text for counter", () => {
      render(<CircleCounterComponent counter={42} />);

      const counter = screen.getByText("42");
      expect(counter).toHaveClass("bg-gradient-to-br");
      expect(counter).toHaveClass("from-brand-orange");
      expect(counter).toHaveClass("to-brand-orange-dark");
      expect(counter).toHaveClass("bg-clip-text");
      expect(counter).toHaveClass("text-transparent");
    });

    it("should have correct text sizing", () => {
      render(<CircleCounterComponent counter={10} />);

      const counter = screen.getByText("10");
      expect(counter).toHaveClass("text-2xl");
      expect(counter).toHaveClass("font-bold");
    });

    it("should have hover effects", () => {
      const { container } = render(<CircleCounterComponent counter={5} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("hover:shadow-md");
      expect(wrapper).toHaveClass("hover:border-brand-orange");
    });
  });

  describe("Edge cases", () => {
    it("should handle negative numbers", () => {
      render(<CircleCounterComponent counter={-5} />);

      expect(screen.getByText("-5")).toBeInTheDocument();
    });

    it("should handle very large numbers", () => {
      render(<CircleCounterComponent counter={10000} />);

      expect(screen.getByText("10000")).toBeInTheDocument();
    });
  });
});
