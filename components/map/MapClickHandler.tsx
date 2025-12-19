"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";

interface MapClickHandlerProps {
  map: any;
  leafletLib: any;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
  markersData: { id: number; lat: number; lng: number }[];
  setMarkersData: React.Dispatch<
    React.SetStateAction<{ id: number; lat: number; lng: number }[]>
  >;
  setSelectedMarkerId: (id: number | null) => void;
}

const LONG_PRESS_DURATION = 500; // ms for long press detection

const MapClickHandler: React.FC<MapClickHandlerProps> = ({
  map,
  leafletLib,
  setLatitude,
  setLongitude,
  markersData,
  setMarkersData,
  setSelectedMarkerId,
}) => {
  const markersRef = useRef<{ id: number; marker: any }[]>([]);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Helper function to show delete popup for a marker
  const showDeletePopup = (marker: any, markerId: number, L: any) => {
    const popupContent = L.DomUtil.create("div");
    const btn = L.DomUtil.create("button", "", popupContent);
    btn.textContent = "Delete marker";
    Object.assign(btn.style, {
      background: "#ef4444",
      color: "white",
      border: "none",
      padding: "6px 12px",
      borderRadius: "6px",
      cursor: "pointer",
    });

    const popup = L.popup()
      .setLatLng(marker.getLatLng())
      .setContent(popupContent)
      .openOn(map);

    btn.onclick = () => {
      map.removeLayer(marker);
      markersRef.current = markersRef.current.filter(
        (m) => m.id !== markerId
      );
      setMarkersData((prev) => prev.filter((m) => m.id !== markerId));
      setSelectedMarkerId(null);
      map.closePopup(popup);
    };
  };

  // Helper function to set up long-press on a marker element
  const setupMarkerLongPress = (marker: any, markerId: number, L: any) => {
    const markerElement = marker.getElement();
    if (!markerElement) return;

    let markerLongPressTimer: NodeJS.Timeout | null = null;
    let markerTouchStartPos: { x: number; y: number } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      markerTouchStartPos = { x: touch.clientX, y: touch.clientY };

      markerLongPressTimer = setTimeout(() => {
        // Trigger the delete popup
        showDeletePopup(marker, markerId, L);
      }, LONG_PRESS_DURATION);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!markerTouchStartPos || !markerLongPressTimer) return;

      const touch = e.touches[0];
      const moveThreshold = 10;
      const dx = Math.abs(touch.clientX - markerTouchStartPos.x);
      const dy = Math.abs(touch.clientY - markerTouchStartPos.y);

      if (dx > moveThreshold || dy > moveThreshold) {
        clearTimeout(markerLongPressTimer);
        markerLongPressTimer = null;
      }
    };

    const handleTouchEnd = () => {
      if (markerLongPressTimer) {
        clearTimeout(markerLongPressTimer);
        markerLongPressTimer = null;
      }
      markerTouchStartPos = null;
    };

    markerElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    markerElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    markerElement.addEventListener('touchend', handleTouchEnd);
    markerElement.addEventListener('touchcancel', handleTouchEnd);
  };

  // Sync markers from markersData prop
  useEffect(() => {
    if (!map || !leafletLib) return;
    const L = leafletLib;

    const pointer = L.icon({
      iconUrl: "/images/pointer.png",
      iconSize: [96, 96],
      iconAnchor: [48, 96],
      popupAnchor: [0, -96],
    });

    const selectedPointer = L.icon({
      iconUrl: "/images/selected_pointer.png",
      iconSize: [96, 96],
      iconAnchor: [48, 96],
      popupAnchor: [0, -96],
    });

    // Remove markers that are no longer in markersData
    markersRef.current = markersRef.current.filter((markerRef) => {
      const exists = markersData.some((m) => m.id === markerRef.id);
      if (!exists) {
        map.removeLayer(markerRef.marker);
        return false;
      }
      return true;
    });

    // Add new markers from markersData
    markersData.forEach((markerData) => {
      const exists = markersRef.current.some((m) => m.id === markerData.id);
      if (!exists) {
        const marker = L.marker([markerData.lat, markerData.lng], {
          icon: pointer,
          draggable: true,
        }).addTo(map);

        markersRef.current.push({ id: markerData.id, marker });

        marker.on("click", () => {
          markersRef.current.forEach((m) => {
            m.marker.setIcon(pointer);
          });

          marker.setIcon(selectedPointer);
          setSelectedMarkerId(markerData.id);
          const pos = marker.getLatLng();
          setLatitude(pos.lat);
          setLongitude(pos.lng);
        });

        marker.on("drag", (ev: any) => {
          const newLatLng = ev.target.getLatLng();
          setMarkersData((prev) =>
            prev.map((m) =>
              m.id === markerData.id
                ? { ...m, lat: newLatLng.lat, lng: newLatLng.lng }
                : m
            )
          );
          setLatitude(newLatLng.lat);
          setLongitude(newLatLng.lng);
        });

        // Desktop: right-click context menu
        marker.on("contextmenu", (ev: any) => {
          L.DomEvent.stopPropagation(ev);
          showDeletePopup(marker, markerData.id, L);
        });

        // Mobile: long-press to delete (set up after marker is added to map)
        setTimeout(() => setupMarkerLongPress(marker, markerData.id, L), 0);
      }
    });
  }, [
    map,
    leafletLib,
    markersData,
    setLatitude,
    setLongitude,
    setMarkersData,
    setSelectedMarkerId,
  ]);

  useEffect(() => {
    if (!map || !leafletLib) return;
    const L = leafletLib;

    L.DomEvent.on(map.getContainer(), "contextmenu", L.DomEvent.preventDefault);

    const pointer = L.icon({
      iconUrl: "/images/pointer.png",
      iconSize: [96, 96],
      iconAnchor: [48, 96],
      popupAnchor: [0, -96],
    });

    const selectedPointer = L.icon({
      iconUrl: "/images/selected_pointer.png",
      iconSize: [96, 96],
      iconAnchor: [48, 96],
      popupAnchor: [0, -96],
    });

    // Helper to show the "Set pointer" popup
    const showSetPointerPopup = (lat: number, lng: number) => {
      const popupContent = L.DomUtil.create("div");
      const btn = L.DomUtil.create("button", "", popupContent);
      btn.textContent = "Set pointer";
      Object.assign(btn.style, {
        background: "#FF69B4",
        color: "white",
        border: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
      });

      const popup = L.popup()
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);

      btn.onclick = () => {
        map.closePopup(popup);

        const marker = L.marker([lat, lng], {
          icon: pointer,
          draggable: true,
        }).addTo(map);
        const markerId = Date.now();

        markersRef.current.push({ id: markerId, marker });
        setMarkersData((prev) => [...prev, { id: markerId, lat, lng }]);
        setSelectedMarkerId(markerId);
        setLatitude(lat);
        setLongitude(lng);

        marker.on("click", () => {
          markersRef.current.forEach((m) => {
            m.marker.setIcon(pointer);
          });

          marker.setIcon(selectedPointer);
          setSelectedMarkerId(markerId);
          const pos = marker.getLatLng();
          setLatitude(pos.lat);
          setLongitude(pos.lng);
        });

        marker.on("drag", (ev: any) => {
          const newLatLng = ev.target.getLatLng();
          setMarkersData((prev) =>
            prev.map((m) =>
              m.id === markerId
                ? { ...m, lat: newLatLng.lat, lng: newLatLng.lng }
                : m
            )
          );
          setLatitude(newLatLng.lat);
          setLongitude(newLatLng.lng);
        });

        // Desktop: right-click context menu for delete
        marker.on("contextmenu", (ev: any) => {
          L.DomEvent.stopPropagation(ev);
          showDeletePopup(marker, markerId, L);
        });

        // Mobile: long-press to delete
        setTimeout(() => setupMarkerLongPress(marker, markerId, L), 0);
      };
    };

    // Desktop: right-click handler
    const handleRightClick = (e: any) => {
      // Check if the click target is a path (circle) - if so, don't handle it here
      if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.tagName === 'path') {
        return;
      }

      const { lat, lng } = e.latlng;
      showSetPointerPopup(lat, lng);
    };

    map.on("contextmenu", handleRightClick);

    // Mobile: long-press on map to add marker
    const mapContainer = map.getContainer();

    const handleMapTouchStart = (e: TouchEvent) => {
      // Ignore if touching a marker, popup, or circle (path element)
      const target = e.target as HTMLElement;
      if (target.closest('.leaflet-marker-icon') ||
        target.closest('.leaflet-popup') ||
        target.tagName === 'path' ||
        target.closest('path')) {
        return;
      }

      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

      longPressTimerRef.current = setTimeout(() => {
        // Get the map coordinates from the touch position
        const containerPoint = L.point(
          touch.clientX - mapContainer.getBoundingClientRect().left,
          touch.clientY - mapContainer.getBoundingClientRect().top
        );
        const latlng = map.containerPointToLatLng(containerPoint);

        // Show the set pointer popup
        showSetPointerPopup(latlng.lat, latlng.lng);
      }, LONG_PRESS_DURATION);
    };

    const handleMapTouchMove = (e: TouchEvent) => {
      if (!touchStartPosRef.current || !longPressTimerRef.current) return;

      const touch = e.touches[0];
      const moveThreshold = 10;
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);

      // If moved too much, cancel the long press
      if (dx > moveThreshold || dy > moveThreshold) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleMapTouchEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      touchStartPosRef.current = null;
    };

    mapContainer.addEventListener('touchstart', handleMapTouchStart, { passive: true });
    mapContainer.addEventListener('touchmove', handleMapTouchMove, { passive: true });
    mapContainer.addEventListener('touchend', handleMapTouchEnd);
    mapContainer.addEventListener('touchcancel', handleMapTouchEnd);

    return () => {
      map.off("contextmenu", handleRightClick);
      mapContainer.removeEventListener('touchstart', handleMapTouchStart);
      mapContainer.removeEventListener('touchmove', handleMapTouchMove);
      mapContainer.removeEventListener('touchend', handleMapTouchEnd);
      mapContainer.removeEventListener('touchcancel', handleMapTouchEnd);
      markersRef.current.forEach((m) => map.removeLayer(m.marker));
    };
  }, [
    map,
    leafletLib,
    setLatitude,
    setLongitude,
    setMarkersData,
    setSelectedMarkerId,
  ]);

  return null;
};

export default MapClickHandler;
