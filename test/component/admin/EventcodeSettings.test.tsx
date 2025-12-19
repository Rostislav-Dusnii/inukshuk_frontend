import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EventCodeSettings from "../../../components/admin/EventcodeSettings";
import AdminService from "../../../services/AdminService";
import enTranslations from "../../../public/locales/en/common.json";

// Mock AdminService
jest.mock("../../../services/AdminService", () => ({
  __esModule: true,
  default: {
    getEventCode: jest.fn(),
    updateEventCode: jest.fn(),
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

describe("EventCodeSettings Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial render and data fetching", () => {
    it("should render the title", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST123",
      });

      render(<EventCodeSettings />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent(/event/i);
      expect(heading).toHaveTextContent(/code/i);
      expect(heading).toHaveTextContent(/settings/i);
    });

    it("should fetch and display current event code", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "CURRENT123",
      });

      render(<EventCodeSettings />);

      await waitFor(() => {
        expect(screen.getByText(/current123/i)).toBeInTheDocument();
      });
    });

    it("should call getEventCode on mount", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      await waitFor(() => {
        expect(AdminService.getEventCode).toHaveBeenCalledTimes(1);
      });
    });

    it("should render new code input field", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      expect(input).toBeInTheDocument();
    });

    it("should render update button", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const button = screen.getByRole("button", { name: /update code/i });
      expect(button).toBeInTheDocument();
    });

    it("should render requirements section", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      expect(screen.getByText(/event code requirements/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 4 characters/i)).toBeInTheDocument();
      expect(
        screen.getByText(/can include letters, numbers, or symbols/i)
      ).toBeInTheDocument();
    });
  });

  describe("Form input", () => {
    it("should update input value when typing", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(
        /enter new code/i
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "NEWCODE" } });

      expect(input.value).toBe("NEWCODE");
    });

    it("should remove spaces from input", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(
        /enter new code/i
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "NEW CODE" } });

      expect(input.value).toBe("NEWCODE");
    });

    it("should handle multiple spaces", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(
        /enter new code/i
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "  NEW  CODE  123  " } });

      expect(input.value).toBe("NEWCODE123");
    });
  });

  describe("Validation", () => {
    it("should show error when code is empty", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const button = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(button);

      expect(
        screen.getByText(/event code must be at least 4 characters long/i)
      ).toBeInTheDocument();
    });

    it("should show error when code is less than 4 characters", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "ABC" } });

      const button = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(button);

      expect(
        screen.getByText(/event code must be at least 4 characters long/i)
      ).toBeInTheDocument();
    });

    it("should not show error when code is 4 characters", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "ABCD" } });

      const button = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(button);

      expect(
        screen.queryByText(/event code must be at least 4 characters long/i)
      ).not.toBeInTheDocument();
    });

    it("should accept codes longer than 4 characters", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "VERYLONGCODE12345" } });

      const button = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(button);

      expect(
        screen.queryByText(/event code must be at least 4 characters long/i)
      ).not.toBeInTheDocument();
    });

    it("should clear error when valid input is entered", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      // First submit with invalid input
      const button = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(button);

      expect(
        screen.getByText(/event code must be at least 4 characters long/i)
      ).toBeInTheDocument();

      // Then enter valid input and submit
      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "VALID" } });
      fireEvent.click(button);

      expect(
        screen.queryByText(/event code must be at least 4 characters long/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Confirmation modal", () => {
    it("should show confirmation modal when form is valid and submitted", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "NEWCODE" } });

      const button = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(button);

      expect(
        screen.getByText(/are you sure you want to update the event code/i)
      ).toBeInTheDocument();
    });

    it("should not show modal when form is invalid", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const button = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(button);

      expect(
        screen.queryByText(/are you sure you want to update the event code/i)
      ).not.toBeInTheDocument();
    });

    it("should show cancel and confirm buttons in modal", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "NEWCODE" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /yes.*update/i })
      ).toBeInTheDocument();
    });

    it("should close modal when cancel button is clicked", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "NEWCODE" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(
        screen.queryByText(/are you sure you want to update the event code/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Update functionality", () => {
    it("should call updateEventCode with correct data when confirmed", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "OLDCODE",
      });
      (AdminService.updateEventCode as jest.Mock).mockResolvedValue({
        code: "NEWCODE",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "NEWCODE" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*update/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(AdminService.updateEventCode).toHaveBeenCalledWith({
          code: "NEWCODE",
        });
      });
    });

    it("should update displayed event code after successful update", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "OLDCODE",
      });
      (AdminService.updateEventCode as jest.Mock).mockResolvedValue({
        code: "UPDATED",
      });

      render(<EventCodeSettings />);

      await waitFor(() => {
        expect(screen.getByText(/oldcode/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "UPDATED" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*update/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/updated/i)).toBeInTheDocument();
      });
    });

    it("should clear input field after successful update", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "OLDCODE",
      });
      (AdminService.updateEventCode as jest.Mock).mockResolvedValue({
        code: "NEWCODE",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(
        /enter new code/i
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "NEWCODE" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*update/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

    it("should close modal after successful update", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "OLDCODE",
      });
      (AdminService.updateEventCode as jest.Mock).mockResolvedValue({
        code: "NEWCODE",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "NEWCODE" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*update/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/are you sure you want to update the event code/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Input styling based on error", () => {
    it("should have red border when there is an error", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const button = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(button);

      const input = screen.getByPlaceholderText(/enter new code/i);
      expect(input).toHaveClass("border-red-500");
    });

    it("should not have red border when there is no error", () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      expect(input).not.toHaveClass("border-red-500");
    });
  });

  describe("Edge cases", () => {
    it("should handle updating to same code", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "SAMECODE",
      });
      (AdminService.updateEventCode as jest.Mock).mockResolvedValue({
        code: "SAMECODE",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "SAMECODE" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      const confirmButton = screen.getByRole("button", {
        name: /yes.*update/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(AdminService.updateEventCode).toHaveBeenCalled();
      });
    });

    it("should handle codes with special characters", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });
      (AdminService.updateEventCode as jest.Mock).mockResolvedValue({
        code: "CODE!@#$",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "CODE!@#$" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      expect(
        screen.queryByText(/event code must be at least 4 characters long/i)
      ).not.toBeInTheDocument();
    });

    it("should handle codes with numbers", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "1234" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      expect(
        screen.queryByText(/event code must be at least 4 characters long/i)
      ).not.toBeInTheDocument();
    });

    it("should handle codes with mixed case", async () => {
      (AdminService.getEventCode as jest.Mock).mockResolvedValue({
        code: "TEST",
      });

      render(<EventCodeSettings />);

      const input = screen.getByPlaceholderText(/enter new code/i);
      fireEvent.change(input, { target: { value: "AbCd123" } });

      const submitButton = screen.getByRole("button", { name: /update code/i });
      fireEvent.click(submitButton);

      expect(
        screen.queryByText(/event code must be at least 4 characters long/i)
      ).not.toBeInTheDocument();
    });
  });
});
