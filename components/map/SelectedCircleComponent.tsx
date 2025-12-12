import React from "react";
import { useTranslation } from "next-i18next";


interface SelectedCircleComponentProps {
    selectedCircle: number | null;
    selectedCircleData: { id: number; inside: boolean; visible: boolean; shape: any } | undefined;
    onUpdateCircleInside: (circleId: number, newInsideValue: boolean) => void;
    onToggleVisibility: (circleId: number) => void;
}

export default function SelectedCircleComponent({
    selectedCircle,
    selectedCircleData,
    onUpdateCircleInside,
    onToggleVisibility,
}: SelectedCircleComponentProps) {
    if (selectedCircle === null || !selectedCircleData) {
        return null;
    }
    const { t } = useTranslation("common");
    return (
        <div className="fixed z-[1000] top-[90px] right-[calc(1rem)] md:right-[calc(1rem+170px+1rem)] border-solid rounded-[8px] border-brand-green border-4 bg-white dark:bg-gray-800 shadow-xl p-[12px] text-center backdrop-blur-sm min-w-[140px] flex flex-col justify-center">
            <p className="font-semibold text-brand-green dark:text-gray-100" style={{ fontSize: "1rem", marginBottom: "4px" }}>
                {t("map.isInside")}
            </p>
            <div className="radio-group" style={{ margin: 0 }}>
                <div className="radio-options" style={{ justifyContent: "center", gap: "16px", flexWrap: "nowrap", alignItems: "center" }}>
                    <label style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <input
                            type="radio"
                            name="select"
                            value="yes"
                            checked={selectedCircleData.inside === true}
                            onChange={() => {
                                onUpdateCircleInside(selectedCircle, true);
                            }}
                            style={{ margin: 0, position: "relative", top: "0px" }}
                        />
                        <span style={{ fontSize: "1rem", lineHeight: "18px", position: "relative", top: "0px" }}>
                            {t("common.yes")}
                        </span>
                    </label>
                    <label style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <input
                            type="radio"
                            name="select"
                            value="no"
                            checked={selectedCircleData.inside === false}
                            onChange={() => {
                                onUpdateCircleInside(selectedCircle, false);
                            }}
                            style={{ margin: 0, position: "relative", top: "0px" }}
                        />
                        <span style={{ fontSize: "1rem", lineHeight: "18px", position: "relative", top: "0px" }}>
                            {t("common.no")}
                        </span>
                    </label>
                </div>
            </div>

            {/* Visibility Toggle */}
            <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <button
                    onClick={() => onToggleVisibility(selectedCircle)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-brand-green hover:bg-green-600 text-white transition-colors"
                    title={selectedCircleData.visible ? "Hide circle" : "Show circle"}
                >
                    {selectedCircleData.visible ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{t("map.circleList.hide")}</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                            <span>{t("map.circleList.show")}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}



