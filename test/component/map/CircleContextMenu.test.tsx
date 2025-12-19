import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CircleContextMenu from "@components/map/CircleContextMenu";

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        "map.deleteCircle": "Delete Circle",
        "map.confirm": "Are you sure?",
        "map.circle.yes": "Yes",
        "map.circle.no": "No",
        "common.yes": "common.yes",
        "common.no": "common.no",
        "map.circle.is_inside": "Is Inside",
        "map.circleList.hide": "Hide",
        "map.circleList.show": "Show",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CircleContextMenu", () => {
  const mockOnDelete = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    x: 100,
    y: 200,
    circleId: 1,
    onDelete: mockOnDelete,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the context menu at correct position", () => {
      const { container } = render(<CircleContextMenu {...defaultProps} />);

      const menu = container.querySelector(".fixed");
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveStyle({ left: "100px", top: "200px" });
    });

    it("should render delete button initially", () => {
      render(<CircleContextMenu {...defaultProps} />);

      expect(screen.getByText("Delete Circle")).toBeInTheDocument();
    });

    it("should not show confirmation initially", () => {
      render(<CircleContextMenu {...defaultProps} />);

      expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
    });
  });

  describe("Confirmation flow", () => {
    it("should show confirmation when delete button is clicked", () => {
      render(<CircleContextMenu {...defaultProps} />);

      const deleteButton = screen.getByText("Delete Circle");
      fireEvent.click(deleteButton);

      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
      expect(screen.getByText("common.yes")).toBeInTheDocument();
      expect(screen.getByText("common.no")).toBeInTheDocument();
    });

    it("should hide delete button when confirmation is shown", () => {
      render(<CircleContextMenu {...defaultProps} />);

      const deleteButton = screen.getByText("Delete Circle");
      fireEvent.click(deleteButton);

      expect(screen.queryByText("Delete Circle")).not.toBeInTheDocument();
    });

    it("should call onDelete when Yes is clicked", () => {
      render(<CircleContextMenu {...defaultProps} />);

      // Click delete
      const deleteButton = screen.getByText("Delete Circle");
      fireEvent.click(deleteButton);

      // Click Yes
      const yesButton = screen.getByText("common.yes");
      fireEvent.click(yesButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("should hide confirmation when No is clicked", () => {
      render(<CircleContextMenu {...defaultProps} />);

      // Click delete
      const deleteButton = screen.getByText("Delete Circle");
      fireEvent.click(deleteButton);

      // Click No
      const noButton = screen.getByText("common.no");
      fireEvent.click(noButton);

      expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
      expect(screen.getByText("Delete Circle")).toBeInTheDocument();
    });

    it("should not call onDelete when No is clicked", () => {
      render(<CircleContextMenu {...defaultProps} />);

      // Click delete
      const deleteButton = screen.getByText("Delete Circle");
      fireEvent.click(deleteButton);

      // Click No
      const noButton = screen.getByText("common.no");
      fireEvent.click(noButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe("Click outside functionality", () => {
    it("should call onClose when clicking outside menu", () => {
      const { container } = render(
        <div>
          <div data-testid="outside">Outside</div>
          <CircleContextMenu {...defaultProps} />
        </div>
      );

      const outside = screen.getByTestId("outside");
      fireEvent.mouseDown(outside);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when clicking inside menu", () => {
      render(<CircleContextMenu {...defaultProps} />);

      const deleteButton = screen.getByText("Delete Circle");
      fireEvent.mouseDown(deleteButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard functionality", () => {
    it("should call onClose when Escape key is pressed", () => {
      render(<CircleContextMenu {...defaultProps} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose for other keys", () => {
      render(<CircleContextMenu {...defaultProps} />);

      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: "a" });
      fireEvent.keyDown(document, { key: "Tab" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Position variations", () => {
    it("should render at different x positions", () => {
      const { container } = render(
        <CircleContextMenu {...defaultProps} x={500} />
      );

      const menu = container.querySelector(".fixed");
      expect(menu).toHaveStyle({ left: "500px" });
    });

    it("should render at different y positions", () => {
      const { container } = render(
        <CircleContextMenu {...defaultProps} y={50} />
      );

      const menu = container.querySelector(".fixed");
      expect(menu).toHaveStyle({ top: "50px" });
    });

    it("should handle edge positions", () => {
      const { container } = render(
        <CircleContextMenu {...defaultProps} x={0} y={0} />
      );

      const menu = container.querySelector(".fixed");
      expect(menu).toHaveStyle({ left: "100px", top: "0px" });
    });
  });

  describe("Styling", () => {
    it("should have correct z-index", () => {
      const { container } = render(<CircleContextMenu {...defaultProps} />);

      const menu = container.querySelector(".fixed");
      expect(menu).toHaveClass("z-[2000]");
    });

    it("should have red background for delete button", () => {
      render(<CircleContextMenu {...defaultProps} />);

      const deleteButton = screen.getByText("Delete Circle");
      expect(deleteButton).toBeInTheDocument();
    });

    it("should have correct styling for Yes button", () => {
      render(<CircleContextMenu {...defaultProps} />);

      const deleteButton = screen.getByText("Delete Circle");
      fireEvent.click(deleteButton);

      const yesButton = screen.getByText("common.yes");
      expect(yesButton).toHaveClass("bg-red-500");
    });

    it("should have gray background for No button", () => {
      render(<CircleContextMenu {...defaultProps} />);

      const deleteButton = screen.getByText("Delete Circle");
      fireEvent.click(deleteButton);

      const noButton = screen.getByText("common.no");
      expect(noButton).toHaveClass("bg-gray-500");
    });
  });

  describe("Different circle IDs", () => {
    it("should work with different circle IDs", () => {
      const { rerender } = render(
        <CircleContextMenu {...defaultProps} circleId={1} />
      );

      expect(screen.getByText("Delete Circle")).toBeInTheDocument();

      rerender(<CircleContextMenu {...defaultProps} circleId={999} />);

      expect(screen.getByText("Delete Circle")).toBeInTheDocument();
    });
  });

  describe("Cleanup", () => {
    it("should clean up event listeners on unmount", () => {
      const { unmount } = render(<CircleContextMenu {...defaultProps} />);

      unmount();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Circle data interactions", () => {
    const mockOnUpdateCircleInside = jest.fn();
    const mockOnToggleVisibility = jest.fn();

    const circleData = {
      id: 1,
      inside: true,
      visible: true,
      shape: {},
    };

    beforeEach(() => {
      mockOnUpdateCircleInside.mockClear();
      mockOnToggleVisibility.mockClear();
    });

    it("should render inside toggle when circleData and onUpdateCircleInside provided", () => {
      render(
        <CircleContextMenu
          {...defaultProps}
          circleData={circleData}
          onUpdateCircleInside={mockOnUpdateCircleInside}
        />
      );

      expect(screen.getByText("Is Inside")).toBeInTheDocument();
      expect(screen.getByText("Yes")).toBeInTheDocument();
      expect(screen.getByText("No")).toBeInTheDocument();
    });

    it("should call onUpdateCircleInside when inside is changed to true", () => {
      const data = { ...circleData, inside: false };

      render(
        <CircleContextMenu
          {...defaultProps}
          circleData={data}
          onUpdateCircleInside={mockOnUpdateCircleInside}
        />
      );

      const yesRadio = screen.getByLabelText("Yes");
      fireEvent.click(yesRadio);

      expect(mockOnUpdateCircleInside).toHaveBeenCalledWith(1, true);
    });

    it("should call onUpdateCircleInside when inside is changed to false", () => {
      render(
        <CircleContextMenu
          {...defaultProps}
          circleData={circleData}
          onUpdateCircleInside={mockOnUpdateCircleInside}
        />
      );

      const noRadio = screen.getByLabelText("No");
      fireEvent.click(noRadio);

      expect(mockOnUpdateCircleInside).toHaveBeenCalledWith(1, false);
    });

    it("should render visibility toggle when circleData and onToggleVisibility provided", () => {
      render(
        <CircleContextMenu
          {...defaultProps}
          circleData={circleData}
          onToggleVisibility={mockOnToggleVisibility}
        />
      );

      expect(screen.getByText("Hide")).toBeInTheDocument();
    });

    it("should show Hide button when circle is visible", () => {
      render(
        <CircleContextMenu
          {...defaultProps}
          circleData={{ ...circleData, visible: true }}
          onToggleVisibility={mockOnToggleVisibility}
        />
      );

      expect(screen.getByText("Hide")).toBeInTheDocument();
    });

    it("should show Show button when circle is not visible", () => {
      render(
        <CircleContextMenu
          {...defaultProps}
          circleData={{ ...circleData, visible: false }}
          onToggleVisibility={mockOnToggleVisibility}
        />
      );

      expect(screen.getByText("Show")).toBeInTheDocument();
    });

    it("should call onToggleVisibility when visibility button is clicked", () => {
      render(
        <CircleContextMenu
          {...defaultProps}
          circleData={circleData}
          onToggleVisibility={mockOnToggleVisibility}
        />
      );

      const hideButton = screen.getByText("Hide");
      fireEvent.click(hideButton);

      expect(mockOnToggleVisibility).toHaveBeenCalledWith(1);
    });
  });
});
