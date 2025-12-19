import { saveMapData, loadMapData } from "@services/MapPersistenceService";
import SaveServiceManager from "@util/save";

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe("MapPersistenceService", () => {
  let mockSaveServiceManager: jest.Mocked<SaveServiceManager>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock SaveServiceManager
    mockSaveServiceManager = {
      saveAll: jest.fn(),
      loadAll: jest.fn(),
    } as any;
  });

  describe("saveMapData", () => {
    it("should save map data successfully (happy path)", async () => {
      // Arrange
      const userId = 1;
      const circles = [
        {
          id: 1,
          shape: {},
          inside: true,
        },
      ];
      const intersections = [];
      const markersData = [{ id: 1, lat: 50.8798, lng: 4.7005 }];
      const currentCircleCount = 5;
      const earnedReward = false;

      mockSaveServiceManager.saveAll.mockResolvedValueOnce({
        status: "SUCCESS",
        message: "Data saved successfully",
      });

      // Act
      const result = await saveMapData(
        mockSaveServiceManager,
        userId,
        circles,
        intersections,
        markersData,
        currentCircleCount,
        earnedReward
      );

      // Assert
      expect(mockSaveServiceManager.saveAll).toHaveBeenCalledWith(
        userId,
        circles,
        intersections,
        markersData,
        currentCircleCount,
        earnedReward
      );
      expect(result.status).toBe("SUCCESS");
      expect(console.log).toHaveBeenCalledWith(
        "Map data auto-saved successfully"
      );
    });

    it("should save map data with multiple circles and intersections (happy path)", async () => {
      // Arrange
      const userId = 1;
      const circles = [
        { id: 1, shape: {}, inside: true },
        { id: 2, shape: {}, inside: false },
      ];
      const intersections = [{ id: 3, polygons: [], inside: true }];
      const markersData = [
        { id: 1, lat: 50.8798, lng: 4.7005 },
        { id: 2, lat: 50.8899, lng: 4.7105 },
      ];
      const currentCircleCount = 10;
      const earnedReward = true;

      mockSaveServiceManager.saveAll.mockResolvedValueOnce({
        status: "SUCCESS",
        message: "Data saved",
      });

      // Act
      const result = await saveMapData(
        mockSaveServiceManager,
        userId,
        circles,
        intersections,
        markersData,
        currentCircleCount,
        earnedReward
      );

      // Assert
      expect(result.status).toBe("SUCCESS");
      expect(console.log).toHaveBeenCalledWith(
        "Map data auto-saved successfully"
      );
    });

    it("should handle empty map data save (happy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];
      const markersData: any[] = [];
      const currentCircleCount = 0;
      const earnedReward = false;

      mockSaveServiceManager.saveAll.mockResolvedValueOnce({
        status: "SUCCESS",
        message: "Empty data saved",
      });

      // Act
      const result = await saveMapData(
        mockSaveServiceManager,
        userId,
        circles,
        intersections,
        markersData,
        currentCircleCount,
        earnedReward
      );

      // Assert
      expect(result.status).toBe("SUCCESS");
    });

    it("should return error when user not logged in (unhappy path)", async () => {
      // Arrange
      const userId = 0;
      const circles: any[] = [];
      const intersections: any[] = [];
      const markersData: any[] = [];
      const currentCircleCount = 0;
      const earnedReward = false;

      // Act
      const result = await saveMapData(
        mockSaveServiceManager,
        userId,
        circles,
        intersections,
        markersData,
        currentCircleCount,
        earnedReward
      );

      // Assert
      expect(mockSaveServiceManager.saveAll).not.toHaveBeenCalled();
      expect(result.status).toBe("ERROR");
      expect(result.message).toBe("User not logged in");
      expect(console.error).toHaveBeenCalledWith(
        "User not logged in, cannot save map data"
      );
    });

    it("should handle save failure from manager (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];
      const markersData: any[] = [];
      const currentCircleCount = 0;
      const earnedReward = false;

      mockSaveServiceManager.saveAll.mockResolvedValueOnce({
        status: "ERROR",
        message: "Database connection failed",
      });

      // Act
      const result = await saveMapData(
        mockSaveServiceManager,
        userId,
        circles,
        intersections,
        markersData,
        currentCircleCount,
        earnedReward
      );

      // Assert
      expect(result.status).toBe("ERROR");
      expect(console.error).toHaveBeenCalledWith(
        "Failed to auto-save map data: Database connection failed"
      );
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];
      const markersData: any[] = [];
      const currentCircleCount = 0;
      const earnedReward = false;

      mockSaveServiceManager.saveAll.mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        saveMapData(
          mockSaveServiceManager,
          userId,
          circles,
          intersections,
          markersData,
          currentCircleCount,
          earnedReward
        )
      ).rejects.toThrow("Network error");
    });
  });

  describe("loadMapData", () => {
    let mockL: any;
    let mockLeafletMap: any;
    let mockCircle: any;
    let mockPolygon: any;
    let setCircles: jest.Mock;
    let setIntersections: jest.Mock;
    let setMarkersData: jest.Mock;
    let setCurrentCircleCount: jest.Mock;
    let setNextId: jest.Mock;
    let setEarnedReward: jest.Mock;
    let setSelectedCircle: jest.Mock;
    let attachCircleListeners: jest.Mock;

    beforeEach(() => {
      // Mock Leaflet objects
      mockCircle = {
        addTo: jest.fn().mockReturnThis(),
        remove: jest.fn(),
        on: jest.fn(),
      };

      mockPolygon = {
        addTo: jest.fn().mockReturnThis(),
        remove: jest.fn(),
        on: jest.fn(),
      };

      mockL = {
        circle: jest.fn().mockReturnValue(mockCircle),
        polygon: jest.fn().mockReturnValue(mockPolygon),
      };

      mockLeafletMap = {};

      // Mock state setters
      setCircles = jest.fn();
      setIntersections = jest.fn();
      setMarkersData = jest.fn();
      setCurrentCircleCount = jest.fn();
      setNextId = jest.fn();
      setEarnedReward = jest.fn();
      setSelectedCircle = jest.fn();
      attachCircleListeners = jest.fn();
    });

    it("should load map data successfully (happy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      const mockGeoJSON = {
        features: [
          {
            type: "Feature",
            properties: {
              type: "circle",
              id: 1,
              inside: true,
              radius: 100,
              visible: true,
            },
            geometry: {
              type: "Point",
              coordinates: [4.7005, 50.8798],
            },
          },
          {
            type: "Feature",
            properties: {
              type: "marker",
              id: 2,
            },
            geometry: {
              type: "Point",
              coordinates: [4.7005, 50.8798],
            },
          },
        ],
      };

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: mockGeoJSON,
        circleCount: 5,
        earnedReward: false,
      });

      // Act
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle,
        attachCircleListeners
      );

      // Assert
      expect(mockSaveServiceManager.loadAll).toHaveBeenCalledWith(userId);
      expect(result.status).toBe("SUCCESS");
      expect(setCircles).toHaveBeenCalled();
      expect(setIntersections).toHaveBeenCalled();
      expect(setMarkersData).toHaveBeenCalled();
      expect(setCurrentCircleCount).toHaveBeenCalledWith(5);
      expect(setEarnedReward).toHaveBeenCalledWith(false);
      expect(setNextId).toHaveBeenCalledWith(3);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Map data auto-loaded:")
      );
    });

    it("should load map data with polygon (happy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      const mockGeoJSON = {
        features: [
          {
            type: "Feature",
            properties: {
              type: "polygon",
              id: 1,
              inside: true,
              visible: true,
            },
            geometry: {
              type: "MultiPolygon",
              coordinates: [
                [
                  [
                    [4.7, 50.87],
                    [4.71, 50.87],
                    [4.71, 50.88],
                    [4.7, 50.88],
                    [4.7, 50.87],
                  ],
                ],
              ],
            },
          },
        ],
      };

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: mockGeoJSON,
        circleCount: 0,
        earnedReward: false,
      });

      // Act
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle,
        attachCircleListeners
      );

      // Assert
      expect(result.status).toBe("SUCCESS");
      expect(mockL.polygon).toHaveBeenCalled();
      expect(mockPolygon.addTo).toHaveBeenCalledWith(mockLeafletMap);
    });

    it("should handle invisible circles and polygons (happy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      const mockGeoJSON = {
        features: [
          {
            type: "Feature",
            properties: {
              type: "circle",
              id: 1,
              inside: true,
              radius: 100,
              visible: false,
            },
            geometry: {
              type: "Point",
              coordinates: [4.7005, 50.8798],
            },
          },
        ],
      };

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: mockGeoJSON,
        circleCount: 0,
        earnedReward: false,
      });

      // Act
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle,
        attachCircleListeners
      );

      // Assert
      expect(result.status).toBe("SUCCESS");
      expect(mockCircle.addTo).not.toHaveBeenCalled();
    });

    it("should use fallback click listener for circles when attachCircleListeners is not provided", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      const mockGeoJSON = {
        features: [
          {
            type: "Feature",
            properties: {
              type: "circle",
              id: 1,
              inside: true,
              radius: 100,
              visible: true,
            },
            geometry: {
              type: "Point",
              coordinates: [4.7005, 50.8798],
            },
          },
        ],
      };

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: mockGeoJSON,
        circleCount: 1,
        earnedReward: false,
      });

      // Act - WITHOUT attachCircleListeners parameter
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
        // Note: no attachCircleListeners
      );

      // Assert
      expect(result.status).toBe("SUCCESS");
      expect(mockCircle.on).toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("should use fallback click listener for polygons when attachCircleListeners is not provided", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      const mockGeoJSON = {
        features: [
          {
            type: "Feature",
            properties: {
              type: "polygon",
              id: 2,
              inside: false,
              visible: true,
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [
                    [4.7005, 50.8798],
                    [4.7105, 50.8798],
                    [4.7105, 50.8898],
                    [4.7005, 50.8898],
                    [4.7005, 50.8798],
                  ],
                ],
              ],
            },
          },
        ],
      };

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: mockGeoJSON,
        circleCount: 1,
        earnedReward: false,
      });

      // Act - WITHOUT attachCircleListeners parameter
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
        // Note: no attachCircleListeners
      );

      // Assert
      expect(result.status).toBe("SUCCESS");
      expect(mockPolygon.on).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });

    it("should invoke setSelectedCircle when circle fallback click is triggered", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      const mockGeoJSON = {
        features: [
          {
            type: "Feature",
            properties: {
              type: "circle",
              id: 1,
              inside: true,
              radius: 100,
              visible: true,
            },
            geometry: {
              type: "Point",
              coordinates: [4.7005, 50.8798],
            },
          },
        ],
      };

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: mockGeoJSON,
        circleCount: 1,
        earnedReward: false,
      });

      // Act - WITHOUT attachCircleListeners parameter
      await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
      );

      // Get the click handler that was registered
      const clickHandler = mockCircle.on.mock.calls.find(
        (call) => call[0] === "click"
      )?.[1];

      expect(clickHandler).toBeDefined();

      // Trigger the click handler
      clickHandler();

      // Assert setSelectedCircle was called
      expect(setSelectedCircle).toHaveBeenCalledWith(1);
    });

    it("should invoke setSelectedCircle when polygon fallback click is triggered", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      const mockGeoJSON = {
        features: [
          {
            type: "Feature",
            properties: {
              type: "polygon",
              id: 2,
              inside: false,
              visible: true,
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [
                    [4.7005, 50.8798],
                    [4.7105, 50.8798],
                    [4.7105, 50.8898],
                    [4.7005, 50.8898],
                    [4.7005, 50.8798],
                  ],
                ],
              ],
            },
          },
        ],
      };

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: mockGeoJSON,
        circleCount: 1,
        earnedReward: false,
      });

      // Act - WITHOUT attachCircleListeners parameter
      await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
      );

      // Get the click handler that was registered
      const clickHandler = mockPolygon.on.mock.calls.find(
        (call) => call[0] === "click"
      )?.[1];

      expect(clickHandler).toBeDefined();

      // Trigger the click handler
      clickHandler();

      // Assert setSelectedCircle was called
      expect(setSelectedCircle).toHaveBeenCalledWith(2);
    });

    it("should clear existing map data before loading (happy path)", async () => {
      // Arrange
      const userId = 1;
      const existingCircle = { shape: { remove: jest.fn() }, id: 1 };
      const existingIntersection = {
        polygons: [{ remove: jest.fn() }],
        id: 2,
      };
      const circles = [existingCircle];
      const intersections = [existingIntersection];

      const mockGeoJSON = {
        features: [],
      };

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: mockGeoJSON,
        circleCount: 0,
        earnedReward: false,
      });

      // Act
      await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
      );

      // Assert
      expect(existingCircle.shape.remove).toHaveBeenCalled();
      expect(existingIntersection.polygons[0].remove).toHaveBeenCalled();
    });

    it("should return error when user not logged in (unhappy path)", async () => {
      // Arrange
      const userId = 0;
      const circles: any[] = [];
      const intersections: any[] = [];

      // Act
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
      );

      // Assert
      expect(mockSaveServiceManager.loadAll).not.toHaveBeenCalled();
      expect(result.status).toBe("ERROR");
      expect(result.message).toBe("User not logged in");
      expect(console.error).toHaveBeenCalledWith(
        "User not logged in, cannot load map data!"
      );
    });

    it("should return error when map not ready (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      // Act
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        null,
        null,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
      );

      // Assert
      expect(result.status).toBe("ERROR");
      expect(result.message).toBe("Map not ready");
    });

    it("should handle load failure from manager (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "ERROR",
        message: "Data not found",
      });

      // Act
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
      );

      // Assert
      expect(result.status).toBe("ERROR");
      expect(console.error).toHaveBeenCalledWith(
        "Failed to load map data: Data not found"
      );
    });

    it("should handle load with no data (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      mockSaveServiceManager.loadAll.mockResolvedValueOnce({
        status: "SUCCESS",
        data: null,
        circleCount: 0,
        earnedReward: false,
      });

      // Act
      const result = await loadMapData(
        mockSaveServiceManager,
        userId,
        mockL,
        mockLeafletMap,
        circles,
        intersections,
        setCircles,
        setIntersections,
        setMarkersData,
        setCurrentCircleCount,
        setNextId,
        setEarnedReward,
        setSelectedCircle
      );

      // Assert
      expect(result.status).toBe("SUCCESS");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to load map data:")
      );
    });

    it("should handle network error (unhappy path)", async () => {
      // Arrange
      const userId = 1;
      const circles: any[] = [];
      const intersections: any[] = [];

      mockSaveServiceManager.loadAll.mockRejectedValueOnce(
        new Error("Network error")
      );

      // Act & Assert
      await expect(
        loadMapData(
          mockSaveServiceManager,
          userId,
          mockL,
          mockLeafletMap,
          circles,
          intersections,
          setCircles,
          setIntersections,
          setMarkersData,
          setCurrentCircleCount,
          setNextId,
          setEarnedReward,
          setSelectedCircle
        )
      ).rejects.toThrow("Network error");
    });
  });
});
