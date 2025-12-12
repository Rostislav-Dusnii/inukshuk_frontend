import React, { useState } from "react";
import CircleCounterComponent from "./CircleCounterComponent";
import CircleSettingsPanelComponent from "./CircleSettingsPanelComponent";
import MapLocationTrackerComponent from "./MapLocationTrackerComponent";
import MapShareCircleButtonComponent from "./MapShareCircleButtonComponent";
import MapClearComponent from "./MapClearComponent";
import { useTranslation } from "next-i18next";

type Props = {
  counter: number;
  latitude: number;
  longitude: number;
  radius: number;
  isInside: boolean;
  circles: any[];
  circlesLength: number;
  map: any;
  leafletLib: any;
  mapReady: boolean;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  onInsideChange: (value: boolean) => void;
  onAddCircle: () => void;
  onClearComplete?: () => void;
};

export default function MapToolBarNavComponent({
  counter,
  latitude,
  longitude,
  radius,
  isInside,
  circles,
  circlesLength,
  map,
  leafletLib,
  mapReady,
  onLatitudeChange,
  onLongitudeChange,
  onRadiusChange,
  onInsideChange,
  onAddCircle,
  onClearComplete,
}: Props) {
  const [activePopup, setActivePopup] = useState<
    "location" | "settings" | null
  >(null);
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-row md:flex-col h-auto md:h-full p-4 gap-3 md:overflow-x-visible md:overflow-y-auto md:justify-between">
      {/* Single MapLocationTrackerComponent instance - renders only popup, controlled by buttons below */}
      {mapReady && map && leafletLib && (
        <MapLocationTrackerComponent
          map={map}
          leafletLib={leafletLib}
          mapReady={mapReady}
          isOpen={activePopup === "location"}
          onToggle={() =>
            setActivePopup(activePopup === "location" ? null : "location")
          }
        />
      )}

      {/* Circle Counter at the top on desktop, hidden on mobile initially */}
      <div className="hidden md:flex md:flex-shrink-0">
        <CircleCounterComponent counter={counter} />
      </div>

      {/* Bottom buttons group - only on desktop */}
      <div className="hidden md:flex md:flex-col md:gap-3 md:mt-auto">
        {/* Map Clear Component */}
        <MapClearComponent onClearComplete={onClearComplete} />

        {/* Map Location Tracker Button */}
        {mapReady && map && leafletLib && (
          <button
            type="button"
            onClick={() =>
              setActivePopup(activePopup === "location" ? null : "location")
            }
            className="w-full min-w-0 py-3.5 px-4 bg-white dark:bg-gray-800 border border-blue-500/30 dark:border-gray-700 rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-200 shadow-sm flex flex-col items-center gap-1.5 justify-center text-gray-800 dark:text-gray-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:translate-y-0 active:shadow-sm"
            aria-label={t("map.locationTracker")}
          >
            <span className="break-words text-center hidden md:block">
              {t("map.locationTracker")}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </button>
        )}

        {/** Share map tool button */}
        <MapShareCircleButtonComponent
          circles={circles}
          circlesLength={circlesLength}
        />

        {/* Circle Settings Panel */}
        <CircleSettingsPanelComponent
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          isInside={isInside}
          onLatitudeChange={onLatitudeChange}
          onLongitudeChange={onLongitudeChange}
          onRadiusChange={onRadiusChange}
          onInsideChange={onInsideChange}
          onAddCircle={onAddCircle}
          isOpen={activePopup === "settings"}
          onToggle={() =>
            setActivePopup(activePopup === "settings" ? null : "settings")
          }
        />
      </div>

      {/* Mobile buttons - shown individually without wrapper */}
      <div className="flex-1 min-w-0 md:hidden">
        <MapClearComponent onClearComplete={onClearComplete} />
      </div>

      {mapReady && map && leafletLib && (
        <div className="flex-1 min-w-0 md:hidden">
          <button
            type="button"
            onClick={() =>
              setActivePopup(activePopup === "location" ? null : "location")
            }
            className="w-full min-w-0 py-3.5 px-4 bg-white dark:bg-gray-800 border border-blue-500/30 dark:border-gray-700 rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-200 shadow-sm flex flex-col items-center gap-1.5 justify-center text-gray-800 dark:text-gray-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:translate-y-0 active:shadow-sm"
            aria-label={t("map.locationTracker")}
          >
            <span className="break-words text-center hidden md:block">
              {t("map.locationTracker")}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </button>
        </div>
      )}

      {/* Circle Counter in the middle on mobile */}
      <div className="flex-1 min-w-0 md:hidden">
        <CircleCounterComponent counter={counter} />
      </div>

      <div className="flex-1 min-w-0 md:hidden">
        <MapShareCircleButtonComponent
          circles={circles}
          circlesLength={circlesLength}
        />
      </div>

      <div className="flex-1 min-w-0 md:hidden">
        <CircleSettingsPanelComponent
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          isInside={isInside}
          onLatitudeChange={onLatitudeChange}
          onLongitudeChange={onLongitudeChange}
          onRadiusChange={onRadiusChange}
          onInsideChange={onInsideChange}
          onAddCircle={onAddCircle}
          isOpen={activePopup === "settings"}
          onToggle={() =>
            setActivePopup(activePopup === "settings" ? null : "settings")
          }
        />
      </div>
    </div>
  );
}
