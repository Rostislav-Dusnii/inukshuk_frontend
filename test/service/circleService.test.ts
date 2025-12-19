import CircleService from "@services/CircleService";
import {
  CircleShareRequest,
  CircleShareResponse,
  SharedCircleDTO,
  AcceptedCircleShareDTO,
} from "@types";

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";

describe("CircleService", () => {
  const mockToken = "mock-token-123";

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("shareCircles", () => {
    it("should share circles successfully (happy path)", async () => {
      // Arrange
      const circles: CircleShareRequest = {
        circles: [
          {
            latitude: 50.8798,
            longitude: 4.7005,
            radius: 100,
            isInside: false,
          },
        ],
      };

      const mockResponse: CircleShareResponse = {
        shareId: "share-123",
        shareUrl: "http://localhost:8080/shared-circles/share-123",
        message: "Circles shared successfully",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await CircleService.shareCircles(circles, mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/circles/share",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
          body: JSON.stringify(circles),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when receiver not found (unhappy path)", async () => {
      // Arrange
      const circles: CircleShareRequest = {
        circles: [
          {
            latitude: 50.8798,
            longitude: 4.7005,
            radius: 100,
            isInside: false,
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "User not found" }),
      });

      // Act & Assert
      await expect(
        CircleService.shareCircles(circles, mockToken)
      ).rejects.toThrow("User not found");
    });

    it("should throw error on network failure (unhappy path)", async () => {
      // Arrange
      const circles: CircleShareRequest = {
        circles: [],
      };

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Connection refused")
      );

      // Act & Assert
      await expect(
        CircleService.shareCircles(circles, mockToken)
      ).rejects.toThrow("Connection refused");
    });

    it("should handle unauthorized request (unhappy path)", async () => {
      // Arrange
      const circles: CircleShareRequest = {
        circles: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ errorMessage: "Unauthorized" }),
      });

      // Act & Assert
      await expect(
        CircleService.shareCircles(circles, mockToken)
      ).rejects.toThrow("Unauthorized");
    });

    it("should handle network error without message (unhappy path)", async () => {
      // Arrange
      const circles: CircleShareRequest = {
        circles: [],
      };

      // Mock a network error without a message property
      (global.fetch as jest.Mock).mockRejectedValueOnce({
        name: "NetworkError",
        // No message property
      });

      // Act & Assert
      await expect(
        CircleService.shareCircles(circles, mockToken)
      ).rejects.toThrow(
        "Network error: Unable to connect to server. Please check if the backend is running."
      );
    });

    it("should handle response.json() failure and use status fallback (unhappy path)", async () => {
      // Arrange
      const circles: CircleShareRequest = {
        circles: [],
      };

      // Mock response where json() throws an error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act & Assert
      await expect(
        CircleService.shareCircles(circles, mockToken)
      ).rejects.toThrow("Server error: 500");
    });
  });

  describe("getSharedCircles", () => {
    it("should get shared circles successfully (happy path)", async () => {
      // Arrange
      const shareId = "share-123";
      const mockCircles: SharedCircleDTO[] = [
        {
          id: 1,
          latitude: 50.8798,
          longitude: 4.7005,
          radius: 100,
          isInside: false,
          ownerUsername: "user1",
          createdAt: new Date().toISOString(),
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCircles,
      });

      // Act
      const result = await CircleService.getSharedCircles(shareId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/circles/shared/${shareId}`,
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
      expect(result).toEqual(mockCircles);
    });

    it("should throw error when share not found (unhappy path)", async () => {
      // Arrange
      const shareId = "invalid-share-id";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Shared circles not found" }),
      });

      // Act & Assert
      await expect(CircleService.getSharedCircles(shareId)).rejects.toThrow(
        "Shared circles not found"
      );
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network timeout")
      );

      // Act & Assert
      await expect(CircleService.getSharedCircles(shareId)).rejects.toThrow(
        "Network timeout"
      );
    });

    it("should handle network error without message (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockRejectedValueOnce({
        name: "NetworkError",
      });

      // Act & Assert
      await expect(CircleService.getSharedCircles(shareId)).rejects.toThrow(
        "Network error: Unable to connect to server"
      );
    });

    it("should handle response.json() failure and use status fallback (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act & Assert
      await expect(CircleService.getSharedCircles(shareId)).rejects.toThrow(
        "Shared circles not found"
      );
    });
  });

  describe("getMySharedCircles", () => {
    it("should get my shared circles successfully (happy path)", async () => {
      // Arrange
      const mockCircles: SharedCircleDTO[] = [
        {
          id: 1,
          latitude: 50.8798,
          longitude: 4.7005,
          radius: 100,
          isInside: false,
          ownerUsername: "user1",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          latitude: 50.8899,
          longitude: 4.7105,
          radius: 150,
          isInside: false,
          ownerUsername: "user1",
          createdAt: new Date().toISOString(),
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCircles,
      });

      // Act
      const result = await CircleService.getMySharedCircles(mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/circles/my-shared",
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockCircles);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no shared circles (happy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Act
      const result = await CircleService.getMySharedCircles(mockToken);

      // Assert
      expect(result).toEqual([]);
    });

    it("should throw error when unauthorized (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      // Act & Assert
      await expect(CircleService.getMySharedCircles(mockToken)).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Timeout"));

      // Act & Assert
      await expect(CircleService.getMySharedCircles(mockToken)).rejects.toThrow(
        "Timeout"
      );
    });

    it("should handle network error without message (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce({
        name: "NetworkError",
      });

      // Act & Assert
      await expect(CircleService.getMySharedCircles(mockToken)).rejects.toThrow(
        "Network error: Unable to connect to server"
      );
    });

    it("should handle response.json() failure and use status fallback (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act & Assert
      await expect(CircleService.getMySharedCircles(mockToken)).rejects.toThrow(
        "Failed to retrieve shared circles"
      );
    });
  });

  describe("acceptSharedCircles", () => {
    it("should accept shared circles successfully (happy path)", async () => {
      // Arrange
      const shareId = "share-123";
      const mockResponse: AcceptedCircleShareDTO = {
        id: 1,
        shareId: shareId,
        ownerUsername: "user1",
        circles: [],
        visible: true,
        acceptedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await CircleService.acceptSharedCircles(
        shareId,
        mockToken
      );

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/circles/accept/${shareId}`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when share not found (unhappy path)", async () => {
      // Arrange
      const shareId = "invalid-id";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Share not found" }),
      });

      // Act & Assert
      await expect(
        CircleService.acceptSharedCircles(shareId, mockToken)
      ).rejects.toThrow("Share not found");
    });

    it("should throw error when already accepted (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ errorMessage: "Already accepted" }),
      });

      // Act & Assert
      await expect(
        CircleService.acceptSharedCircles(shareId, mockToken)
      ).rejects.toThrow("Already accepted");
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Connection lost")
      );

      // Act & Assert
      await expect(
        CircleService.acceptSharedCircles(shareId, mockToken)
      ).rejects.toThrow("Connection lost");
    });

    it("should handle network error without message (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockRejectedValueOnce({
        name: "NetworkError",
      });

      // Act & Assert
      await expect(
        CircleService.acceptSharedCircles(shareId, mockToken)
      ).rejects.toThrow("Network error: Unable to connect to server");
    });

    it("should handle response.json() failure and use status fallback (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act & Assert
      await expect(
        CircleService.acceptSharedCircles(shareId, mockToken)
      ).rejects.toThrow("Failed to accept circles");
    });
  });

  describe("getAcceptedCircleShares", () => {
    it("should get accepted circle shares successfully (happy path)", async () => {
      // Arrange
      const mockShares: AcceptedCircleShareDTO[] = [
        {
          id: 1,
          shareId: "share-1",
          ownerUsername: "user1",
          circles: [],
          visible: true,
          acceptedAt: new Date().toISOString(),
        },
        {
          id: 2,
          shareId: "share-2",
          ownerUsername: "user2",
          circles: [],
          visible: false,
          acceptedAt: new Date().toISOString(),
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockShares,
      });

      // Act
      const result = await CircleService.getAcceptedCircleShares(mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/circles/accepted",
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockShares);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no accepted shares (happy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Act
      const result = await CircleService.getAcceptedCircleShares(mockToken);

      // Assert
      expect(result).toEqual([]);
    });

    it("should throw error when unauthorized (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      // Act & Assert
      await expect(
        CircleService.getAcceptedCircleShares(mockToken)
      ).rejects.toThrow("Unauthorized");
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        CircleService.getAcceptedCircleShares(mockToken)
      ).rejects.toThrow("Network error");
    });

    it("should handle network error without message (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce({
        name: "NetworkError",
      });

      // Act & Assert
      await expect(
        CircleService.getAcceptedCircleShares(mockToken)
      ).rejects.toThrow("Network error: Unable to connect to server");
    });

    it("should handle response.json() failure and use status fallback (unhappy path)", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act & Assert
      await expect(
        CircleService.getAcceptedCircleShares(mockToken)
      ).rejects.toThrow("Failed to get accepted circles");
    });
  });

  describe("toggleAcceptedShareVisibility", () => {
    it("should toggle visibility successfully (happy path)", async () => {
      // Arrange
      const shareId = "accepted-1";
      const mockResponse: AcceptedCircleShareDTO = {
        id: 1,
        shareId: "share-1",
        ownerUsername: "user1",
        circles: [],
        visible: false,
        acceptedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await CircleService.toggleAcceptedShareVisibility(
        shareId,
        mockToken
      );

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/circles/accepted/${shareId}/toggle-visibility`,
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toEqual(mockResponse);
      expect(result.visible).toBe(false);
    });

    it("should throw error when share not found (unhappy path)", async () => {
      // Arrange
      const shareId = "invalid-id";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Share not found" }),
      });

      // Act & Assert
      await expect(
        CircleService.toggleAcceptedShareVisibility(shareId, mockToken)
      ).rejects.toThrow("Share not found");
    });

    it("should handle unauthorized request (unhappy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ errorMessage: "Forbidden" }),
      });

      // Act & Assert
      await expect(
        CircleService.toggleAcceptedShareVisibility(shareId, mockToken)
      ).rejects.toThrow("Forbidden");
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network timeout")
      );

      // Act & Assert
      await expect(
        CircleService.toggleAcceptedShareVisibility(shareId, mockToken)
      ).rejects.toThrow("Network timeout");
    });

    it("should handle network error without message (unhappy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockRejectedValueOnce({
        name: "NetworkError",
      });

      // Act & Assert
      await expect(
        CircleService.toggleAcceptedShareVisibility(shareId, mockToken)
      ).rejects.toThrow("Network error: Unable to connect to server");
    });

    it("should handle response.json() failure and use status fallback (unhappy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act & Assert
      await expect(
        CircleService.toggleAcceptedShareVisibility(shareId, mockToken)
      ).rejects.toThrow("Failed to toggle visibility");
    });
  });

  describe("removeAcceptedCircleShare", () => {
    it("should remove accepted share successfully (happy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      // Act
      await CircleService.removeAcceptedCircleShare(shareId, mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/circles/accepted/${shareId}`,
        expect.objectContaining({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
    });

    it("should throw error when share not found (unhappy path)", async () => {
      // Arrange
      const shareId = "invalid-id";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Share not found" }),
      });

      // Act & Assert
      await expect(
        CircleService.removeAcceptedCircleShare(shareId, mockToken)
      ).rejects.toThrow("Share not found");
    });

    it("should handle unauthorized request (unhappy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ errorMessage: "Forbidden" }),
      });

      // Act & Assert
      await expect(
        CircleService.removeAcceptedCircleShare(shareId, mockToken)
      ).rejects.toThrow("Forbidden");
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Connection failed")
      );

      // Act & Assert
      await expect(
        CircleService.removeAcceptedCircleShare(shareId, mockToken)
      ).rejects.toThrow("Connection failed");
    });

    it("should handle network error without message (unhappy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockRejectedValueOnce({
        name: "NetworkError",
      });

      // Act & Assert
      await expect(
        CircleService.removeAcceptedCircleShare(shareId, mockToken)
      ).rejects.toThrow("Network error: Unable to connect to server");
    });

    it("should handle response.json() failure and use status fallback (unhappy path)", async () => {
      // Arrange
      const shareId = "accepted-1";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act & Assert
      await expect(
        CircleService.removeAcceptedCircleShare(shareId, mockToken)
      ).rejects.toThrow("Failed to remove accepted share");
    });
  });

  describe("getSharePreview", () => {
    it("should get share preview successfully (happy path)", async () => {
      // Arrange
      const shareId = "share-123";
      const mockPreview: AcceptedCircleShareDTO = {
        id: null,
        shareId: shareId,
        ownerUsername: "user1",
        circles: [
          {
            id: 1,
            latitude: 50.8798,
            longitude: 4.7005,
            radius: 100,
            isInside: false,
            ownerUsername: "user1",
            createdAt: new Date().toISOString(),
          },
        ],
        visible: true,
        acceptedAt: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPreview,
      });

      // Act
      const result = await CircleService.getSharePreview(shareId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/circles/preview/${shareId}`,
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
      expect(result).toEqual(mockPreview);
    });

    it("should throw error when share not found (unhappy path)", async () => {
      // Arrange
      const shareId = "invalid-id";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Shared circles not found" }),
      });

      // Act & Assert
      await expect(CircleService.getSharePreview(shareId)).rejects.toThrow(
        "Shared circles not found"
      );
    });

    it("should handle expired share (unhappy path)", async () => {
      // Arrange
      const shareId = "expired-share";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 410,
        json: async () => ({ errorMessage: "Share has expired" }),
      });

      // Act & Assert
      await expect(CircleService.getSharePreview(shareId)).rejects.toThrow(
        "Share has expired"
      );
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network timeout")
      );

      // Act & Assert
      await expect(CircleService.getSharePreview(shareId)).rejects.toThrow(
        "Network timeout"
      );
    });

    it("should handle network error without message (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockRejectedValueOnce({
        name: "NetworkError",
      });

      // Act & Assert
      await expect(CircleService.getSharePreview(shareId)).rejects.toThrow(
        "Network error: Unable to connect to server"
      );
    });

    it("should handle response.json() failure and use status fallback (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 410,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act & Assert
      await expect(CircleService.getSharePreview(shareId)).rejects.toThrow(
        "Shared circles not found"
      );
    });
  });

  describe("checkAcceptedShare", () => {
    it("should return true when share is accepted (happy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accepted: true }),
      });

      // Act
      const result = await CircleService.checkAcceptedShare(shareId, mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/circles/accepted/${shareId}/check`,
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
      expect(result).toBe(true);
    });

    it("should return false when share is not accepted (happy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accepted: false }),
      });

      // Act
      const result = await CircleService.checkAcceptedShare(shareId, mockToken);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when request fails (unhappy path)", async () => {
      // Arrange
      const shareId = "invalid-id";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Act
      const result = await CircleService.checkAcceptedShare(shareId, mockToken);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false on network error (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act
      const result = await CircleService.checkAcceptedShare(shareId, mockToken);

      // Assert
      expect(result).toBe(false);
    });

    it("should handle response.json() failure (unhappy path)", async () => {
      // Arrange
      const shareId = "share-123";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      // Act
      const result = await CircleService.checkAcceptedShare(shareId, mockToken);

      // Assert
      expect(result).toBe(false);
    });
  });
});
