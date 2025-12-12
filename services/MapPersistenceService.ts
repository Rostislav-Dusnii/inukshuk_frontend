import SaveServiceManager from "@util/save";

/**
 * Save all map data (circles, intersections, markers) to the backend
 * @param saveServiceManager - Instance of SaveServiceManager
 * @param userId - User ID for saving data
 * @param circles - Array of circle objects
 * @param intersections - Array of intersection objects
 * @param markersData - Array of marker data
 * @param currentCircleCount - Current circle count
 * @param earnedReward - Whether reward has been earned
 * @returns Promise with save result
 */
export const saveMapData = async (
    saveServiceManager: SaveServiceManager,
    userId: number,
    circles: any[],
    intersections: any[],
    markersData: { id: number; lat: number; lng: number }[],
    currentCircleCount: number,
    earnedReward: boolean
) => {
    if (!userId) {
        console.error("User not logged in, cannot save map data");
        return { status: "ERROR", message: "User not logged in" };
    }

    const result = await saveServiceManager.saveAll(
        userId,
        circles,
        intersections,
        markersData,
        currentCircleCount,
        earnedReward
    );

    if (result.status === "SUCCESS") {
        console.log("Map data auto-saved successfully");
    } else {
        console.error(`Failed to auto-save map data: ${result.message}`);
    }

    return result;
};

/**
 * Load all map data from the backend and restore it on the map
 * @param saveServiceManager - Instance of SaveServiceManager
 * @param userId - User ID for loading data
 * @param L - Leaflet library instance
 * @param leafletMap - Leaflet map instance
 * @param circles - Current circles array
 * @param intersections - Current intersections array
 * @param setCircles - State setter for circles
 * @param setIntersections - State setter for intersections
 * @param setMarkersData - State setter for markers
 * @param setCurrentCircleCount - State setter for circle count
 * @param setNextId - State setter for next ID
 * @param setEarnedReward - State setter for earned reward
 * @returns Promise with load result
 */
export const loadMapData = async (
    saveServiceManager: SaveServiceManager,
    userId: number,
    L: any,
    leafletMap: any,
    circles: any[],
    intersections: any[],
    setCircles: (circles: any[]) => void,
    setIntersections: (intersections: any[]) => void,
    setMarkersData: (markers: { id: number; lat: number; lng: number }[]) => void,
    setCurrentCircleCount: (count: number) => void,
    setNextId: (id: number) => void,
    setEarnedReward: (earned: boolean) => void,
    setSelectedCircle: (id: number | null) => void,
    attachCircleListeners?: (circle: any, id: number, L: any) => void
) => {
    if (!userId) {
        console.error("User not logged in, cannot load map data!");
        return { status: "ERROR", message: "User not logged in" };
    }

    if (!L || !leafletMap) {
        return { status: "ERROR", message: "Map not ready" };
    }

    const result = await saveServiceManager.loadAll(userId);

    if (result.status !== "SUCCESS" || !result.data) {
        console.error(`Failed to load map data: ${result.message}`);
        return result;
    }

    const geoJSON = result.data;
    const savedCircleCount = result.circleCount || 0;
    const savedEarnedReward = result.earnedReward || false;

    // Clear existing map data
    circles.forEach((circleObj) => circleObj.shape.remove());
    intersections.forEach((intersectionObj) => {
        intersectionObj.polygons.forEach((poly: any) => poly.remove());
    });
    setCircles([]);
    setIntersections([]);
    setMarkersData([]);
    setCurrentCircleCount(savedCircleCount);

    let maxId = 0;
    const newCircles: any[] = [];
    const newIntersections: any[] = [];
    const newMarkers: { id: number; lat: number; lng: number }[] = [];

    // Process each feature
    geoJSON.features.forEach((feature: any) => {
        const { type, id, inside, radius, visible } = feature.properties;
        maxId = Math.max(maxId, id || 0);

        if (type === "circle") {
            // Recreate circle
            const [lng, lat] = feature.geometry.coordinates;
            const circle = L.circle([lat, lng], {
                color: inside ? "green" : "darkgrey",
                fillColor: inside ? "lightgreen" : "lightgrey",
                fillOpacity: 0.4,
                radius: radius,
            });

            // Only add to map if visible (default to true if not specified)
            const isVisible = visible !== undefined ? visible : true;
            if (isVisible) {
                circle.addTo(leafletMap);
            }

            // Attach event listeners if function provided
            if (attachCircleListeners) {
                attachCircleListeners(circle, id, L);
            } else {
                // Fallback: basic click listener
                circle.on("click", () => {
                    setSelectedCircle(id);
                });
            }

            newCircles.push({ shape: circle, id, inside, visible: isVisible });
        } else if (type === "polygon") {
            // Recreate polygon/intersection
            const coordinates = feature.geometry.coordinates;
            const polygons: any[] = [];

            // Only add to map if visible (default to true if not specified)
            const isVisible = visible !== undefined ? visible : true;

            coordinates.forEach((multiPolygon: any) => {
                const allRings = multiPolygon.map((ring: any) =>
                    ring.map(([lng, lat]: [number, number]) => [lat, lng])
                );

                const polygon = L.polygon(allRings, {
                    color: inside ? "green" : "darkgrey",
                    fillColor: inside ? "lightgreen" : "lightgrey",
                    fillOpacity: 0.4,
                });

                // Only add to map if visible
                if (isVisible) {
                    polygon.addTo(leafletMap);
                }

                // Attach event listeners to loaded polygons
                if (attachCircleListeners) {
                    attachCircleListeners(polygon, id, L);
                } else {
                    // Fallback: basic click listener
                    polygon.on("click", () => {
                        setSelectedCircle(id);
                    });
                }

                polygons.push(polygon);
            });

            newIntersections.push({
                shape: coordinates,
                polygons: polygons,
                id: id,
                inside: inside,
                visible: isVisible,
            });
        } else if (type === "marker") {
            // Add marker data (MapClickHandler)
            const [lng, lat] = feature.geometry.coordinates;
            newMarkers.push({ id, lat, lng });
        }
    });

    // Update state
    setCircles(newCircles);
    setIntersections(newIntersections);
    setMarkersData(newMarkers);
    setNextId(maxId + 1);
    setEarnedReward(savedEarnedReward);

    console.log(
        `Map data auto-loaded: ${newCircles.length} circles, ${newIntersections.length} polygons, ${newMarkers.length} markers`
    );

    return result;
};
