import * as pc from "polygon-clipping";

/**
 * Convert a Leaflet circle to a polygon represented as coordinate array
 * @param circle - Leaflet circle object
 * @param steps - Number of steps for polygon approximation (default 64)
 * @returns Array of [longitude, latitude] coordinates
 */
export const circleToPolygon = (circle: any, steps = 64) => {
    const { lat, lng } = circle.getLatLng();
    const r = circle.getRadius(); // in meters
    const coords = [];

    // Convert latitude to radians for accurate calculation
    const latRad = (lat * Math.PI) / 180;

    // More accurate conversion factors accounting for Earth's curvature
    const metersPerDegreeLat = 111320; // Fairly constant
    const metersPerDegreeLng = 111320 * Math.cos(latRad); // Varies with latitude

    for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        coords.push([
            lng + (r / metersPerDegreeLng) * Math.cos(angle), // longitude (x)
            lat + (r / metersPerDegreeLat) * Math.sin(angle), // latitude (y)
        ]);
    }

    // Close the polygon by adding the first point at the end
    coords.push(coords[0]);

    return coords; // Return raw coordinates, not Leaflet polygon
};

/**
 * Convert polygon coordinates to a Leaflet polygon and add it to the map
 * @param L - Leaflet library instance
 * @param leafletMap - Leaflet map instance
 * @param coordPoints - Polygon coordinates
 * @param inside - Whether the polygon is inside the focus area
 * @param id - Unique ID for the polygon
 * @param setIntersections - State setter for intersections
 * @param attachListeners - Optional callback to attach event listeners to the polygon
 */
export const convertPolyIntoShapeAndAddToMap = (
    L: any,
    leafletMap: any,
    coordPoints: any,
    inside: boolean,
    id: number,
    setIntersections: (fn: (prev: any[]) => any[]) => void,
    attachListeners?: (polygon: any, id: number, L: any) => void
) => {
    const polygons: any[] = [];

    coordPoints.forEach((multiPolygon: any) => {
        // Convert all rings (outer + holes)
        const allRings = multiPolygon.map((ring: any) =>
            ring.map(([lng, lat]: [number, number]) => [lat, lng])
        );

        const polygon = L.polygon(allRings, {
            color: inside ? "green" : "darkgrey",
            fillColor: inside ? "lightgreen" : "lightgrey",
            fillOpacity: 0.4,
        }).addTo(leafletMap);

        // Attach event listeners if provided
        if (attachListeners) {
            attachListeners(polygon, id, L);
            console.log(`Attached listeners to polygon with ID: ${id}`);
        }

        polygons.push(polygon);
    });

    // Add to intersections list
    setIntersections((prev) => [
        ...prev,
        {
            shape: coordPoints,
            polygons: polygons,
            id: id,
            inside: inside,
            visible: true,
        },
    ]);
};

/**
 * Remove shapes from the map and state
 * @param shape1 - First shape to remove
 * @param shape2 - Second shape to remove
 * @param setCircles - State setter for circles
 * @param setIntersections - State setter for intersections
 */
export const removePreviousShapes = (
    shape1: any,
    shape2: any,
    setCircles: (fn: (prev: any[]) => any[]) => void,
    setIntersections: (fn: (prev: any[]) => any[]) => void
) => {
    // Remove the shapes from list
    setCircles((prev) => [
        ...prev.filter((e) => e.id !== shape1.id && e.id !== shape2.id),
    ]);

    setIntersections((prev) => [
        ...prev.filter((e) => e.id !== shape1.id && e.id !== shape2.id),
    ]);

    // Remove from map
    // Check if shape has 'polygons' property to identify type
    if (shape1.polygons) {
        // It's an intersection, remove all polygons
        shape1.polygons.forEach((e: any) => e.remove());
    } else {
        // It's a circle, remove the shape
        shape1.shape.remove();
    }

    if (shape2.polygons) {
        // It's an intersection, remove all polygons
        shape2.polygons.forEach((e: any) => e.remove());
    } else {
        // It's a circle, remove the shape
        shape2.shape.remove();
    }
};

/**
 * Convert polygon coordinates to a highlighted intersection polygon and add it to the map
 * This keeps original circles visible and only highlights the intersection area
 * Only ONE search area can exist at a time - any previous highlight is removed
 * @param L - Leaflet library instance
 * @param leafletMap - Leaflet map instance
 * @param coordPoints - Polygon coordinates
 * @param id - Unique ID for the polygon
 * @param sourceIds - Array of source circle IDs that created this intersection
 * @param setIntersections - State setter for intersections
 * @param attachListeners - Optional callback to attach event listeners to the polygon
 */
