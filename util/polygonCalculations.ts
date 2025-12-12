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
 * Perform union/intersection operation on two shapes
 * @param shape1 - First shape (circle or intersection)
 * @param shape2 - Second shape (circle or intersection)
 * @param L - Leaflet library instance
 * @param leafletMap - Leaflet map instance
 * @param nextId - Current next ID value
 * @param setCircles - State setter for circles
 * @param setIntersections - State setter for intersections
 * @param setNextId - State setter for next ID
 * @param attachListeners - Optional callback to attach event listeners to created polygons
 * @returns true if intersection was performed, false otherwise
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

    // Remove previous shapes from map and state
    removePreviousShapes(shape1, shape2, setCircles, setIntersections);

    let unionPoints;

    // Perform appropriate operation based on inside/outside status
    if (shape1.inside === false && shape2.inside === false) {
        unionPoints = pc.union([[poly1]], [[poly2]]);
        convertPolyIntoShapeAndAddToMap(
            L,
            leafletMap,
            unionPoints,
            false,
            nextId + 1,
            setIntersections,
            attachListeners
        );
        setNextId((prev) => prev + 1);
    } else if (shape1.inside === true && shape2.inside === true) {
        unionPoints = pc.intersection([[poly1]], [[poly2]]);
        convertPolyIntoShapeAndAddToMap(
            L,
            leafletMap,
            unionPoints,
            true,
            nextId + 1,
            setIntersections,
            attachListeners
        );
        setNextId((prev) => prev + 1);
    } else if (shape1.inside === true && shape2.inside === false) {
        unionPoints = pc.difference([[poly1]], [[poly2]]);

        let createdCount = 0;
        // BUGFIX: App crashes when an outside circle overlaps 100% with an inside circle. E.g. Only convert if difference operation returned a result
        if (unionPoints && unionPoints.length > 0) {
            convertPolyIntoShapeAndAddToMap(
                L,
                leafletMap,
                unionPoints,
                true,
                nextId + 1,
                setIntersections,
                attachListeners
            );
            createdCount++;
        }

        // Always keep the outside shape (shape2)
        convertPolyIntoShapeAndAddToMap(
            L,
            leafletMap,
            [[poly2]],
            false,
            nextId + 1 + createdCount,
            setIntersections,
            attachListeners
        );
        createdCount++;
        setNextId((prev) => prev + createdCount);
        console.log("A - B");
    } else if (shape1.inside === false && shape2.inside === true) {
        unionPoints = pc.difference([[poly2]], [[poly1]]);

        let createdCount = 0;
        // BUGFIX: App crashes when an outside circle overlaps 100% with an inside circle. E.g. Only convert if difference operation returned a result
        if (unionPoints && unionPoints.length > 0) {
            convertPolyIntoShapeAndAddToMap(
                L,
                leafletMap,
                unionPoints,
                true,
                nextId + 1,
                setIntersections,
                attachListeners
            );
            createdCount++;
        }

        // Always keep the outside shape (shape1)
        convertPolyIntoShapeAndAddToMap(
            L,
            leafletMap,
            [[poly1]],
            false,
            nextId + 1 + createdCount,
            setIntersections,
            attachListeners
        );
        createdCount++;
        setNextId((prev) => prev + createdCount);
    } else {
        return false;
    }

    return true;
};

/**
 * Compare all circles and intersections to find and process overlaps
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
    if (circles.length > 1) {
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                console.log("Circle vs Circle:", circles[i], circles[j]);
                if (
                    performUnionIntersection(
                        circles[i],
                        circles[j],
                        L,
                        leafletMap,
                        nextId,
                        setCircles,
                        setIntersections,
                        setNextId,
                        attachListeners
                    )
                )
                    return;
            }
        }
    }

    if (intersections.length > 1) {
        for (let i = 0; i < intersections.length; i++) {
            for (let j = i + 1; j < intersections.length; j++) {
                console.log(
                    "Intersection vs Intersection:",
                    intersections[i],
                    intersections[j]
                );
                if (
                    performUnionIntersection(
                        intersections[i],
                        intersections[j],
                        L,
                        leafletMap,
                        nextId,
                        setCircles,
                        setIntersections,
                        setNextId,
                        attachListeners
                    )
                )
                    return;
            }
        }
    }

    if (circles.length > 0 && intersections.length > 0) {
        for (let i = 0; i < circles.length; i++) {
            for (let j = 0; j < intersections.length; j++) {
                console.log("Circle vs Intersection:", circles[i], intersections[j]);
                if (
                    performUnionIntersection(
                        circles[i],
                        intersections[j],
                        L,
                        leafletMap,
                        nextId,
                        setCircles,
                        setIntersections,
                        setNextId,
                        attachListeners
                    )
                )
                    return;
            }
        }
    }
};
