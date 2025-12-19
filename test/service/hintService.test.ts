import HintsService from "@services/HintService";
import { Hint } from "@types";

// Mock the auth utility
jest.mock("@util/auth", () => ({
  getToken: jest.fn(() => "mock-token-123"),
}));

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";

describe("HintsService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getActiveHint", () => {
    it("should get active hint successfully (happy path)", async () => {
      // Arrange
      const mockHint: Hint = {
        id: 1,
        title: "Daily Challenge",
        content: "Complete 5 circles today to earn bonus points!",
        active: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHint,
      });

      // Act
      const result = await HintsService.getActiveHint();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/hints/active",
        expect.objectContaining({
          cache: "no-store",
          headers: {
            Authorization: "Bearer mock-token-123",
          },
        })
      );
      expect(result).toEqual(mockHint);
      expect(result.active).toBe(true);
    });

    it("should get active hint with different content (happy path)", async () => {
      // Arrange
      const mockHint: Hint = {
        id: 2,
        title: "New Feature",
        content: "Check out the new map sharing feature!",
        active: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHint,
      });

      // Act
      const result = await HintsService.getActiveHint();

      // Assert
      expect(result).toEqual(mockHint);
      expect(result.title).toBe("New Feature");
    });

    it("should throw error when no active hint found (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Act & Assert
      await expect(HintsService.getActiveHint()).rejects.toThrow(
        "Failed to fetch active hint"
      );
    });

    it("should throw error when unauthorized (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // Act & Assert
      await expect(HintsService.getActiveHint()).rejects.toThrow(
        "Failed to fetch active hint"
      );
    });

    it("should throw error when server error occurs (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(HintsService.getActiveHint()).rejects.toThrow(
        "Failed to fetch active hint"
      );
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network connection failed")
      );

      // Act & Assert
      await expect(HintsService.getActiveHint()).rejects.toThrow(
        "Network connection failed"
      );
    });

    it("should handle timeout error (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Request timeout")
      );

      // Act & Assert
      await expect(HintsService.getActiveHint()).rejects.toThrow(
        "Request timeout"
      );
    });

    it("should handle malformed JSON response (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Unexpected token in JSON");
        },
      });

      // Act & Assert
      await expect(HintsService.getActiveHint()).rejects.toThrow(
        "Unexpected token in JSON"
      );
    });
  });
});
