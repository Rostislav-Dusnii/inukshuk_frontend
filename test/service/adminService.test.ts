import AdminService from "@services/AdminService";
import { EventCode, UpdateCodeDTO, Hint, HintInputDto } from "@types";

// Mock the auth utility
jest.mock("@util/auth", () => ({
  getToken: jest.fn(() => "mock-token-123"),
}));

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";

describe("AdminService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getEventCode", () => {
    it("should fetch event code successfully (happy path)", async () => {
      // Arrange
      const mockEventCode: EventCode = {
        id: 1,
        code: "EVENT2024",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventCode,
      });

      // Act
      const result = await AdminService.getEventCode();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/admin/code",
        expect.objectContaining({
          cache: "no-store",
          headers: {
            Authorization: "Bearer mock-token-123",
          },
        })
      );
      expect(result).toEqual(mockEventCode);
    });

    it("should throw error when fetch fails (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      });

      // Act & Assert
      await expect(AdminService.getEventCode()).rejects.toThrow(
        "Failed to fetch event code"
      );
    });

    it("should throw error when network error occurs (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(AdminService.getEventCode()).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("updateEventCode", () => {
    it("should update event code successfully (happy path)", async () => {
      // Arrange
      const input: UpdateCodeDTO = { code: "NEWEVENT2024" };
      const mockUpdatedCode: EventCode = {
        id: 1,
        code: "NEWEVENT2024",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedCode,
      });

      // Act
      const result = await AdminService.updateEventCode(input);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/admin/code",
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token-123",
          },
          body: JSON.stringify(input),
        })
      );
      expect(result).toEqual(mockUpdatedCode);
    });

    it("should throw error when update fails (unhappy path)", async () => {
      // Arrange
      const input: UpdateCodeDTO = { code: "INVALID" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Invalid code format",
      });

      // Act & Assert
      await expect(AdminService.updateEventCode(input)).rejects.toThrow(
        "Invalid code format"
      );
    });

    it("should throw error when unauthorized (unhappy path)", async () => {
      // Arrange
      const input: UpdateCodeDTO = { code: "NEWEVENT2024" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      // Act & Assert
      await expect(AdminService.updateEventCode(input)).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("getHints", () => {
    it("should fetch all hints successfully (happy path)", async () => {
      // Arrange
      const mockHints: Hint[] = [
        {
          id: 1,
          title: "Hint 1",
          content: "Content for hint 1",
          active: true,
        },
        {
          id: 2,
          title: "Hint 2",
          content: "Content for hint 2",
          active: false,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHints,
      });

      // Act
      const result = await AdminService.getHints();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/admin/hints",
        expect.objectContaining({
          cache: "no-store",
          headers: {
            Authorization: "Bearer mock-token-123",
          },
        })
      );
      expect(result).toEqual(mockHints);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no hints exist (happy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Act
      const result = await AdminService.getHints();

      // Assert
      expect(result).toEqual([]);
    });

    it("should throw error when fetch fails (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(AdminService.getHints()).rejects.toThrow(
        "Failed to fetch hints"
      );
    });
  });

  describe("addHint", () => {
    it("should add hint successfully (happy path)", async () => {
      // Arrange
      const input: HintInputDto = {
        title: "New Hint",
        content: "New hint content",
      };
      const mockNewHint: Hint = {
        id: 3,
        title: "New Hint",
        content: "New hint content",
        active: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewHint,
      });

      // Act
      const result = await AdminService.addHint(input);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/admin/hint",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token-123",
          },
          body: JSON.stringify(input),
        })
      );
      expect(result).toEqual(mockNewHint);
    });

    it("should throw error when hint text is invalid (unhappy path)", async () => {
      // Arrange
      const input: HintInputDto = { title: "", content: "" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Hint text cannot be empty",
      });

      // Act & Assert
      await expect(AdminService.addHint(input)).rejects.toThrow(
        "Hint text cannot be empty"
      );
    });

    it("should throw error when server error occurs (unhappy path)", async () => {
      // Arrange
      const input: HintInputDto = {
        title: "Valid Hint",
        content: "Valid content",
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal server error",
      });

      // Act & Assert
      await expect(AdminService.addHint(input)).rejects.toThrow(
        "Internal server error"
      );
    });
  });

  describe("activateHint", () => {
    it("should activate hint successfully (happy path)", async () => {
      // Arrange
      const hintId = 1;
      const mockActivatedHint: Hint = {
        id: hintId,
        title: "Hint 1",
        content: "Content for hint 1",
        active: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivatedHint,
      });

      // Act
      const result = await AdminService.activateHint(hintId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/admin/hint/${hintId}/activate`,
        expect.objectContaining({
          method: "PUT",
          headers: {
            Authorization: "Bearer mock-token-123",
          },
        })
      );
      expect(result).toEqual(mockActivatedHint);
      expect(result.active).toBe(true);
    });

    it("should throw error when hint not found (unhappy path)", async () => {
      // Arrange
      const hintId = 999;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Hint not found",
      });

      // Act & Assert
      await expect(AdminService.activateHint(hintId)).rejects.toThrow(
        "Hint not found"
      );
    });

    it("should throw error when hint already active (unhappy path)", async () => {
      // Arrange
      const hintId = 1;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => "Hint is already active",
      });

      // Act & Assert
      await expect(AdminService.activateHint(hintId)).rejects.toThrow(
        "Hint is already active"
      );
    });
  });

  describe("deleteHint", () => {
    it("should delete hint successfully (happy path)", async () => {
      // Arrange
      const hintId = 1;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      // Act
      await AdminService.deleteHint(hintId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/admin/hint/${hintId}`,
        expect.objectContaining({
          method: "DELETE",
          headers: {
            Authorization: "Bearer mock-token-123",
          },
        })
      );
    });

    it("should throw error when hint not found (unhappy path)", async () => {
      // Arrange
      const hintId = 999;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Hint not found",
      });

      // Act & Assert
      await expect(AdminService.deleteHint(hintId)).rejects.toThrow(
        "Hint not found"
      );
    });

    it("should throw error when unauthorized (unhappy path)", async () => {
      // Arrange
      const hintId = 1;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      });

      // Act & Assert
      await expect(AdminService.deleteHint(hintId)).rejects.toThrow(
        "Forbidden"
      );
    });
  });

  describe("deleteAllUsersWithRoleUser", () => {
    it("should delete all users with role USER successfully (happy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      // Act
      await AdminService.deleteAllUsersWithRoleUser();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/admin/users",
        expect.objectContaining({
          method: "DELETE",
          headers: {
            Authorization: "Bearer mock-token-123",
          },
        })
      );
    });

    it("should throw error when unauthorized (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Forbidden: Admin access required",
      });

      // Act & Assert
      await expect(AdminService.deleteAllUsersWithRoleUser()).rejects.toThrow(
        "Forbidden: Admin access required"
      );
    });

    it("should throw error when server error occurs (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal server error",
      });

      // Act & Assert
      await expect(AdminService.deleteAllUsersWithRoleUser()).rejects.toThrow(
        "Internal server error"
      );
    });

    it("should throw error when network fails (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network connection failed")
      );

      // Act & Assert
      await expect(AdminService.deleteAllUsersWithRoleUser()).rejects.toThrow(
        "Network connection failed"
      );
    });
  });
});
