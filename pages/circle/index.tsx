"use client";


import MapClickHandler from "@components/map/MapClickHandler";
import MapContainerComponent, { MapContainerRef } from "@components/map/MapContainerComponent";
import MapToolBarNavComponent from "@components/map/MapToolBarNavComponent";
import Head from "next/head";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { User, AcceptedCircleShareDTO } from "@types";
import { useRouter } from "next/router";
import RewardsModalComponent from "@components/map/RewardsModalComponent";
import SelectedCircleComponent from "@components/map/SelectedCircleComponent";
import CircleContextMenu from "@components/map/CircleContextMenu";
import CircleListPanel from "@components/map/CircleListPanel";
import AcceptedCirclesPanel from "@components/map/AcceptedCirclesPanel";
import CircleService from "@services/CircleService";
import SaveServiceManager from "@util/save";
import Header from "@components/header";
import { compareShapesForIntersections } from "@util/polygonCalculations";
import { saveMapData as saveMapDataUtil, loadMapData as loadMapDataUtil } from "@services/MapPersistenceService";
import { updateCircleInside as updateCircleInsideHelper, toggleCircleVisibility as toggleCircleVisibilityHelper, zoomToShape, calculateZoomForRadius } from "@util/circleHelpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap = any;

export default function LeafletMap() {
  const [intersections, setIntersections] = useState<any[]>([]);
  const mapContainerRef = useRef<MapContainerRef>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [circles, setCircles] = useState<any[]>([]);
  const [CurrentCircleCount, setCurrentCircleCount] = useState<number>(0);
  const [selectedCircle, setSelectedCircle] = useState<number | null>(null);

  const [isInside, setIsInside] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const [nextId, setNextId] = useState(0);
  // Coordinate values
  const [latitude, setLatitude] = useState<number>(50.8466429);
  const [longitude, setLongitude] = useState<number>(4.7266831);
  const [radius, setRadius] = useState<number>(100);

  // MapClickHandler data
  const [markersData, setMarkersData] = useState<
    { id: number; lat: number; lng: number }[]
  >([]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [earnedReward, setEarnedReward] = useState<boolean>(false);
  const saveServiceManager = useRef(new SaveServiceManager());
  const hasLoadedDataRef = useRef(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    circleId: number;
  } | null>(null);

  // Accepted circles from other users
  const [acceptedCircles, setAcceptedCircles] = useState<any[]>([]);
  const [acceptedCircleShapes, setAcceptedCircleShapes] = useState<Map<string, any[]>>(new Map());
  const [acceptedCirclesRefresh, setAcceptedCirclesRefresh] = useState(0);

  // Load logged in user and check authentication
  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString) {
      setLoggedInUser(JSON.parse(loggedInUserString));
      setIsLoading(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  const saveMapData = async () => {
    if (!loggedInUser?.userId) return;

    await saveMapDataUtil(
      saveServiceManager.current,
      loggedInUser.userId,
      circles,
      intersections,
      markersData,
      CurrentCircleCount,
      earnedReward
    );
  };

  const loadMapData = async () => {
    if (!loggedInUser?.userId) return;

    const leafletMap = mapContainerRef.current?.getMap();
    const L = mapContainerRef.current?.getLeafletLib();
    if (!L || !leafletMap) return;

    await loadMapDataUtil(
      saveServiceManager.current,
      loggedInUser.userId,
      L,
      leafletMap,
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
  };

  // Helper function to attach event listeners to a circle
  const attachCircleListeners = (circle: any, id: number, L: any) => {
    console.log(`Attaching listeners to shape with ID: ${id}`);

    // Click handler for selection
    circle.on("click", () => {
      setSelectedCircle(id);
    });

    // Right-click context menu
    circle.on("contextmenu", (e: any) => {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      L.DomEvent.stopPropagation(e);
      console.log(`Context menu triggered for ID: ${id}`);
      setContextMenu({
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        circleId: id,
      });
    });
  };

  const compareArrays = () => {
    const L = mapContainerRef.current?.getLeafletLib();
    const leafletMap = mapContainerRef.current?.getMap();
    if (!L || !leafletMap) return;

    compareShapesForIntersections(
      circles,
      intersections,
      L,
      leafletMap,
      nextId,
      setCircles,
      setIntersections,
      setNextId,
      attachCircleListeners
    );
  };

  useEffect(compareArrays, [circles]);
  // Note: intersections is intentionally not in deps to avoid infinite loop

  const defaultValues = {
    Latitude: 50.8466429249097,
    Longitude: 4.7266830956645745,
    DefaultZoom: 13,
  };

  const handleMapReady = () => {
    setLatitude(defaultValues.Latitude);
    setLongitude(defaultValues.Longitude);
    setMapReady(true);
  };

  // DO NOT REMOVE --> PLEASE
  // Auto-load user's saved map data when map is ready and user is logged in (ONCE)
  useEffect(() => {
    if (mapReady && loggedInUser?.userId && mapContainerRef.current?.getMap() && !hasLoadedDataRef.current) {
      hasLoadedDataRef.current = true;
      loadMapData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, loggedInUser]);

  // DO NOT REMOVE --> PLEASE
  // Auto-save map data whenever circles, intersections, or markers change
  useEffect(() => {
    // Only auto-save if map is ready, user is logged in, and data has been initially loaded
    // Skip saving during initial load
    if (mapReady && loggedInUser?.userId && hasLoadedDataRef.current && (circles.length > 0 || intersections.length > 0 || markersData.length > 0)) {
      // Debounce the save to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveMapData();
      }, 1000); // Wait 1 second after last change before saving
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circles, intersections, markersData, earnedReward, mapReady]);

  // Load and render accepted circles from other users
  useEffect(() => {
    if (!mapReady || !loggedInUser?.token || !mapContainerRef.current) return;

    const loadAcceptedCircles = async () => {
      try {
        const L = mapContainerRef.current?.getLeafletLib();
        const leafletMap = mapContainerRef.current?.getMap();
        if (!L || !leafletMap) return;

        const acceptedShares = await CircleService.getAcceptedCircleShares(loggedInUser.token as string);
        
        // Clear existing accepted circle shapes
        acceptedCircleShapes.forEach((shapes) => {
          shapes.forEach(shape => shape.remove());
        });

        const newShapesMap = new Map<string, any[]>();

        // Draw accepted circles with dashed style
        acceptedShares.forEach((share: AcceptedCircleShareDTO) => {
          if (!share.visible) return;

          const shapes: any[] = [];
          share.circles.forEach((circle) => {
            const shape = L.circle([circle.latitude, circle.longitude], {
              color: "#9370DB", // Purple color for shared circles
              fillColor: circle.isInside ? "#DDA0DD" : "#D3D3D3",
              fillOpacity: 0.3,
              radius: circle.radius,
              dashArray: "10, 10", // Dashed line style
              weight: 2,
            }).addTo(leafletMap);

            // Add a tooltip with owner info
            shape.bindTooltip(`Shared by ${share.ownerUsername}`, {
              permanent: false,
              direction: "top"
            });

            shapes.push(shape);
          });

          newShapesMap.set(share.shareId, shapes);
        });

        setAcceptedCircleShapes(newShapesMap);
        setAcceptedCircles(acceptedShares);
      } catch (err) {
        console.error("Failed to load accepted circles:", err);
      }
    };

    loadAcceptedCircles();
  }, [mapReady, loggedInUser, acceptedCirclesRefresh]);

  // Handle toggling visibility of accepted circles
  const handleToggleAcceptedVisibility = (shareId: string, visible: boolean) => {
    const L = mapContainerRef.current?.getLeafletLib();
    const leafletMap = mapContainerRef.current?.getMap();
    if (!L || !leafletMap) return;

    const shapes = acceptedCircleShapes.get(shareId);
    if (shapes) {
      shapes.forEach(shape => {
        if (visible) {
          shape.addTo(leafletMap);
        } else {
          shape.remove();
        }
      });
    }
  };

  // Handle removing accepted circles
  const handleRemoveAccepted = (shareId: string) => {
    const shapes = acceptedCircleShapes.get(shareId);
    if (shapes) {
      shapes.forEach(shape => shape.remove());
      const newMap = new Map(acceptedCircleShapes);
      newMap.delete(shareId);
      setAcceptedCircleShapes(newMap);
    }
  };

  // Add a circle to the map
  const handleAddCircle = () => {
    const leafletMap = mapContainerRef.current?.getMap();
    const L = mapContainerRef.current?.getLeafletLib();
    if (!leafletMap || !L) return;

    // Use marker position if one is selected (MapClickHandler)
    const markerData = markersData.find((m) => m.id === selectedMarker);
    const latToUse = markerData ? markerData.lat : latitude;
    const lngToUse = markerData ? markerData.lng : longitude;

    // Update coordinates if using marker position
    if (markerData) {
      setLatitude(latToUse);
      setLongitude(lngToUse);
    }

    // Calculate optimal zoom level based on circle radius to show the circle properly
    const optimalZoom = calculateZoomForRadius(radius);
    // Center map on the circle location with the calculated zoom
    leafletMap.setView([latToUse, lngToUse], optimalZoom);

    const id = nextId + 1;

    // Maak de nieuwe cirkel met de correcte kleur en radius
    const newCircle = L.circle([latToUse, lngToUse], {
      color: isInside ? "green" : "darkgrey",
      fillColor: isInside ? "lightgreen" : "lightgrey",
      fillOpacity: 0.4,
      radius: radius,
    }).addTo(leafletMap);

    // Attach event listeners (click and context menu)
    attachCircleListeners(newCircle, id, L);

    // Voeg toe aan state
    setCircles((prev) => [...prev, { shape: newCircle, id, inside: isInside, visible: true }]);
    setNextId((prev) => prev + 1);

    // Update teller
    setCurrentCircleCount((prev) => prev + 1);
  };

  // Handlers for coordinate changes from the panel (with map view update)
  const handleLatitudeChange = (value: number) => {
    setLatitude(value);
    const leafletMap = mapContainerRef.current?.getMap();
    if (leafletMap) {
      leafletMap.setView({ lng: longitude, lat: value }, 13);
    }
  };

  const handleLongitudeChange = (value: number) => {
    setLongitude(value);
    const leafletMap = mapContainerRef.current?.getMap();
    if (leafletMap) {
      leafletMap.setView({ lng: value, lat: latitude }, 13);
    }
  };

  // Helper function to update circle inside status
  const updateCircleInside = (circleId: number, newInsideValue: boolean) => {
    updateCircleInsideHelper(circleId, newInsideValue, circles, intersections, setCircles, setIntersections);
  };

  // Helper function to toggle circle visibility
  const toggleCircleVisibility = (circleId: number) => {
    const leafletMap = mapContainerRef.current?.getMap();
    toggleCircleVisibilityHelper(circleId, circles, intersections, setCircles, setIntersections, leafletMap);
  };

  // Helper function to zoom to a shape
  const handleZoomToShape = (shapeId: number) => {
    const leafletMap = mapContainerRef.current?.getMap();
    zoomToShape(shapeId, circles, intersections, leafletMap);
  };

  // Helper function to delete a circle or polygon
  const handleDeleteCircle = (circleId: number) => {
    console.log(`Attempting to delete shape with ID: ${circleId}`);
    const leafletMap = mapContainerRef.current?.getMap();
    if (!leafletMap) return;

    // Try to find in circles first
    const circleToDelete = circles.find((c) => c.id === circleId);
    if (circleToDelete) {
      console.log(`Found circle with ID ${circleId}, deleting...`);
      // Remove the circle from the map
      leafletMap.removeLayer(circleToDelete.shape);
      // Update the circle counter
      setCurrentCircleCount((count) => Math.max(0, count - 1));
      // Clear selection if this circle was selected
      if (selectedCircle === circleId) {
        setSelectedCircle(null);
      }
      // Remove from circles array
      setCircles((prev) => prev.filter((c) => c.id !== circleId));
    } else {
      // Try to find in intersections (merged polygons)
      const intersectionToDelete = intersections.find((i) => i.id === circleId);
      if (intersectionToDelete) {
        console.log(`Found polygon with ID ${circleId}, deleting ${intersectionToDelete.polygons.length} polygon parts...`);
        // Remove all polygons from the map
        intersectionToDelete.polygons.forEach((polygon: any) => {
          leafletMap.removeLayer(polygon);
        });
        // Update the circle counter
        setCurrentCircleCount((count) => Math.max(0, count - 1));
        // Clear selection if this polygon was selected
        if (selectedCircle === circleId) {
          setSelectedCircle(null);
        }
        // Remove from intersections array
        setIntersections((prev) => prev.filter((i) => i.id !== circleId));
      } else {
        console.error(`No shape found with ID ${circleId}`);
      }
    }

    // Close the context menu
    setContextMenu(null);
  };

  // Get the selected circle data (from circles or intersections)
  const selectedCircleData = circles.find((e) => e.id === selectedCircle) || intersections.find((i) => i.id === selectedCircle);

  // Show loading or nothing while checking authentication
  if (isLoading || !loggedInUser) {
    return (
      <>
        <Head>
          <title>Circle Drawing</title>
        </Head>
        <div className="flex items-center justify-center h-full">
          <p className="text-white">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Circle Drawing</title>
      </Head>

      {/** Disable captcha logo on the circle page */}
      <style jsx global>{`
        .grecaptcha-badge {
          visibility: hidden !important;
        }
      `}</style>

      <Header />

      <div className="flex flex-col md:flex-row h-[calc(100vh-73px)]">
        {/* Map Section - takes full width on mobile, left side on desktop */}
        <div className="flex-1 relative order-1 overflow-hidden">
          <MapContainerComponent
            ref={mapContainerRef}
            defaultLatitude={defaultValues.Latitude}
            defaultLongitude={defaultValues.Longitude}
            defaultZoom={defaultValues.DefaultZoom}
            onMapReady={handleMapReady}
          />
          {mapReady && mapContainerRef.current && (
            <MapClickHandler
              map={mapContainerRef.current.getMap()}
              leafletLib={mapContainerRef.current.getLeafletLib()}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              markersData={markersData}
              setMarkersData={setMarkersData}
              setSelectedMarkerId={setSelectedMarker}
            />
          )}

          <SelectedCircleComponent
            selectedCircle={selectedCircle}
            selectedCircleData={selectedCircleData}
            onUpdateCircleInside={updateCircleInside}
            onToggleVisibility={toggleCircleVisibility}
          />

          <CircleListPanel
            circles={circles}
            intersections={intersections}
            selectedCircle={selectedCircle}
            onSelectCircle={setSelectedCircle}
            onToggleVisibility={toggleCircleVisibility}
            onZoomToShape={handleZoomToShape}
          />
        </div>

        {/* Toolbar Section - Bottom on mobile, Right side on desktop */}
        <div className="bg-white dark:bg-gray-800 border-t-4 md:border-t-0 md:border-l-4 border-brand-orange order-2 h-auto md:h-full">
          <MapToolBarNavComponent
            counter={CurrentCircleCount}
            latitude={latitude}
            longitude={longitude}
            radius={radius}
            isInside={isInside}
            circles={circles}
            circlesLength={circles.length}
            map={mapContainerRef.current?.getMap()}
            leafletLib={mapContainerRef.current?.getLeafletLib()}
            mapReady={mapReady}
            onLatitudeChange={handleLatitudeChange}
            onLongitudeChange={handleLongitudeChange}
            onRadiusChange={setRadius}
            onInsideChange={setIsInside}
            onAddCircle={handleAddCircle}
            onClearComplete={() => {
              // Clear all frontend state
              const leafletMap = mapContainerRef.current?.getMap();
              if (leafletMap) {
                // Remove all circles from map
                circles.forEach(circle => leafletMap.removeLayer(circle.shape));
                // Remove all intersection polygons from map
                intersections.forEach(intersection => {
                  intersection.polygons.forEach((polygon: any) => leafletMap.removeLayer(polygon));
                });
              }
              // Reset all state
              setCircles([]);
              setIntersections([]);
              setMarkersData([]);
              setCurrentCircleCount(0);
              setSelectedCircle(null);
              setSelectedMarker(null);
              setEarnedReward(false);
              console.log("Frontend map data cleared");
            }}
          />
        </div>
      </div>

      {/* Modals and Overlays */}
      <RewardsModalComponent counter={CurrentCircleCount} earnedReward={earnedReward} setEarnedReward={setEarnedReward} />

      {contextMenu && (
        <CircleContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          circleId={contextMenu.circleId}
          onDelete={() => handleDeleteCircle(contextMenu.circleId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Panel for managing accepted circles from other users */}
      <AcceptedCirclesPanel
        onToggleVisibility={handleToggleAcceptedVisibility}
        onRemove={handleRemoveAccepted}
        refreshTrigger={acceptedCirclesRefresh}
      />
    </>
  );
}


import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
