import { Circle, Plus } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "next-i18next";

type Props = {
  latitude: number;
  longitude: number;
  radius: number;
  isInside: boolean;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  onInsideChange: (value: boolean) => void;
  onAddCircle: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
};

export default function CircleSettingsPanelComponent({
  latitude,
  longitude,
  radius,
  isInside,
  onLatitudeChange,
  onLongitudeChange,
  onRadiusChange,
  onInsideChange,
  onAddCircle,
  isOpen: externalIsOpen,
  onToggle,
}: Props) {
  // Local state for input fields and validation
  const [latitudeInput, setLatitudeInput] = useState<string>(
    latitude.toString()
  );
  const [longitudeInput, setLongitudeInput] = useState<string>(
    longitude.toString()
  );
  const [statusMessageLatitude, setStatusMessageLatitude] =
    useState<string>("");
  const [statusMessageLongitude, setStatusMessageLongitude] =
    useState<string>("");
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonPosition, setButtonPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const { t } = useTranslation("common");

  // Keep input fields in sync with props
  useEffect(() => {
    setLatitudeInput(latitude.toString());
    setLongitudeInput(longitude.toString());
  }, [latitude, longitude]);

  // Update popup position when it opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.top,
        right: window.innerWidth - rect.left,
      });
    }
  }, [isOpen]);

  // Validation for latitude
  const handleLatitudeChange = (value: string) => {
    setStatusMessageLatitude("");
    setLatitudeInput(value);

    // Allow empty string or minus
    if (value === "" || value === "-") {
      return;
    }

    // Check if value is a valid number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      setStatusMessageLatitude(t("map.circle.validation.latitudeInvalid")); //"Latitude must be a valid number"
      return;
    }

    if (numValue > 90) {
      setStatusMessageLatitude(t("map.circle.validation.latitude_range"));
      return;
    }

    if (numValue < -90) {
      setStatusMessageLatitude(t("map.circle.validation.latitude_range"));
      return;
    }

    // Valid input -> update parent
    onLatitudeChange(numValue);
  };

  // Validation for longitude
  const handleLongitudeChange = (value: string) => {
    setStatusMessageLongitude("");
    setLongitudeInput(value);

    // Allow empty string or minus
    if (value === "" || value === "-") {
      return;
    }

    // Check if value is a valid number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      setStatusMessageLongitude("map.circle.validation.longitudeInvalid");
      return;
    }

    if (numValue > 180) {
      setStatusMessageLongitude("map.circle.validation.longitude_range");
      return;
    }

    if (numValue < -180) {
      setStatusMessageLongitude("map.circle.validation.longitude_range");
      return;
    }

    // Valid input -> update parent
    onLongitudeChange(numValue);
  };
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-full min-w-0 py-3.5 px-4 bg-white dark:bg-gray-800 border border-brand-orange/30 dark:border-gray-700 rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-200 shadow-sm flex flex-col items-center gap-1.5 justify-center text-gray-800 dark:text-gray-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-orange hover:bg-orange-50 dark:hover:bg-orange-900/20 active:translate-y-0 active:shadow-sm"
        aria-label={isOpen ? t("map.closeSettings") : t("map.openSettings")}
      >
        <span className="break-words text-center hidden md:block">
          {t("map.createCircle")}
        </span>
        <Plus className="w-5 h-5" />
      </button>

      {isOpen &&
        buttonPosition &&
        createPortal(
          <div
            className="fixed z-[1000] inset-x-4 md:inset-x-auto md:right-auto md:left-auto md:top-auto md:bottom-auto bg-white dark:bg-gray-800 w-[calc(100%-2rem)] md:w-auto md:min-w-[380px] md:max-w-[450px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden backdrop-blur-xl border border-black/8 dark:border-gray-700 animate-scaleIn max-h-[calc(100vh-6rem)] overflow-y-auto"
            style={{
              top: window.innerWidth >= 768 ? "auto" : "5rem",
              bottom:
                window.innerWidth >= 768
                  ? `${window.innerHeight - buttonPosition.top + 10}px`
                  : "auto",
              right:
                window.innerWidth >= 768
                  ? `${buttonPosition.right + 40}px`
                  : undefined,
              left: window.innerWidth >= 768 ? "auto" : undefined,
            }}
          >
            <div className="bg-gradient-to-br from-brand-orange to-brand-orange-dark py-5 px-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Circle className="font-bold" />
                <h3 className="m-0 text-lg font-bold text-white tracking-wide">
                  {t("map.createNewCircle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className="bg-white/15 border border-white/30 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none cursor-pointer transition-all duration-200 p-0 m-0 hover:bg-white/25 hover:border-white/50"
                aria-label={t("map.closeSettings")}
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 flex flex-col mb-0">
                  <label
                    htmlFor="latitude"
                    className="text-sm mb-1.5 flex justify-between text-gray-900 dark:text-gray-100 font-semibold"
                  >
                    {t("map.latitude")}:
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    value={latitudeInput}
                    onChange={(e) => handleLatitudeChange(e.target.value)}
                    className="py-2.5 px-3 border border-black/15 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(237,118,14,0.08)] hover:border-brand-orange-light"
                  />
                </div>

                <div className="flex-1 flex flex-col mb-0">
                  <label
                    htmlFor="longitude"
                    className="text-sm mb-1.5 flex justify-between text-gray-900 dark:text-gray-100 font-semibold"
                  >
                    {t("map.longitude")}:
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    value={longitudeInput}
                    onChange={(e) => handleLongitudeChange(e.target.value)}
                    className="py-2.5 px-3 border border-black/15 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(237,118,14,0.08)] hover:border-brand-orange-light"
                  />
                </div>
              </div>

              {statusMessageLatitude && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-[3px] border-red-500 py-3 px-3.5 rounded-lg mt-3 flex items-start gap-2.5 animate-fadeIn">
                  <span className="text-base leading-none flex-shrink-0">
                    ⚠️
                  </span>
                  <p className="m-0 text-red-500 dark:text-red-300 text-xs leading-relaxed font-medium">
                    {statusMessageLatitude}
                  </p>
                </div>
              )}

              {statusMessageLongitude && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-[3px] border-red-500 py-3 px-3.5 rounded-lg mt-3 flex items-start gap-2.5 animate-fadeIn">
                  <span className="text-base leading-none flex-shrink-0">
                    ⚠️
                  </span>
                  <p className="m-0 text-red-500 dark:text-red-300 text-xs leading-relaxed font-medium">
                    {statusMessageLongitude}
                  </p>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-2.5 md:items-center mb-2.5">
                <div className="flex-1 flex flex-col mb-0">
                  <label
                    htmlFor="radius"
                    className="text-sm mb-1.5 flex justify-between text-gray-900 dark:text-gray-100 font-semibold"
                  >
                    {t("map.radius")} (m):
                  </label>
                  <input
                    id="radius"
                    type="number"
                    value={radius}
                    onChange={(e) => onRadiusChange(Number(e.target.value))}
                    className="py-2.5 px-3 border border-black/15 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(237,118,14,0.08)] hover:border-brand-orange-light"
                  />
                </div>

                            <div className="flex flex-col items-start gap-2">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1.5">Is Inside?</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="inside"
                                            value="yes"
                                            checked={isInside}
                                            onChange={() => onInsideChange(true)}
                                            className="appearance-none w-[18px] h-[18px] border-2 border-gray-400 rounded-full bg-white cursor-pointer transition-all relative top-[3px] mr-1.5 checked:border-brand-orange checked:bg-[radial-gradient(var(--brand-orange)_45%,transparent_46%)] hover:border-brand-orange-light"
                                        />
                                        <span className="text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none font-medium">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="inside"
                                            value="no"
                                            checked={!isInside}
                                            onChange={() => onInsideChange(false)}
                                            className="appearance-none w-[18px] h-[18px] border-2 border-gray-400 rounded-full bg-white cursor-pointer transition-all relative top-[3px] mr-1.5 checked:border-brand-orange checked:bg-[radial-gradient(var(--brand-orange)_45%,transparent_46%)] hover:border-brand-orange-light"
                                        />
                                        <span className="text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none font-medium">No</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button type="button" onClick={onAddCircle} className="bg-gradient-to-br from-brand-orange to-brand-orange-dark border-none text-white py-3 px-5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(237,118,14,0.2)] w-full mt-2 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(237,118,14,0.3)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(237,118,14,0.2)]">Click to create</button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