export const addIntersectionHighlight = (
    L: any,
    leafletMap: any,
    coordPoints: any,
    id: number,
    sourceIds: number[],
    setIntersections: (fn: (prev: any[]) => any[]) => void,
    attachListeners?: (polygon: any, id: number, L: any) => void
) => {
    const polygons: any[] = [];

    coordPoints.forEach((multiPolygon: any) => {
        // Convert all rings (outer + holes)
        const allRings = multiPolygon.map((ring: any) =>
            ring.map(([lng, lat]: [number, number]) => [lat, lng])
        );

        // Use green highlight color for the search area (where treasure could be)
        const polygon = L.polygon(allRings, {
            color: "#228B22", // Forest green border
            fillColor: "#32CD32", // Lime green fill for search area
            fillOpacity: 0.5,
            weight: 3,
        }).addTo(leafletMap);

        // Attach event listeners if provided
        if (attachListeners) {
            attachListeners(polygon, id, L);
            console.log(`Attached listeners to intersection highlight with ID: ${id}`);
        }

        polygons.push(polygon);
    });

    // Remove any existing highlights from the map and state, then add the new one
    // Only ONE search area (highlight) can exist at a time
    setIntersections((prev) => {
        // Find and remove existing highlights from the map
        prev.forEach((intersection) => {
            if (intersection.isHighlight && intersection.polygons) {
                intersection.polygons.forEach((p: any) => p.remove());
            }
        });
        
        // Filter out old highlights and add the new one
        return [
            ...prev.filter((intersection) => !intersection.isHighlight),
            {
                shape: coordPoints,
                polygons: polygons,
                id: id,
                inside: true, // Intersection of inside circles is still "inside"
                visible: true,
                isHighlight: true, // Mark as highlight overlay
                sourceIds: sourceIds, // Track which circles created this intersection
            },
        ];
    });
};

/**
 * Perform union/intersection operation on two shapes
 * For two "inside" circles: keep both circles visible and highlight only the intersection
 * For other cases: perform the original merge behavior
 * @param shape1 - First shape (circle or intersection)
 * @param shape2 - Second shape (circle or intersection)
 * @param L - Leaflet library instance
 * @param leafletMap - Leaflet map instance
 * @param nextId - Current next ID value
 * @param setCircles - State setter for circles
 * @param setIntersections - State setter for intersections
 * @param setNextId - State setter for next ID
 * @param existingIntersections - Current intersections array to check for duplicates
 * @param attachListeners - Optional callback to attach event listeners to created polygons
 * @returns true if intersection was performed (and shapes were modified), false otherwise
 */
export const performUnionIntersection = (
    shape1: any,
    shape2: any,
    L: any,
    leafletMap: any,
    nextId: number,
    setCircles: (fn: (prev: any[]) => any[]) => void,
    setIntersections: (fn: (prev: any[]) => any[]) => void,
    setNextId: (fn: (prev: number) => number) => void,
    existingIntersections: any[],
    attachListeners?: (polygon: any, id: number, L: any) => void
): boolean => {
    if (!L || !leafletMap) return false;

    let poly1;
    let poly2;

    // Convert circle to polygon if needed
    // Check if shape has a 'polygons' property to identify intersections
    if (shape1.polygons) {
        // It's an intersection object, use coordinate data
        poly1 = shape1.shape[0][0];
    } else {
        // It's a circle object, convert to polygon
        poly1 = circleToPolygon(shape1.shape);
    }

    if (shape2.polygons) {
        // It's an intersection object, use coordinate data
        poly2 = shape2.shape[0][0];
    } else {
        // It's a circle object, convert to polygon
        poly2 = circleToPolygon(shape2.shape);
    }

    // Check if shapes actually intersect
    const intersectionCheck = pc.intersection([[poly1]], [[poly2]]);
    if (intersectionCheck.length < 1) return false;

    // No merging of any circles - they should just overlap
    // Inside circles are handled by calculateAllInsideCirclesIntersection
    // Outside circles just stay as separate circles
    return false;
};

/**
 * Calculate the intersection of overlapping inside circles
 * This computes the search area from circles that actually intersect
 * Inside circles that don't intersect with the search area are grey
 * @param circles - Array of circle objects (filtered to inside circles only)
 * @param L - Leaflet library instance
 * @param leafletMap - Leaflet map instance
 * @param nextId - Current next ID value
 * @param setIntersections - State setter for intersections
 * @param setNextId - State setter for next ID
 * @param attachListeners - Optional callback to attach event listeners to created polygons
 */
