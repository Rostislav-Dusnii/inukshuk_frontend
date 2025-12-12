import React, { useState } from "react";
import ShareCircleModal from "./ShareCircleModal";
import { Share2 } from "lucide-react";
import { useTranslation } from "next-i18next";


type Props = {
    circles: any[];
    circlesLength: number;
}

const MapShareCircleButtonComponent: React.FC<Props> = ({ circles, circlesLength }) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const { t } = useTranslation("common");
    return (
        <>
            <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                disabled={circlesLength === 0}
                className="w-full min-w-0 py-3.5 px-4 bg-white dark:bg-gray-800 border border-brand-green/30 dark:border-gray-700 rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-200 shadow-sm flex flex-col items-center gap-1.5 justify-center text-gray-800 dark:text-gray-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-md hover:enabled:border-brand-green hover:enabled:bg-green-50 dark:hover:enabled:bg-green-900/20 active:enabled:translate-y-0 active:enabled:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-700"
            >
                <span className="break-words text-center hidden md:block">{t("map.share_modal.title")}</span>
                <Share2 className="w-5 h-5" />
            </button>

            <ShareCircleModal
                circles={circles}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
        </>
    );
}

export default MapShareCircleButtonComponent;



