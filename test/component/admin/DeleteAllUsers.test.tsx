import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteAllUsers from "../../../components/admin/DeleteAllUsers";
import AdminService from "../../../services/AdminService";
import enTranslations from "../../../public/locales/en/common.json";

// Mock AdminService
jest.mock("../../../services/AdminService", () => ({
  __esModule: true,
  default: {
    deleteAllUsersWithRoleUser: jest.fn(),
  },
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

describe("DeleteAllUsers Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial render", () => {
    it("should render the title", () => {
      render(<DeleteAllUsers />);

      expect(
        screen.getByRole("heading", { name: /delete users settings/i })
      ).toBeInTheDocument();
    });

    it("should render action description", () => {
      render(<DeleteAllUsers />);

      expect(screen.getByText(/action:/i)).toBeInTheDocument();
      expect(
        screen.getByText(/delete all users with role user/i)
      ).toBeInTheDocument();
    });

    it("should render delete button", () => {
      render(<DeleteAllUsers />);

      const button = screen.getByRole("button", { name: /delete all users/i });
      expect(button).toBeInTheDocument();
    });

    it("should render requirements section", () => {
      render(<DeleteAllUsers />);

      expect(
        screen.getByText(/delete action requirements/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/this will remove all users with role user/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/this action cannot be undone/i)
      ).toBeInTheDocument();
    });

    it("should not show error message initially", () => {
      render(<DeleteAllUsers />);

      const errorMessage = screen.queryByText(/an error occurred/i);
      expect(errorMessage).not.toBeInTheDocument();
    });

    it("should not show success message initially", () => {
      render(<DeleteAllUsers />);

      const successMessage = screen.queryByText(
        /all users with role user have been deleted/i
      );
      expect(successMessage).not.toBeInTheDocument();
    });

    it("should not show confirmation modal initially", () => {
      render(<DeleteAllUsers />);

      const confirmModal = screen.queryByText(
        /are you sure you want to delete all users/i
      );
      expect(confirmModal).not.toBeInTheDocument();
    });
  });

  describe("Confirmation modal", () => {
    it("should show confirmation modal when delete button is clicked", () => {
      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      expect(
        screen.getByText(/are you sure you want to delete all users/i)
      ).toBeInTheDocument();
    });

    it("should show cancel and confirm buttons in modal", () => {
      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /yes.*delete/i })
      ).toBeInTheDocument();
    });

    it("should close modal when cancel button is clicked", () => {
      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(
        screen.queryByText(/are you sure you want to delete all users/i)
      ).not.toBeInTheDocument();
    });

    it("should clear error when opening confirmation modal", () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockRejectedValue(
        new Error("Test error")
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      waitFor(() => {
        expect(screen.getByText(/test error/i)).toBeInTheDocument();
      });

      // Click delete again
      fireEvent.click(deleteButton);

      // Error should be cleared
      expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
    });

    it("should clear success message when opening confirmation modal", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockResolvedValue(
        {}
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/all users with role user have been deleted/i)
        ).toBeInTheDocument();
      });

      // Click delete again
      fireEvent.click(deleteButton);

      // Success should be cleared
      expect(
        screen.queryByText(/all users with role user have been deleted/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Delete functionality", () => {
    it("should call deleteAllUsersWithRoleUser when confirmed", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockResolvedValue(
        {}
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(AdminService.deleteAllUsersWithRoleUser).toHaveBeenCalledTimes(
          1
        );
      });
    });

    it("should show success message after successful deletion", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockResolvedValue(
        {}
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/all users with role user have been deleted/i)
        ).toBeInTheDocument();
      });
    });

    it("should close modal after successful deletion", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockResolvedValue(
        {}
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/are you sure you want to delete all users/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Error handling", () => {
    it("should show error message when deletion fails", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockRejectedValue(
        new Error("Deletion failed")
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/deletion failed/i)).toBeInTheDocument();
      });
    });

    it("should show generic error when error has no message", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockRejectedValue(
        {}
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
      });
    });

    it("should close modal after error", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockRejectedValue(
        new Error("Test error")
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/are you sure you want to delete all users/i)
        ).not.toBeInTheDocument();
      });
    });

    it("should handle network errors", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe("Styling", () => {
    it("should have correct styling for delete button", () => {
      render(<DeleteAllUsers />);

      const button = screen.getByRole("button", { name: /delete all users/i });
      expect(button).toHaveClass("bg-brand-green");
      expect(button).toHaveClass("text-white");
    });

    it("should have correct styling for requirements section", () => {
      render(<DeleteAllUsers />);

      const requirementsSection = screen
        .getByText(/delete action requirements/i)
        .closest("div");
      expect(requirementsSection).toHaveClass("border");
      expect(requirementsSection).toHaveClass("rounded-lg");
    });

    it("should have correct styling for success message", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockResolvedValue(
        {}
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const successMessage = screen.getByText(
          /all users with role user have been deleted/i
        );
        expect(successMessage.closest("div")).toHaveClass("border-brand-green");
      });
    });

    it("should have correct styling for error message", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockRejectedValue(
        new Error("Test error")
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/test error/i);
        expect(errorMessage.closest("div")).toHaveClass("border-red-500");
      });
    });
  });

  describe("Multiple deletions", () => {
    it("should handle multiple successful deletions", async () => {
      (AdminService.deleteAllUsersWithRoleUser as jest.Mock).mockResolvedValue(
        {}
      );

      render(<DeleteAllUsers />);

      const deleteButton = screen.getByRole("button", {
        name: /delete all users/i,
      });

      // First deletion
      fireEvent.click(deleteButton);
      let confirmButton = screen.getByRole("button", { name: /yes.*delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(AdminService.deleteAllUsersWithRoleUser).toHaveBeenCalledTimes(
          1
        );
      });

      // Second deletion
      fireEvent.click(deleteButton);
      confirmButton = screen.getByRole("button", { name: /yes.*delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(AdminService.deleteAllUsersWithRoleUser).toHaveBeenCalledTimes(
          2
        );
      });
    });
  });
});
