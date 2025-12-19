import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddHintForm from "../../../components/admin/AddHintForm";
import enTranslations from "../../../public/locales/en/common.json";

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

describe("AddHintForm Component", () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial render", () => {
    it("should render the form title", () => {
      render(<AddHintForm onAdd={mockOnAdd} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent(/add/i);
      expect(heading).toHaveTextContent(/new/i);
      expect(heading).toHaveTextContent(/hint/i);
    });

    it("should render title input field", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector('input[type="text"]');
      expect(titleInput).toBeInTheDocument();
    });

    it("should render content textarea field", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const contentTextarea = container.querySelector("textarea");
      expect(contentTextarea).toBeInTheDocument();
    });

    it("should render submit button", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const submitButton = screen.getByRole("button", { name: /add/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("should have empty input fields initially", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;

      expect(titleInput.value).toBe("");
      expect(contentTextarea.value).toBe("");
    });
  });

  describe("Form input", () => {
    it("should update title when typing", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: "Test Hint Title" } });

      expect(titleInput.value).toBe("Test Hint Title");
    });

    it("should update content when typing", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      fireEvent.change(contentTextarea, {
        target: { value: "Test hint content" },
      });

      expect(contentTextarea.value).toBe("Test hint content");
    });
  });

  describe("Validation - Title", () => {
    it("should show error when title is empty", async () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      // Remove required attribute to test JS validation
      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(contentTextarea, { target: { value: "Valid content" } });
      fireEvent.click(submitButton);

      expect(await screen.findByText("Title is required")).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("should show error when title is too short", async () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "Hi" } });
      fireEvent.change(contentTextarea, { target: { value: "Valid content" } });
      fireEvent.click(submitButton);

      expect(
        await screen.findByText("Title must be at least 3 characters long")
      ).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("should show error when title is too long", async () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      const longTitle = "a".repeat(101);
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.change(contentTextarea, { target: { value: "Valid content" } });
      fireEvent.click(submitButton);

      expect(
        await screen.findByText("Title cannot exceed 100 characters")
      ).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("should not show error when title is valid", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.change(contentTextarea, {
        target: { value: "Valid content here" },
      });
      fireEvent.click(submitButton);

      expect(screen.queryByText(/title/i)).not.toHaveTextContent("required");
    });
  });

  describe("Validation - Content", () => {
    it("should show error when content is empty", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("should show error when content is too short", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.change(contentTextarea, { target: { value: "Test" } });
      fireEvent.click(submitButton);

      expect(
        screen.getByText(/content must be at least 5 characters/i)
      ).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("should show error when content is too long", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      const longContent = "a".repeat(501);
      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.change(contentTextarea, { target: { value: longContent } });
      fireEvent.click(submitButton);

      expect(
        screen.getByText(/content cannot exceed 500 characters/i)
      ).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });
  });

  describe("Form submission", () => {
    it("should call onAdd with correct data when form is valid", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "Test Hint" } });
      fireEvent.change(contentTextarea, {
        target: { value: "This is test content" },
      });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith({
        title: "Test Hint",
        content: "This is test content",
      });
    });

    it("should clear form after successful submission", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "Test Hint" } });
      fireEvent.change(contentTextarea, {
        target: { value: "This is test content" },
      });
      fireEvent.click(submitButton);

      expect(titleInput.value).toBe("");
      expect(contentTextarea.value).toBe("");
    });

    it("should clear errors after successful submission", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      // First, create an error
      fireEvent.click(submitButton);
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();

      // Now submit valid data
      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.change(contentTextarea, { target: { value: "Valid content" } });
      fireEvent.click(submitButton);

      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
    });

    it("should prevent default form submission", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const form = screen.getByRole("button", { name: /add/i }).closest("form");
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(submitEvent, "preventDefault");

      form?.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should trim whitespace for title validation", async () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "   " } });
      fireEvent.change(contentTextarea, { target: { value: "Valid content" } });
      fireEvent.click(submitButton);

      expect(await screen.findByText("Title is required")).toBeInTheDocument();
    });

    it("should trim whitespace for content validation", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.change(contentTextarea, { target: { value: "   " } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });

    it("should accept title at minimum length (3 characters)", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "abc" } });
      fireEvent.change(contentTextarea, { target: { value: "Valid content" } });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalled();
    });

    it("should accept title at maximum length (100 characters)", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      const maxTitle = "a".repeat(100);
      fireEvent.change(titleInput, { target: { value: maxTitle } });
      fireEvent.change(contentTextarea, { target: { value: "Valid content" } });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalled();
    });

    it("should accept content at minimum length (5 characters)", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.change(contentTextarea, { target: { value: "abcde" } });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalled();
    });

    it("should accept content at maximum length (500 characters)", () => {
      const { container } = render(<AddHintForm onAdd={mockOnAdd} />);

      const titleInput = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      const contentTextarea = container.querySelector(
        "textarea"
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole("button", { name: /add/i });

      titleInput.removeAttribute("required");
      contentTextarea.removeAttribute("required");

      const maxContent = "a".repeat(500);
      fireEvent.change(titleInput, { target: { value: "Valid Title" } });
      fireEvent.change(contentTextarea, { target: { value: maxContent } });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalled();
    });
  });
});
