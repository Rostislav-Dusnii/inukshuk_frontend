'use client';
import { Trash } from "lucide-react";
import MapClearModalComponent from "./MapClearModal";
import { useState } from "react";
import { useTranslation } from "next-i18next";


type Props = {
    onClearComplete?: () => void;
}

const MapClearComponent: React.FC<Props> = ({ onClearComplete }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useTranslation("common");
    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => { setIsModalOpen(true); }}
                className="w-full min-w-0 py-3.5 px-4 bg-white dark:bg-gray-800 border border-red-600/20 dark:-red-600/30 rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-200 shadow-sm flex flex-col items-center gap-1.5 justify-center text-gray-800 dark:text-gray-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-md hover:enabled:border-red-600 hover:enabled:bg-red-500 dark:hover:enabled:bg-red-600/20 active:enabled:translate-y-0 active:enabled:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700"
                title={t("map.map_clear")}
            >
                <span className="break-words text-center hidden md:block">{t("map.map_clear")}</span>
                <Trash className="w-5 h-5" />
            </button>
            <MapClearModalComponent
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClearComplete={onClearComplete}
            />
        </>
    );
}

export default MapClearComponent;


