"use client";

import { useEffect, useRef } from "react";

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

        marker.on("contextmenu", (ev: any) => {
          L.DomEvent.stopPropagation(ev);

          const markerToRemove = ev.target;
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
            .setLatLng(markerToRemove.getLatLng())
            .setContent(popupContent)
            .openOn(map);

          btn.onclick = () => {
            map.removeLayer(markerToRemove);
            markersRef.current = markersRef.current.filter(
              (m) => m.id !== markerData.id
            );
            setMarkersData((prev) => prev.filter((m) => m.id !== markerData.id));
            setSelectedMarkerId(null);
            map.closePopup(popup);
          };
        });
      }
    });
  }, [map, leafletLib, markersData, setLatitude, setLongitude, setMarkersData, setSelectedMarkerId]);

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

    const handleRightClick = (e: any) => {
      // Check if the click target is a path (circle) - if so, don't handle it here
      if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.tagName === 'path') {
        return;
      }

      const { lat, lng } = e.latlng;

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

        marker.on("contextmenu", (ev: any) => {
          L.DomEvent.stopPropagation(ev);

          const markerToRemove = ev.target;
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
            .setLatLng(markerToRemove.getLatLng())
            .setContent(popupContent)
            .openOn(map);

          btn.onclick = () => {
            map.removeLayer(markerToRemove);
            markersRef.current = markersRef.current.filter(
              (m) => m.id !== markerId
            );
            setMarkersData((prev) => prev.filter((m) => m.id !== markerId));
            setSelectedMarkerId(null);
            map.closePopup(popup);
          };
        });
      };
    };

    map.on("contextmenu", handleRightClick);

    return () => {
      map.off("contextmenu", handleRightClick);
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
