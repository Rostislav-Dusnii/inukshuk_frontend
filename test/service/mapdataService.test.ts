import {
  getMapData,
  saveMapData,
  removeMapDataFromUser,
} from "@services/MapDataService";

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";

describe("MapDataService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("getMapData", () => {
    it("should get map data for user successfully (happy path)", async () => {
      // Arrange
      const userId = 1;
      const mockMapData = {
        circles: [
          {
            id: "circle-1",
            latitude: 50.8798,
            longitude: 4.7005,
            radius: 100,
          },
        ],
        zoom: 13,
        center: { lat: 50.8798, lng: 4.7005 },
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockMapData,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await getMapData(userId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/users/${userId}/mapdata`,
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
      const data = await result.json();
      expect(data).toEqual(mockMapData);
    });

    it("should get empty map data for new user (happy path)", async () => {
      // Arrange
      const userId = 1;

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ circles: [], zoom: 10, center: null }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await getMapData(userId);

      // Assert
      expect(result.ok).toBe(true);
      const data = await result.json();
      expect(data.circles).toEqual([]);
    });

    it("should return 404 when user not found (unhappy path)", async () => {
      // Arrange
      const userId = 999;

      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({ message: "User not found" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await getMapData(userId);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(404);
    });

    it("should handle server error (unhappy path)", async () => {
      // Arrange
      const userId = 1;

      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal server error" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await getMapData(userId);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(500);
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const userId = 1;

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(getMapData(userId)).rejects.toThrow("Network error");
    });
  });

  describe("saveMapData", () => {
    it("should save map data successfully (happy path)", async () => {
      // Arrange
      const userId = 1;
      const mapData = {
        circles: [
          {
            id: "circle-1",
            latitude: 50.8798,
            longitude: 4.7005,
            radius: 100,
          },
        ],
        zoom: 13,
        center: { lat: 50.8798, lng: 4.7005 },
      };

      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({ message: "Map data saved successfully" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await saveMapData(userId, mapData);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/users/${userId}/mapdata`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mapData),
        })
      );
      expect(result.ok).toBe(true);
      expect(result.status).toBe(201);
    });

    it("should update existing map data (happy path)", async () => {
      // Arrange
      const userId = 1;
      const updatedMapData = {
        circles: [
          {
            id: "circle-1",
            latitude: 50.8798,
            longitude: 4.7005,
            radius: 100,
          },
          {
            id: "circle-2",
            latitude: 50.8899,
            longitude: 4.7105,
            radius: 150,
          },
        ],
        zoom: 14,
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ message: "Map data updated" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await saveMapData(userId, updatedMapData);

      // Assert
      expect(result.ok).toBe(true);
    });

    it("should handle empty map data save (happy path)", async () => {
      // Arrange
      const userId = 1;
      const emptyMapData = {
        circles: [],
        zoom: 10,
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ message: "Map data saved" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await saveMapData(userId, emptyMapData);

      // Assert
      expect(result.ok).toBe(true);
    });

    it("should return 400 when invalid data provided (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const invalidMapData = { invalid: "data" };

      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({ message: "Invalid map data format" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await saveMapData(userId, invalidMapData);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it("should return 404 when user not found (unhappy path)", async () => {
      // Arrange
      const userId = 999;
      const mapData = { circles: [] };

      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({ message: "User not found" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await saveMapData(userId, mapData);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(404);
    });

    it("should handle server error (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const mapData = { circles: [] };

      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal server error" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await saveMapData(userId, mapData);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(500);
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const mapData = { circles: [] };

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network connection failed")
      );

      // Act & Assert
      await expect(saveMapData(userId, mapData)).rejects.toThrow(
        "Network connection failed"
      );
    });
  });

  describe("removeMapDataFromUser", () => {
    it("should remove map data successfully (happy path)", async () => {
      // Arrange
      const userId = 1;

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ message: "Map data removed successfully" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await removeMapDataFromUser(userId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/users/${userId}/mapdata`,
        expect.objectContaining({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });

    it("should handle no map data to remove (happy path)", async () => {
      // Arrange
      const userId = 1;

      const mockResponse = {
        ok: true,
        status: 204,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await removeMapDataFromUser(userId);

      // Assert
      expect(result.ok).toBe(true);
      expect(result.status).toBe(204);
    });

    it("should return 404 when user not found (unhappy path)", async () => {
      // Arrange
      const userId = 999;

      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({ message: "User not found" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await removeMapDataFromUser(userId);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(404);
    });

    it("should return 403 when not authorized (unhappy path)", async () => {
      // Arrange
      const userId = 2;

      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => ({ message: "Not authorized" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await removeMapDataFromUser(userId);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(403);
    });

    it("should handle server error (unhappy path)", async () => {
      // Arrange
      const userId = 1;

      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal server error" }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await removeMapDataFromUser(userId);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.status).toBe(500);
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const userId = 1;

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network timeout")
      );

      // Act & Assert
      await expect(removeMapDataFromUser(userId)).rejects.toThrow(
        "Network timeout"
      );
    });
  });
});
