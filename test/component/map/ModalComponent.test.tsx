import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ModalComponent from "@components/map/ModalComponent";

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        "common.close": "Close",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock createPortal
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: any) => node,
}));

describe("ModalComponent", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = "unset";
  });

  describe("Visibility", () => {
    it("should not render when isOpen is false", () => {
      const { container } = render(
        <ModalComponent isOpen={false} onClose={mockOnClose} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render when isOpen is true", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Legacy mode (backwards compatibility)", () => {
    it("should render title in legacy mode", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          title="Test Title"
        />
      );

      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose}>
          <p>Test content</p>
        </ModalComponent>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("should render CLOSE button in legacy mode", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      expect(screen.getByText("CLOSE")).toBeInTheDocument();
    });

    it("should call onClose when CLOSE button is clicked", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      const closeButton = screen.getByText("CLOSE");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not show CLOSE button when showFooterClose is false", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          title="Test"
          showFooterClose={false}
        />
      );

      expect(screen.queryByText("CLOSE")).not.toBeInTheDocument();
    });

    it("should call onClose when overlay is clicked and dismissible is true", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          title="Test"
          dismissible={true}
        />
      );

      // Click on the overlay (the backdrop) - the div with role="dialog" is the overlay itself
      const overlay = screen.getByRole("dialog");

      // Create a proper click event where target === currentTarget
      const clickEvent = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(clickEvent, "target", {
        value: overlay,
        enumerable: true,
      });
      Object.defineProperty(clickEvent, "currentTarget", {
        value: overlay,
        enumerable: true,
      });
      fireEvent(overlay, clickEvent);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when modal content is clicked even if dismissible", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          title="Test"
          dismissible={true}
        />
      );

      // Click on the modal content box (the white/dark box inside)
      const modalContent = screen
        .getByRole("dialog")
        .querySelector(".bg-white");
      fireEvent.click(modalContent!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Legacy mode (backwards compatibility) continued", () => {
    it("should not show CLOSE button when showFooterClose is false (verified)", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          title="Test"
          showFooterClose={false}
        />
      );

      expect(screen.queryByText("CLOSE")).not.toBeInTheDocument();
    });
  });

  describe("Enhanced mode", () => {
    it("should render in enhanced mode with message", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          title="Success"
          message="Operation completed successfully"
          type="success"
        />
      );

      expect(
        screen.getByText("Operation completed successfully")
      ).toBeInTheDocument();
    });

    it("should render OK button when no custom buttons provided", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Test message"
        />
      );

      expect(screen.getByText("OK")).toBeInTheDocument();
    });

    it("should render custom buttons", () => {
      const buttons = [
        { label: "Confirm", onClick: jest.fn(), variant: "primary" as const },
        { label: "Cancel", onClick: jest.fn(), variant: "secondary" as const },
      ];

      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Are you sure?"
          buttons={buttons}
        />
      );

      expect(screen.getByText("Confirm")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should call button onClick handlers", () => {
      const confirmHandler = jest.fn();
      const cancelHandler = jest.fn();
      const buttons = [
        {
          label: "Confirm",
          onClick: confirmHandler,
          variant: "primary" as const,
        },
        {
          label: "Cancel",
          onClick: cancelHandler,
          variant: "secondary" as const,
        },
      ];

      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          buttons={buttons}
          message="Test"
        />
      );

      fireEvent.click(screen.getByText("Confirm"));
      expect(confirmHandler).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("Cancel"));
      expect(cancelHandler).toHaveBeenCalledTimes(1);
    });

    it("should display correct icon for success type", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Success"
          type="success"
        />
      );

      expect(screen.getByText("🎉")).toBeInTheDocument();
    });

    it("should display correct icon for warning type", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Warning"
          type="warning"
        />
      );

      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });

    it("should display correct icon for danger type", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Danger"
          type="danger"
        />
      );

      expect(screen.getByText("❌")).toBeInTheDocument();
    });

    it("should display correct icon for info type", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Info"
          type="info"
        />
      );

      expect(screen.getByText("ℹ️")).toBeInTheDocument();
    });

    it("should not show OK button when showFooterClose is false", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Test"
          showFooterClose={false}
        />
      );

      expect(screen.queryByText("OK")).not.toBeInTheDocument();
    });
  });

  describe("Close button (X)", () => {
    it("should render X close button by default", () => {
      const { container } = render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      const xButton = container.querySelector('a[aria-label="Close modal"]');
      expect(xButton).toBeInTheDocument();
    });

    it("should not render X close button when showCloseButton is false", () => {
      const { container } = render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          title="Test"
          showCloseButton={false}
        />
      );

      const xButton = container.querySelector('a[aria-label="Close modal"]');
      expect(xButton).not.toBeInTheDocument();
    });

    it("should call onClose when X button is clicked", () => {
      const { container } = render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      const xButton = container.querySelector(
        'a[aria-label="Close modal"]'
      ) as HTMLElement;
      fireEvent.click(xButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not render X button when not dismissible", () => {
      const { container } = render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          title="Test"
          dismissible={false}
        />
      );

      const xButton = container.querySelector('a[aria-label="Close modal"]');
      expect(xButton).not.toBeInTheDocument();
    });
  });

  describe("Dismissible behavior", () => {
    it("should close on Escape key when dismissible", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          dismissible={true}
          title="Test"
        />
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not close on Escape key when not dismissible", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          dismissible={false}
          title="Test"
        />
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should close when clicking backdrop if dismissible", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          dismissible={true}
          title="Test"
        />
      );

      const backdrop = screen.getByRole("dialog");
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not close when clicking backdrop if not dismissible", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          dismissible={false}
          title="Test"
        />
      );

      const backdrop = screen.getByRole("dialog");
      fireEvent.click(backdrop);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should not close when clicking modal content", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test Modal">
          <p>Content</p>
        </ModalComponent>
      );

      const title = screen.getByText("Test Modal");
      fireEvent.click(title);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Body scroll lock", () => {
    it("should set body overflow to hidden when modal opens", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body overflow when modal closes", () => {
      const { rerender } = render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(
        <ModalComponent isOpen={false} onClose={mockOnClose} title="Test" />
      );

      expect(document.body.style.overflow).toBe("unset");
    });

    it("should restore body overflow on unmount", () => {
      const { unmount } = render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("unset");
    });
  });

  describe("Accessibility", () => {
    it("should have role dialog", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-modal true", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby", () => {
      render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    });

    it("should have aria-describedby when message is provided", () => {
      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Description"
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-describedby", "modal-description");
    });
  });

  describe("Button variants styling", () => {
    it("should apply primary variant styling", () => {
      const buttons = [
        { label: "Primary", onClick: jest.fn(), variant: "primary" as const },
      ];

      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Test"
          buttons={buttons}
        />
      );

      const button = screen.getByText("Primary");
      expect(button).toHaveClass("bg-brand-orange");
    });

    it("should apply danger variant styling", () => {
      const buttons = [
        { label: "Delete", onClick: jest.fn(), variant: "danger" as const },
      ];

      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Test"
          buttons={buttons}
        />
      );

      const button = screen.getByText("Delete");
      expect(button).toHaveClass("bg-red-600");
    });

    it("should apply secondary variant styling", () => {
      const buttons = [
        { label: "Cancel", onClick: jest.fn(), variant: "secondary" as const },
      ];

      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Test"
          buttons={buttons}
        />
      );

      const button = screen.getByText("Cancel");
      expect(button).toHaveClass("bg-gray-100");
    });

    it("should apply default (primary) styling for unknown variant", () => {
      const buttons = [
        { label: "Unknown", onClick: jest.fn(), variant: "unknown" as any },
      ];

      render(
        <ModalComponent
          isOpen={true}
          onClose={mockOnClose}
          message="Test"
          buttons={buttons}
        />
      );

      const button = screen.getByText("Unknown");
      expect(button).toHaveClass("bg-brand-orange");
    });
  });

  describe("Event cleanup", () => {
    it("should remove keyboard listener on unmount", () => {
      const { unmount } = render(
        <ModalComponent isOpen={true} onClose={mockOnClose} title="Test" />
      );

      unmount();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
