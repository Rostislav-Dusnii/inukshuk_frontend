import React, { useState, useEffect } from "react";
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
}

export default function CircleCreationPanelComponent({
    latitude,
    longitude,
    radius,
    isInside,
    onLatitudeChange,
    onLongitudeChange,
    onRadiusChange,
    onInsideChange,
    onAddCircle,
}: Props) {
    const { t } = useTranslation("common");
    // Local state for input fields and validation
    const [latitudeInput, setLatitudeInput] = useState<string>(latitude.toString());
    const [longitudeInput, setLongitudeInput] = useState<string>(longitude.toString());
    const [statusMessageLatitude, setStatusMessageLatitude] = useState<string>("");
    const [statusMessageLongitude, setStatusMessageLongitude] = useState<string>("");

    // Keep input fields in sync with props
    useEffect(() => {
        setLatitudeInput(latitude.toString());
        setLongitudeInput(longitude.toString());
    }, [latitude, longitude]);

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
            setStatusMessageLatitude(t("map.circle.validation.latitude_invalid"));
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
            setStatusMessageLongitude(t("map.circle.validation.longitude_invalid"));
            return;
        }

        if (numValue > 180) {
            setStatusMessageLongitude(t("map.circle.validation.longitude_range"));
            return;
        }

        if (numValue < -180) {
            setStatusMessageLongitude(t("map.circle.validation.longitude_range"));
            return;
        }

        // Valid input -> update parent
        onLongitudeChange(numValue);
    };

    return (
        <>

            <div className="flex-1 flex flex-col mb-0">
                <label htmlFor="latitude" className="text-sm mb-1.5 flex justify-between text-gray-900 dark:text-gray-100 font-semibold">{t("map.circle.latitude")}:</label>
                <input
                    id="latitude"
                    type="number"
                    value={latitudeInput}
                    onChange={(e) => handleLatitudeChange(e.target.value)}
                    className="py-2.5 px-3 border border-black/15 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(237,118,14,0.08)] hover:border-brand-orange-light"
                />
            </div>

            {statusMessageLatitude && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-[3px] border-red-500 py-3 px-3.5 rounded-lg mt-3 flex items-start gap-2.5 animate-fadeIn">
                    <span className="text-base leading-none flex-shrink-0">⚠️</span>
                    <p className="m-0 text-red-500 dark:text-red-300 text-xs leading-relaxed font-medium">{statusMessageLatitude}</p>
                </div>
            )}

            <div className="flex-1 flex flex-col mb-0">
                <label htmlFor="longitude" className="text-sm pt-2 mb-1.5 flex justify-between text-gray-900 dark:text-gray-100 font-semibold">{t("map.circle.longitude")}:</label>
                <input
                    id="longitude"
                    type="number"
                    value={longitudeInput}
                    onChange={(e) => handleLongitudeChange(e.target.value)}
                    className="py-2.5 px-3 border border-black/15 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(237,118,14,0.08)] hover:border-brand-orange-light"
                />
            </div>

            {statusMessageLongitude && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-[3px] border-red-500 py-3 px-3.5 rounded-lg mt-3 flex items-start gap-2.5 animate-fadeIn">
                    <span className="text-base leading-none flex-shrink-0">⚠️</span>
                    <p className="m-0 text-red-500 dark:text-red-300 text-xs leading-relaxed font-medium">{statusMessageLongitude}</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-2.5 md:items-center mb-2.5">
                <div className="flex-1 flex flex-col mb-0 pt-2">
                    <label htmlFor="radius" className="text-sm mb-1.5 flex justify-between text-gray-900 dark:text-gray-100 font-semibold">{t("map.circle.radius")}:</label>
                    <input
                        id="radius"
                        type="number"
                        value={radius}
                        onChange={(e) => onRadiusChange(Number(e.target.value))}
                        className="py-2.5 px-3 border border-black/15 dark:border-gray-600 rounded-lg text-sm transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(237,118,14,0.08)] hover:border-brand-orange-light"
                    />
                </div>

                <div className="flex flex-col items-start gap-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1.5">{t("map.circle.is_inside")}</p>
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
                            <span className="text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none font-medium">{t("map.circle.yes")}</span>
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
                            <span className="text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none font-medium">{t("map.circle.no")}</span>
                        </label>
                    </div>
                </div>
            </div>
            <button type="button" onClick={onAddCircle} className="bg-gradient-to-br from-brand-orange to-brand-orange-dark border-none text-white py-3 px-5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(237,118,14,0.2)] w-full mt-2 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(237,118,14,0.3)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(237,118,14,0.2)]">{t("map.circle.create")}</button>
        </>
    );
}
