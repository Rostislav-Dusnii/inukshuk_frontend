import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import "leaflet/dist/leaflet.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletLibrary = any;

export interface MapContainerRef {
    getMap: () => LeafletMap | null;
    getLeafletLib: () => LeafletLibrary | null;
}

interface MapContainerComponentProps {
    defaultLatitude?: number;
    defaultLongitude?: number;
    defaultZoom?: number;
    onMapReady?: () => void;
}

const MapContainerComponent = forwardRef<MapContainerRef, MapContainerComponentProps>(
    ({ defaultLatitude = 50.8466429, defaultLongitude = 4.7266831, defaultZoom = 13, onMapReady }, ref) => {
        const mapRef = useRef<HTMLDivElement | null>(null);
        const leafletMap = useRef<LeafletMap>(null);
        const leafletLib = useRef<LeafletLibrary>(null);

        useImperativeHandle(ref, () => ({
            getMap: () => leafletMap.current,
            getLeafletLib: () => leafletLib.current,
        }));

        // Load Leaflet library dynamically
        const loadLibrary = async () => {
            const L = await import("leaflet");
            leafletLib.current = L;
        };

        // Initialize map
        const setMapView = (lat: number, lng: number, zoom: number) => {
            if (!leafletMap.current && leafletLib.current && mapRef.current) {
                leafletMap.current = leafletLib.current
                    .map(mapRef.current, { zoomControl: false, attributionControl: false })
                    .setView([lat, lng], zoom);

                // Add zoom control to the top-right corner
                leafletLib.current.control.zoom({ position: 'topright' }).addTo(leafletMap.current);
            }
        };

        // Add tile layer
        const setMapSource = () => {
            if (leafletLib.current && leafletMap.current) {
                leafletLib.current
                    .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        attribution:
                            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    })
                    .addTo(leafletMap.current);
            }
        };

        // Initialize the map on mount
        useEffect(() => {
            (async () => {
                await loadLibrary();
                setMapView(defaultLatitude, defaultLongitude, defaultZoom);
                setMapSource();

                // Notify parent that map is ready
                if (onMapReady) {
                    onMapReady();
                }
            })();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <div className="map-wrapper" style={{ height: "100%", width: "100%" }}>
                <div
                    ref={mapRef}
                    id="map"
                    style={{ height: "100%", width: "100%" }}
                ></div>
            </div>
        );
    }
);

MapContainerComponent.displayName = "MapContainerComponent";

export default MapContainerComponent;