export const calculateAllInsideCirclesIntersection = (
    circles: any[],
    L: any,
    leafletMap: any,
    nextId: number,
    setIntersections: (fn: (prev: any[]) => any[]) => void,
    setNextId: (fn: (prev: number) => number) => void,
    attachListeners?: (polygon: any, id: number, L: any) => void
) => {
    // Filter circles by type
    const insideCircles = circles.filter(c => c.inside === true);
    const outsideCircles = circles.filter(c => c.inside === false);
    
    if (insideCircles.length < 1) {
        // No inside circles, remove any existing highlight
        setIntersections((prev) => {
            prev.forEach((intersection) => {
                if (intersection.isHighlight && intersection.polygons) {
                    intersection.polygons.forEach((p: any) => p.remove());
                }
            });
            return prev.filter((intersection) => !intersection.isHighlight);
        });
        return;
    }
    
    // Convert outside circles to polygons for subtraction
    const outsidePolygons = outsideCircles.map(c => circleToPolygon(c.shape));
    
    if (insideCircles.length === 1) {
        // Only one inside circle - start with it as the search area
        let searchArea: pc.MultiPolygon = [[circleToPolygon(insideCircles[0].shape)]];
        
        // Subtract all outside circles from the search area
        for (const outsidePoly of outsidePolygons) {
            searchArea = pc.difference(searchArea, [[outsidePoly]]);
            if (searchArea.length === 0) break;
        }
        
        // If there's remaining search area after subtracting outside circles
        if (searchArea.length > 0) {
            // Make the inside circle grey since we'll show the search area as highlight
            insideCircles[0].shape.setStyle({
                color: "darkgrey",
                fillColor: "lightgrey",
            });
            
            const sourceIds = [insideCircles[0].id];
            addIntersectionHighlight(
                L,
                leafletMap,
                searchArea,
                nextId + 1,
                sourceIds,
                setIntersections,
                attachListeners
            );
            setNextId((prev) => prev + 1);
        } else {
            // No search area left - circle is entirely covered by outside circles
            insideCircles[0].shape.setStyle({
                color: "darkgrey",
                fillColor: "lightgrey",
            });
            // Remove any existing highlight
            setIntersections((prev) => {
                prev.forEach((intersection) => {
                    if (intersection.isHighlight && intersection.polygons) {
                        intersection.polygons.forEach((p: any) => p.remove());
                    }
                });
                return prev.filter((intersection) => !intersection.isHighlight);
            });
        }
        return;
    }
    
    // With 2+ inside circles, find circles that form a valid intersection
    // Convert all inside circles to polygons
    const polygonsData = insideCircles.map(c => ({
        circle: c,
        polygon: circleToPolygon(c.shape)
    }));
    
    // Find the best intersection: start with first circle and keep adding circles
    // that intersect with the current result
    let currentIntersection: pc.MultiPolygon = [[polygonsData[0].polygon]];
    let participatingCircles = [polygonsData[0].circle];
    
    for (let i = 1; i < polygonsData.length; i++) {
        const testIntersection = pc.intersection(currentIntersection, [[polygonsData[i].polygon]]);
        if (testIntersection.length > 0) {
            // This circle intersects with the current search area
            currentIntersection = testIntersection;
            participatingCircles.push(polygonsData[i].circle);
        }
        // If no intersection, this circle doesn't participate - will be grey
    }
    
    // Now subtract all outside circles from the search area
    let searchArea = currentIntersection;
    for (const outsidePoly of outsidePolygons) {
        searchArea = pc.difference(searchArea, [[outsidePoly]]);
        if (searchArea.length === 0) break;
    }
    
    // Set all inside circles to grey
    insideCircles.forEach(circle => {
        circle.shape.setStyle({
            color: "darkgrey",
            fillColor: "lightgrey",
        });
    });
    
    // If no search area remains after subtraction
    if (searchArea.length === 0) {
        // Remove any existing highlight
        setIntersections((prev) => {
            prev.forEach((intersection) => {
                if (intersection.isHighlight && intersection.polygons) {
                    intersection.polygons.forEach((p: any) => p.remove());
                }
            });
            return prev.filter((intersection) => !intersection.isHighlight);
        });
        return;
    }
    
    // We have a valid search area - show it as green highlight
    const sourceIds = participatingCircles.map(c => c.id).sort((a, b) => a - b);
    
    addIntersectionHighlight(
        L,
        leafletMap,
        searchArea,
        nextId + 1,
        sourceIds,
        setIntersections,
        attachListeners
    );
    setNextId((prev) => prev + 1);
};

/**
 * Compare all circles and intersections to find and process overlaps
 * For inside circles: calculates the intersection of ALL inside circles (search area)
 * For outside circles: merges overlapping outside circles
 * @param circles - Array of circle objects
 * @param intersections - Array of intersection objects
 * @param L - Leaflet library instance
 * @param leafletMap - Leaflet map instance
 * @param nextId - Current next ID value
 * @param setCircles - State setter for circles
 * @param setIntersections - State setter for intersections
 * @param setNextId - State setter for next ID
 * @param attachListeners - Optional callback to attach event listeners to created polygons
 */
export const compareShapesForIntersections = (
    circles: any[],
    intersections: any[],
    L: any,
    leafletMap: any,
    nextId: number,
    setCircles: (fn: (prev: any[]) => any[]) => void,
    setIntersections: (fn: (prev: any[]) => any[]) => void,
    setNextId: (fn: (prev: number) => number) => void,
    attachListeners?: (polygon: any, id: number, L: any) => void
) => {
    // First, calculate the intersection of ALL inside circles (the search area)
    // This shows where the treasure could be based on all "treasure is inside" hints
    calculateAllInsideCirclesIntersection(
        circles,
        L,
        leafletMap,
        nextId,
        setIntersections,
        setNextId,
        attachListeners
    );
    
    // No merging of circles - they just overlap
    // Inside circles search area is handled by calculateAllInsideCirclesIntersection
    // Outside circles stay as separate circles
};
