import { getMapData, saveMapData } from "@services/MapDataService";

/**
 * Service manager for saving and loading map data
 */
class SaveServiceManager {
    /** Save circles to GeoJSON features
     */
    private saveCircles = (circles: any[]) => {
        const features: any[] = [];
        circles.forEach((circleObj) => {
            const { lat, lng }: { lat: number; lng: number } = circleObj.shape.getLatLng();
            const radius: number = circleObj.shape.getRadius();

            features.push({
                type: "Feature",
                properties: {
                    type: "circle",
                    id: circleObj.id,
                    inside: circleObj.inside,
                    radius: radius,
                    visible: circleObj.visible !== undefined ? circleObj.visible : true,
                },
                geometry: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
            });
        });
        return features;
    }

    /** Save intersections/polygons to GeoJSON features
     */
    private saveIntersections = (intersections: any[]) => {
        const features: any[] = [];
        intersections.forEach((intersectionObj) => {
            const coordinates = intersectionObj.shape; // [lng, lat] format

            features.push({
                type: "Feature",
                properties: {
                    type: "polygon",
                    id: intersectionObj.id,
                    inside: intersectionObj.inside,
                    visible: intersectionObj.visible !== undefined ? intersectionObj.visible : true,
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: coordinates,
                },
            });
        });
        return features;
    }

    /**
     * Save markers to GeoJSON features
     */
    private saveMarkers = (markers: { id: number; lat: number; lng: number }[]) => {
        const features: any[] = [];

        markers.forEach((marker) => {
            features.push({
                type: "Feature",
                properties: {
                    type: "marker",
                    id: marker.id,
                },
                geometry: {
                    type: "Point",
                    coordinates: [marker.lng, marker.lat],
                },
            });
        });
        return features;
    }

    /**
     * Save all map data (circles, intersections, markers) to user using its UserID
     * @param userId the users identifier e.g. userId: number
     * @param circles the circles data to save
     * @param intersections the intersections data to save
     * @param markers the markers data to save
     * @param circleCount the total count of circles created
     * @param earnedReward whether the user has earned the reward
     * @returns Object with status and message
     */
    saveAll = async (userId: number, circles: any[], intersections: any[], markers: { id: number; lat: number; lng: number }[], circleCount: number, earnedReward: boolean) => {
        try {
            const features = [
                ...this.saveCircles(circles),
                ...this.saveIntersections(intersections),
                ...this.saveMarkers(markers),
            ];

            const geoJSON = {
                type: "FeatureCollection",
                metadata: {
                    circleCount: circleCount,
                    earnedReward: earnedReward,
                },
                features: features,
            };

            const response = await saveMapData(userId, geoJSON);

            if (!response.ok) {
                throw new Error(`Failed to save map data: ${response.statusText}`);
            }

            return { status: "SUCCESS", message: `Map data for user with ID ${userId} saved successfully` };
        } catch (error) {
            return { status: "FAILURE", message: `Failed to save map data for user with ID ${userId}, Error message: ${error.message}` };
        }
    }

    loadAll = async (userId: number) => {
        try {
            const response = await getMapData(userId);

            if (!response.ok) {
                throw new Error(`Failed to load map data: ${response.statusText}`);
            }

            const content = await response.json();

            const geoJSONAsString: String = content.message;
            let geoJSON: any;

            // Parse geoJSON
            if (typeof geoJSONAsString === "string") {
                try {
                    geoJSON = JSON.parse(geoJSONAsString);
                } catch (e) {
                    throw new Error("Invalid GeoJSON JSON string");
                }
            }

            if (!geoJSON || geoJSON.type !== "FeatureCollection") {
                throw new Error("Invalid GeoJSON format");
            }

            const circleCount = geoJSON.metadata?.circleCount || 0;
            const earnedReward = geoJSON.metadata?.earnedReward || false;

            return { status: "SUCCESS", data: geoJSON, circleCount: circleCount, earnedReward: earnedReward };
        } catch (error) {
            return { status: "FAILURE", message: `Failed to load map data, Error message: ${error.message}` };
        }
    }
}

export default SaveServiceManager;