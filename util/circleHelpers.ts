/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Helper function to update the inside status of a circle or polygon
 * @param circleId - The ID of the circle/polygon to update
 * @param newInsideValue - The new inside value (true/false)
 * @param circles - Array of circle objects
 * @param intersections - Array of intersection (polygon) objects
 * @param setCircles - State setter for circles
 * @param setIntersections - State setter for intersections
 */
export const updateCircleInside = (
    circleId: number,
    newInsideValue: boolean,
    circles: any[],
    intersections: any[],
    setCircles: React.Dispatch<React.SetStateAction<any[]>>,
    setIntersections: React.Dispatch<React.SetStateAction<any[]>>
) => {
    // Try to find in circles first
    const circleToUpdate = circles.find((c) => c.id === circleId);
    if (circleToUpdate) {
        setCircles((prev) => {
            return prev.map((circleObj) => {
                if (circleObj.id === circleId) {
                    // Update the Leaflet circle stroke color (no fill - unified layer handles fill)
                    circleObj.shape.setStyle({
                        color: newInsideValue ? "green" : "darkgrey",
                    });
                    // Return new object with updated inside value
                    return { ...circleObj, inside: newInsideValue };
                }
                return circleObj;
            });
        });
    } else {
        // Try to find in intersections (merged polygons)
        const intersectionToUpdate = intersections.find((i) => i.id === circleId);
        if (intersectionToUpdate) {
            setIntersections((prev) => {
                return prev.map((intersectionObj) => {
                    if (intersectionObj.id === circleId) {
                        // Update all polygon parts with new style
                        intersectionObj.polygons.forEach((polygon: any) => {
                            polygon.setStyle({
                                color: newInsideValue ? "green" : "darkgrey",
                                fillColor: newInsideValue ? "lightgreen" : "lightgrey",
                            });
                        });
                        // Return new object with updated inside value
                        return { ...intersectionObj, inside: newInsideValue };
                    }
                    return intersectionObj;
                });
            });
        }
    }
};

/**
 * Helper function to toggle the visibility of a circle or polygon
 * @param circleId - The ID of the circle/polygon to toggle
 * @param circles - Array of circle objects
 * @param intersections - Array of intersection (polygon) objects
 * @param setCircles - State setter for circles
 * @param setIntersections - State setter for intersections
 * @param leafletMap - The Leaflet map instance
 */
export const toggleCircleVisibility = (
    circleId: number,
    circles: any[],
    intersections: any[],
    setCircles: React.Dispatch<React.SetStateAction<any[]>>,
    setIntersections: React.Dispatch<React.SetStateAction<any[]>>,
    leafletMap: any
) => {
    if (!leafletMap) return;

    // Try to find in circles first
    const circleToToggle = circles.find((c) => c.id === circleId);
    if (circleToToggle) {
        setCircles((prev) => {
            return prev.map((circleObj) => {
                if (circleObj.id === circleId) {
                    const newVisible = !circleObj.visible;

                    // Show or hide the circle on the map
                    if (newVisible) {
                        circleObj.shape.addTo(leafletMap);
                    } else {
                        leafletMap.removeLayer(circleObj.shape);
                    }

                    // Return new object with updated visibility
                    return { ...circleObj, visible: newVisible };
                }
                return circleObj;
            });
        });
    } else {
        // Try to find in intersections (merged polygons)
        const intersectionToToggle = intersections.find((i) => i.id === circleId);
        if (intersectionToToggle) {
            setIntersections((prev) => {
                return prev.map((intersectionObj) => {
                    if (intersectionObj.id === circleId) {
                        const newVisible = !intersectionObj.visible;

                        // Show or hide all polygon parts on the map
                        intersectionObj.polygons.forEach((polygon: any) => {
                            if (newVisible) {
                                polygon.addTo(leafletMap);
                            } else {
                                leafletMap.removeLayer(polygon);
                            }
                        });

                        // Return new object with updated visibility
                        return { ...intersectionObj, visible: newVisible };
                    }
                    return intersectionObj;
                });
            });
        }
    }
};

/**
 * Helper function to calculate the appropriate zoom level based on circle radius
 * This ensures the circle fits nicely in the viewport when created or navigated to
 * @param radiusInMeters - The radius of the circle in meters
 * @returns The optimal zoom level for the given radius
 */
export const calculateZoomForRadius = (radiusInMeters: number): number => {
    // Approximate meters per pixel at zoom level 0 at the equator
    // At zoom 0, the world is 256 pixels wide, Earth's circumference is ~40,075,000 meters
    const metersPerPixelAtZoom0 = 40075000 / 256;

    // We want the circle diameter to take up about 60% of the viewport width
    // Assuming a typical viewport width of ~800 pixels, that's ~480 pixels for the diameter
    const desiredDiameterInPixels = 400;
    const diameterInMeters = radiusInMeters * 2;

    // Calculate zoom level: metersPerPixel = metersPerPixelAtZoom0 / (2^zoom)
    // Therefore: zoom = log2(metersPerPixelAtZoom0 * desiredDiameterInPixels / diameterInMeters)
    const zoom = Math.log2((metersPerPixelAtZoom0 * desiredDiameterInPixels) / diameterInMeters);

    // Clamp zoom between reasonable bounds (1-19)
    return Math.max(1, Math.min(19, Math.round(zoom)));
};

/**
 * Helper function to zoom to a specific shape on the map
 * @param shapeId - The ID of the shape to zoom to
 * @param circles - Array of circle objects
 * @param intersections - Array of intersection (polygon) objects
 * @param leafletMap - The Leaflet map instance
 */
export const zoomToShape = (
    shapeId: number,
    circles: any[],
    intersections: any[],
    leafletMap: any
) => {
    if (!leafletMap) return;

    // Try to find in circles first
    const circle = circles.find((c) => c.id === shapeId);
    if (circle) {
        const { lat, lng } = circle.shape.getLatLng();
        const currentZoom = leafletMap.getZoom();
        leafletMap.setView([lat, lng], Math.max(currentZoom, 15));
        return;
    }

    // Try to find in intersections (merged polygons)
    const intersection = intersections.find((i) => i.id === shapeId);
    if (intersection && intersection.polygons.length > 0) {
        // Get bounds of all polygons and fit map to those bounds
        const bounds = intersection.polygons[0].getBounds();
        intersection.polygons.forEach((polygon: any) => {
            bounds.extend(polygon.getBounds());
        });
        leafletMap.fitBounds(bounds, { padding: [50, 50] });
    }
};
