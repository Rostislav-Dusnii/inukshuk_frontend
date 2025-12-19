"use client";

import CircleCounterComponent from "@components/map/MapTools/CircleCounterComponent";
import Head from "next/head";
import Header from "@components/header";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import CircleService from "@services/CircleService";
import { SharedCircleDTO, User } from "@types";

type LeafletMap = any;
type LeafletLibrary = any;

export default function SharedCirclesPage() {
  const router = useRouter();
  const { shareId } = router.query;

  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<LeafletMap>(null);
  const leafletLib = useRef<LeafletLibrary>(null);

  const [circles, setCircles] = useState<SharedCircleDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [ownerUsername, setOwnerUsername] = useState<string>("");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string>("");
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  // Check if user has already accepted this share
  useEffect(() => {
    if (!shareId || typeof shareId !== "string" || !loggedInUser?.token) return;

    const checkAccepted = async () => {
      try {
        const accepted = await CircleService.checkAcceptedShare(shareId, loggedInUser.token as string);
        setHasAccepted(accepted);
      } catch (err) {
        // Ignore errors, assume not accepted
      }
    };

    checkAccepted();
  }, [shareId, loggedInUser]);

  // Dynamic import of Leaflet
  const loadLibrary = async () => {
    const L = await import("leaflet");
    leafletLib.current = L;
  };

  const setMapView = (lat: number, lng: number, zoom: number) => {
    if (!leafletMap.current && leafletLib.current && mapRef.current) {
      leafletMap.current = leafletLib.current
        .map(mapRef.current)
        .setView([lat, lng], zoom);

      // Add tile layer
      leafletLib.current
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(leafletMap.current);
    }
  };

  // Load shared circles
  useEffect(() => {
    if (!shareId || typeof shareId !== "string") return;

    const fetchSharedCircles = async () => {
      try {
        const data = await CircleService.getSharedCircles(shareId);
        setCircles(data);
        if (data.length > 0) {
          setOwnerUsername(data[0].ownerUsername);
        }
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load shared circles. The link may be invalid.");
        setIsLoading(false);
      }
    };

    fetchSharedCircles();
  }, [shareId]);

  // Initialize map and draw circles
  useEffect(() => {
    if (circles.length === 0 || leafletMap.current) return;

    const initializeMap = async () => {
      await loadLibrary();

      // Use the first circle's coordinates as the center
      const centerCircle = circles[0];
      setMapView(centerCircle.latitude, centerCircle.longitude, 13);

      // Add tile layer
      if (leafletLib.current && leafletMap.current) {
        const L = leafletLib.current;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(leafletMap.current);

        // Separate inside and outside circles
        const insideCircles = circles.filter(c => c.isInside);
        const outsideCircles = circles.filter(c => !c.isInside);

        // Draw all circles as grey first
        circles.forEach((circle) => {
          L.circle([circle.latitude, circle.longitude], {
            color: "darkgrey",
            fillColor: "lightgrey",
            fillOpacity: 0.4,
            radius: circle.radius,
          }).addTo(leafletMap.current);
        });

        // Helper function to convert circle to polygon coordinates
        const circleToPolygon = (lat: number, lng: number, radius: number, steps = 64) => {
          const coords = [];
          const latRad = (lat * Math.PI) / 180;
          const metersPerDegreeLat = 111320;
          const metersPerDegreeLng = 111320 * Math.cos(latRad);

          for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * 2 * Math.PI;
            coords.push([
              lng + (radius / metersPerDegreeLng) * Math.cos(angle),
              lat + (radius / metersPerDegreeLat) * Math.sin(angle),
            ]);
          }
          coords.push(coords[0]);
          return coords;
        };

        // Calculate and draw search area if there are inside circles
        if (insideCircles.length > 0) {
          // Dynamic import of polygon-clipping
          const pc = await import("polygon-clipping");

          // Convert inside circles to polygons and find their intersection
          const insidePolygons = insideCircles.map(c =>
            circleToPolygon(c.latitude, c.longitude, c.radius)
          );

          // Start with first inside circle
          let searchArea: any = [[insidePolygons[0]]];

          // Intersect with other inside circles
          for (let i = 1; i < insidePolygons.length; i++) {
            searchArea = pc.default.intersection(searchArea, [[insidePolygons[i]]]);
            if (searchArea.length === 0) break;
          }

          // Subtract outside circles from search area
          if (searchArea.length > 0) {
            for (const outsideCircle of outsideCircles) {
              const outsidePoly = circleToPolygon(
                outsideCircle.latitude,
                outsideCircle.longitude,
                outsideCircle.radius
              );
              searchArea = pc.default.difference(searchArea, [[outsidePoly]]);
              if (searchArea.length === 0) break;
            }
          }

          // Draw the search area as green if it exists
          if (searchArea.length > 0) {
            searchArea.forEach((multiPolygon: any) => {
              const allRings = multiPolygon.map((ring: any) =>
                ring.map(([lng, lat]: [number, number]) => [lat, lng])
              );

              L.polygon(allRings, {
                color: "#228B22",
                fillColor: "#32CD32",
                fillOpacity: 0.5,
                weight: 3,
              }).addTo(leafletMap.current);
            });
          }
        }
      }
    };

    initializeMap();
  }, [circles]);

  // Handle accepting shared circles
  const handleAccept = async () => {
    if (!shareId || typeof shareId !== "string" || !loggedInUser?.token) return;

    setIsAccepting(true);
    setAcceptError("");

    try {
      await CircleService.acceptSharedCircles(shareId, loggedInUser.token as string);
      setAcceptSuccess(true);
      setHasAccepted(true);
    } catch (err: any) {
      setAcceptError(err.message || "Failed to accept circles");
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle declining (just redirect away)
  const handleDecline = () => {
    router.push("/map");
  };

  // Check if user is the owner
  const isOwner = loggedInUser?.username === ownerUsername;

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Shared Circles - Loading...</title>
        </Head>
        <Header />
        <div className="shared-container">
          <p>Loading shared circles...</p>
        </div>
        <style jsx>{`
          .shared-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: calc(100vh - 80px);
            color: white;
            font-size: 1.2em;
          }
        `}</style>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Shared Circles - Error</title>
        </Head>
        <Header />
        <div className="shared-container">
          <div className="error-box">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={() => router.push("/map")}>
              Go to Map
            </button>
          </div>
        </div>
        <style jsx>{`
          .shared-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: calc(100vh - 80px);
          }

          .error-box {
            background: white;
            padding: 2em;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .error-box h2 {
            color: #c33;
            margin-bottom: 0.5em;
          }

          .error-box p {
            color: #333;
            margin-bottom: 1em;
          }

          .error-box button {
            padding: 10px 20px;
            background-color: #ff69b4;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            font-weight: bold;
          }

          .error-box button:hover {
            background-color: #ff1493;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Shared Circles from {ownerUsername}</title>
      </Head>

      <Header />

      <div className="bg-white dark:bg-gray-800 shadow-xl backdrop-blur-sm" style={{
        position: "fixed",
        top: "100px",
        right: "20px",
        zIndex: 1000,
        border: "4px solid var(--brand-green)",
        borderRadius: "8px",
        padding: "12px",
        textAlign: "center",
        minWidth: "250px",
        maxWidth: "300px"
      }}>
        <h3 className="text-gray-900 dark:text-gray-100" style={{ margin: "0 0 0.5em 0", fontWeight: 600 }}>
          🗺️ Shared by {ownerUsername}
        </h3>
        <p className="text-gray-900 dark:text-gray-100" style={{ margin: "0.25em 0", fontSize: "0.9em" }}>
          {circles.length} circle{circles.length !== 1 ? "s" : ""} shared
        </p>
        <p className="text-gray-600 dark:text-gray-400" style={{ margin: "0.25em 0 1em 0", fontSize: "0.85em" }}>
          📍 Read-only view
        </p>

        {/* Accept/Decline section */}
        {loggedInUser && !isOwner && (
          <div style={{ marginTop: "12px", borderTop: "1px solid #ddd", paddingTop: "12px" }}>
            {acceptSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20" style={{
                padding: "8px",
                borderRadius: "6px",
                marginBottom: "8px"
              }}>
                <p className="text-green-700 dark:text-green-400" style={{ fontSize: "0.9em", fontWeight: 600 }}>
                  ✓ Circles accepted!
                </p>
                <p className="text-green-600 dark:text-green-500" style={{ fontSize: "0.8em", marginTop: "4px" }}>
                  View them on your map
                </p>
              </div>
            ) : hasAccepted ? (
              <div className="bg-blue-50 dark:bg-blue-900/20" style={{
                padding: "8px",
                borderRadius: "6px",
                marginBottom: "8px"
              }}>
                <p className="text-blue-700 dark:text-blue-400" style={{ fontSize: "0.9em", fontWeight: 600 }}>
                  ✓ Already accepted
                </p>
                <p className="text-blue-600 dark:text-blue-500" style={{ fontSize: "0.8em", marginTop: "4px" }}>
                  These circles are on your map
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: "0.85em", marginBottom: "8px" }}>
                  Add these circles to your map?
                </p>
                {acceptError && (
                  <p className="text-red-600 dark:text-red-400" style={{ fontSize: "0.8em", marginBottom: "8px" }}>
                    {acceptError}
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  <button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: isAccepting ? "not-allowed" : "pointer",
                      fontSize: "0.9em",
                      fontWeight: 600,
                      opacity: isAccepting ? 0.7 : 1
                    }}
                  >
                    {isAccepting ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={isAccepting}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.9em",
                      fontWeight: 600
                    }}
                  >
                    Decline
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Show login prompt if not logged in */}
        {!loggedInUser && (
          <div style={{ marginTop: "12px", borderTop: "1px solid #ddd", paddingTop: "12px" }}>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: "0.85em", marginBottom: "8px" }}>
              Log in to add these circles to your map
            </p>
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--brand-orange)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9em",
                fontWeight: 600
              }}
            >
              Log In
            </button>
          </div>
        )}

        {/* Owner message */}
        {isOwner && (
          <div style={{ marginTop: "12px", borderTop: "1px solid #ddd", paddingTop: "12px" }}>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: "0.85em" }}>
              This is your shared link
            </p>
          </div>
        )}

        {/* Go to map button */}
        <button
          onClick={() => router.push("/map")}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            backgroundColor: "var(--brand-orange)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9em",
            fontWeight: 600,
            width: "100%"
          }}
        >
          Go to My Map
        </button>
      </div>

      <div className="map-wrapper">
        <div
          ref={mapRef}
          id="shared-map"
          style={{ height: "100%", width: "100%" }}
        ></div>
      </div>

      <div className="circle-box">
        <div className="bg-white dark:bg-gray-800 shadow-xl backdrop-blur-sm" style={{
          border: "4px solid var(--brand-orange)",
          borderRadius: "8px",
          padding: "12px",
          textAlign: "center"
        }}>
          <h3 className="text-gray-900 dark:text-gray-100" style={{ fontWeight: 600, marginBottom: "10px" }}>Circles</h3>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {circles.map((circle, index) => (
              <div
                key={circle.id}
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                style={{
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "8px",
                  border: "1px solid"
                }}
              >
                <div style={{ fontWeight: "bold", color: "var(--brand-orange)", marginBottom: "6px" }}>
                  Circle #{index + 1}
                </div>
                <div className="text-gray-900 dark:text-gray-100" style={{ fontSize: "0.9em", lineHeight: "1.6" }}>
                  <p style={{ margin: "2px 0" }}>
                    <strong>Latitude:</strong> {circle.latitude.toFixed(6)}
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <strong>Longitude:</strong> {circle.longitude.toFixed(6)}
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <strong>Radius:</strong> {circle.radius}m
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <strong>Type:</strong>
                    <span style={{
                      color: circle.isInside ? "green" : "darkgrey",
                      fontWeight: "bold",
                      marginLeft: "4px"
                    }}>
                      {circle.isInside ? "Inside" : "Outside"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
