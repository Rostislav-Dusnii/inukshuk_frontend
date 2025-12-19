import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HintList } from "../../../components/admin/HintList";
import { Hint } from "../../../types";

describe("HintList Component", () => {
  const mockOnActivate = jest.fn();
  const mockOnDelete = jest.fn();

  const mockHints: Hint[] = [
    {
      id: 1,
      title: "Hint 1",
      content: "This is the first hint",
      active: true,
    },
    {
      id: 2,
      title: "Hint 2",
      content: "This is the second hint",
      active: false,
    },
    {
      id: 3,
      title: "Hint 3",
      content: "This is the third hint",
      active: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial render", () => {
    it("should render all hints", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Hint 1")).toBeInTheDocument();
      expect(screen.getByText("Hint 2")).toBeInTheDocument();
      expect(screen.getByText("Hint 3")).toBeInTheDocument();
    });

    it("should render hint contents", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("This is the first hint")).toBeInTheDocument();
      expect(screen.getByText("This is the second hint")).toBeInTheDocument();
      expect(screen.getByText("This is the third hint")).toBeInTheDocument();
    });

    it("should render lightbulb icons for all hints", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const icons = document.querySelectorAll(".lucide-lightbulb");
      expect(icons.length).toBe(3);
    });

    it("should render empty list when no hints provided", () => {
      const { container } = render(
        <HintList
          hints={[]}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const list = container.querySelector("ul");
      expect(list?.children.length).toBe(0);
    });
  });

  describe("Active hint styling", () => {
    it("should highlight active hint with green border", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const activeHint = screen.getByText("Hint 1").closest("li");
      expect(activeHint).toHaveClass("border-brand-green-light");
    });

    it("should show check icon for active hint", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const checkIcons = document.querySelectorAll(".lucide-check");
      expect(checkIcons.length).toBe(1);
    });

    it("should not show check icon for inactive hints", () => {
      const inactiveHints: Hint[] = [
        {
          id: 1,
          title: "Hint 1",
          content: "Content 1",
          active: false,
        },
        {
          id: 2,
          title: "Hint 2",
          content: "Content 2",
          active: false,
        },
      ];

      render(
        <HintList
          hints={inactiveHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const checkIcons = document.querySelectorAll(".lucide-check");
      expect(checkIcons.length).toBe(0);
    });

    it("should style lightbulb icon green for active hint", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const icons = document.querySelectorAll(".lucide-lightbulb");
      const activeIcon = icons[0];
      expect(activeIcon).toHaveClass("text-brand-green-light");
    });

    it("should style lightbulb icon gray for inactive hints", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const icons = document.querySelectorAll(".lucide-lightbulb");
      const inactiveIcon = icons[1];
      expect(inactiveIcon).toHaveClass("text-gray-400");
    });
  });

  describe("Delete functionality", () => {
    it("should show delete button for inactive hints", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const deleteIcons = document.querySelectorAll(".lucide-trash-2");
      expect(deleteIcons.length).toBe(2); // Only for inactive hints
    });

    it("should not show delete button for active hint", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const activeHint = screen.getByText("Hint 1").closest("li");
      const deleteIcon = activeHint?.querySelector(".lucide-trash-2");
      expect(deleteIcon).not.toBeInTheDocument();
    });

    it("should call onDelete with correct id when delete icon is clicked", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const deleteIcons = document.querySelectorAll(".lucide-trash-2");
      fireEvent.click(deleteIcons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith(2);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("should stop propagation when delete is clicked", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const deleteIcons = document.querySelectorAll(".lucide-trash-2");
      fireEvent.click(deleteIcons[0]);

      // onActivate should not be called because propagation is stopped
      expect(mockOnActivate).not.toHaveBeenCalled();
      expect(mockOnDelete).toHaveBeenCalled();
    });

    it("should not show delete button for selected hint", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
          selectedHintId={2}
        />
      );

      const hint2 = screen.getByText("Hint 2").closest("li");
      const deleteIcon = hint2?.querySelector(".lucide-trash-2");
      expect(deleteIcon).not.toBeInTheDocument();
    });
  });

  describe("Activate functionality", () => {
    it("should call onActivate when hint is clicked", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const hint2 = screen.getByText("Hint 2").closest("li");
      fireEvent.click(hint2!);

      expect(mockOnActivate).toHaveBeenCalledWith(2);
      expect(mockOnActivate).toHaveBeenCalledTimes(1);
    });

    it("should call onActivate for active hint when clicked", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const hint1 = screen.getByText("Hint 1").closest("li");
      fireEvent.click(hint1!);

      expect(mockOnActivate).toHaveBeenCalledWith(1);
    });

    it("should handle clicking on different hints", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const hint1 = screen.getByText("Hint 1").closest("li");
      const hint2 = screen.getByText("Hint 2").closest("li");
      const hint3 = screen.getByText("Hint 3").closest("li");

      fireEvent.click(hint1!);
      fireEvent.click(hint2!);
      fireEvent.click(hint3!);

      expect(mockOnActivate).toHaveBeenCalledTimes(3);
      expect(mockOnActivate).toHaveBeenNthCalledWith(1, 1);
      expect(mockOnActivate).toHaveBeenNthCalledWith(2, 2);
      expect(mockOnActivate).toHaveBeenNthCalledWith(3, 3);
    });
  });

  describe("Cursor and interaction styling", () => {
    it("should have cursor-pointer class on hint items", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const hint1 = screen.getByText("Hint 1").closest("li");
      expect(hint1).toHaveClass("cursor-pointer");
    });

    it("should have cursor-pointer class on delete icons", () => {
      render(
        <HintList
          hints={mockHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const deleteIcons = document.querySelectorAll(".lucide-trash-2");
      const deleteButton = deleteIcons[0].closest("div");
      expect(deleteButton).toHaveClass("cursor-pointer");
    });
  });

  describe("Multiple active hints", () => {
    it("should handle multiple active hints", () => {
      const multipleActiveHints: Hint[] = [
        {
          id: 1,
          title: "Hint 1",
          content: "Content 1",
          active: true,
        },
        {
          id: 2,
          title: "Hint 2",
          content: "Content 2",
          active: true,
        },
      ];

      render(
        <HintList
          hints={multipleActiveHints}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      const checkIcons = document.querySelectorAll(".lucide-check");
      expect(checkIcons.length).toBe(2);
    });
  });

  describe("Edge cases", () => {
    it("should handle single hint", () => {
      const singleHint: Hint[] = [
        {
          id: 1,
          title: "Only Hint",
          content: "Only content",
          active: false,
        },
      ];

      render(
        <HintList
          hints={singleHint}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Only Hint")).toBeInTheDocument();
    });

    it("should handle long hint titles", () => {
      const longTitleHint: Hint[] = [
        {
          id: 1,
          title:
            "This is a very long hint title that should still render properly",
          content: "Content",
          active: false,
        },
      ];

      render(
        <HintList
          hints={longTitleHint}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByText(
          "This is a very long hint title that should still render properly"
        )
      ).toBeInTheDocument();
    });

    it("should handle long hint content", () => {
      const longContentHint: Hint[] = [
        {
          id: 1,
          title: "Hint",
          content:
            "This is a very long content that should still render properly even if it contains a lot of text",
          active: false,
        },
      ];

      render(
        <HintList
          hints={longContentHint}
          onActivate={mockOnActivate}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.getByText(
          /This is a very long content that should still render properly/
        )
      ).toBeInTheDocument();
    });
  });
});
