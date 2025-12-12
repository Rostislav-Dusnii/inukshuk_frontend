import { MapPin } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from "next-i18next";


type Props = {
    map: any;
    leafletLib: any;
    mapReady: boolean;
    onLocationUpdate?: (position: { lat: number; lng: number }) => void;
    isOpen?: boolean;
    onToggle?: () => void;
}

const MapLocationTrackerComponent: React.FC<Props> = ({
    map,
    leafletLib,
    mapReady,
    onLocationUpdate,
    isOpen: externalIsOpen,
    onToggle
}: Props) => {
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [showLocationMarker, setShowLocationMarker] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [locationWarning, setLocationWarning] = useState<string | null>(null);
    const [permissionRequested, setPermissionRequested] = useState(false);
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : false;

    const userMarkerRef = useRef<any>(null);
    const userAccuracyRef = useRef<any>(null);
    const permissionRequestedRef = useRef(false);
    const lastAccuracyRef = useRef<number>(0);
    const { t } = useTranslation("common");

    // Request location permission on mount
    useEffect(() => {
        if (!mapReady) return;
        if (permissionRequestedRef.current) return;

        permissionRequestedRef.current = true;
        setPermissionRequested(true);

        if (!navigator.geolocation) {
            setLocationWarning(t("map.location.support_disabled"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng, accuracy } = pos.coords;
                const newPosition = { lat, lng };
                setUserPosition(newPosition);
                lastAccuracyRef.current = accuracy || 0;

                if (onLocationUpdate) {
                    onLocationUpdate(newPosition);
                }
            },
            handleLocationError,
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
        );
    }, [mapReady]);

    const handleLocationError = (err: GeolocationPositionError) => {
        if (err.code === err.PERMISSION_DENIED) {
            setPermissionDenied(true);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
            setLocationWarning(t("map.location.unavailable"));
        } else if (err.code === err.TIMEOUT) {
            setLocationWarning(t("map.location.timeout"));
        } else {
            setLocationWarning(t("map.location.unable"));
        }
    };

    const updateLocationMarkers = (lat: number, lng: number, accuracy?: number) => {
        if (!leafletLib || !map) return;

        // Store the accuracy value
        if (accuracy !== undefined) {
            lastAccuracyRef.current = accuracy;
        }

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
        } else {
            userMarkerRef.current = leafletLib.circleMarker([lat, lng], {
                className: "user-location-marker",
                radius: 8,
                color: "#007bff",
                fillColor: "#007bff",
                fillOpacity: 1,
                weight: 2,
            }).addTo(map);
        }

        if (userAccuracyRef.current) {
            userAccuracyRef.current.setLatLng([lat, lng]).setRadius(accuracy || 0);
        } else {
            userAccuracyRef.current = leafletLib.circle([lat, lng], {
                className: "user-location-accuracy",
                radius: accuracy || 0,
                color: "#007bff",
                fillColor: "#007bff",
                fillOpacity: 0.1,
                interactive: false,
            }).addTo(map);
        }
    };

    const toggleTracking = () => {
        if (!navigator.geolocation) {
            setLocationWarning(t("map.location.support_disabled"));
            return;
        }

        permissionRequestedRef.current = true;
        setPermissionRequested(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng, accuracy } = pos.coords;
                const newPosition = { lat, lng };
                setUserPosition(newPosition);
                setPermissionDenied(false);
                lastAccuracyRef.current = accuracy || 0;

                if (accuracy && accuracy > 100) {
                    setLocationWarning(
                        `${t("map.location.low_accuracy1")}${Math.round(accuracy)}${t("map.location.low_accuracy2")}`
                    );
                } else {
                    setLocationWarning(null);
                }

                if (onLocationUpdate) {
                    onLocationUpdate(newPosition);
                }

                if (leafletLib && map) {
                    // Update existing markers if they exist and are visible
                    if (showLocationMarker && userMarkerRef.current) {
                        updateLocationMarkers(lat, lng, accuracy);
                    }
                    map.setView([lat, lng]);
                }
            },
            handleLocationError,
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
        );
    };

    const toggleMarkerVisibility = () => {
        setShowLocationMarker(!showLocationMarker);
    };

    // Effect to handle marker visibility changes
    useEffect(() => {
        if (!leafletLib || !map) return;

        if (showLocationMarker) {
            // Show markers - recreate if they don't exist
            if (userPosition && !userMarkerRef.current) {
                const { lat, lng } = userPosition;
                userMarkerRef.current = leafletLib.circleMarker([lat, lng], {
                    className: "user-location-marker",
                    radius: 8,
                    color: "#007bff",
                    fillColor: "#007bff",
                    fillOpacity: 1,
                    weight: 2,
                }).addTo(map);

                userAccuracyRef.current = leafletLib.circle([lat, lng], {
                    className: "user-location-accuracy",
                    radius: lastAccuracyRef.current || 0,
                    color: "#007bff",
                    fillColor: "#007bff",
                    fillOpacity: 0.1,
                    interactive: false,
                }).addTo(map);
            }
        } else {
            // Hide markers - remove them
            if (userMarkerRef.current) {
                userMarkerRef.current.remove();
                userMarkerRef.current = null;
            }
            if (userAccuracyRef.current) {
                userAccuracyRef.current.remove();
                userAccuracyRef.current = null;
            }
        }
    }, [showLocationMarker, leafletLib, map, userPosition]);

    return (
        <>
            {isOpen && createPortal(
                <div className="fixed z-[1000] top-20 left-4 right-4 md:top-auto md:left-auto md:right-[200px] md:bottom-48 bg-white dark:bg-gray-800 min-w-[280px] max-w-[450px] md:w-auto rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden backdrop-blur-xl border border-black/8 dark:border-gray-700 animate-scaleIn max-h-[calc(100vh-6rem)] overflow-y-auto">
                    <div className="bg-gradient-to-br from-brand-orange to-brand-orange-dark py-5 px-6 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <MapPin />
                            <h3 className="m-0 text-lg font-bold text-white tracking-wide">{t("map.locationTracker")}</h3>
                        </div>
                        <button
                            onClick={onToggle}
                            className="bg-white/15 border border-white/30 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none cursor-pointer transition-all duration-200 p-0 m-0 hover:bg-white/25 hover:border-white/50"
                            aria-label={t("map.close_tracker")}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-3">
                            <button onClick={toggleTracking} className="bg-gradient-to-br from-brand-orange to-brand-orange-dark border-none text-white py-3 px-5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(237,118,14,0.2)] w-full hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(237,118,14,0.3)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(237,118,14,0.2)]">
                                📌 {t("map.location.myLocation")}
                            </button>
                            <button
                                onClick={toggleMarkerVisibility}
                                className={showLocationMarker
                                    ? "bg-gradient-to-br from-brand-green to-brand-green-dark border-none text-white py-3 px-5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(61,100,45,0.2)] w-full hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(61,100,45,0.3)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(61,100,45,0.2)]"
                                    : "bg-gradient-to-br from-gray-600 to-gray-700 border-none text-white py-3 px-5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(108,117,125,0.2)] w-full hover:from-gray-700 hover:to-gray-800 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(108,117,125,0.3)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(108,117,125,0.2)]"
                                }
                            >
                                {showLocationMarker ? `👁️ ${t("map.marker.hide")}` : `👁️‍🗨️ ${t("map.marker.show")}`}
                            </button>
                        </div>
                        {permissionDenied && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-[3px] border-red-500 py-3 px-3.5 rounded-lg mt-3 flex items-start gap-2.5 animate-fadeIn">
                                <span className="text-base leading-none flex-shrink-0">🚫</span>
                                <p className="m-0 text-red-500 dark:text-red-300 text-xs leading-relaxed font-medium">{t("map.location.denied")}</p>
                            </div>
                        )}
                        {locationWarning && !permissionDenied && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-[3px] border-orange-500 py-3 px-3.5 rounded-lg mt-3 flex items-start gap-2.5 animate-fadeIn">
                                <span className="text-base leading-none flex-shrink-0">⚠️</span>
                                <p className="m-0 text-orange-600 dark:text-orange-300 text-xs leading-relaxed font-medium">{locationWarning}</p>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default MapLocationTrackerComponent;



