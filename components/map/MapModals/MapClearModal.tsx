'use client';

import router from "next/router";
import { useEffect, useState } from "react";
import ModalComponent from "../ModalComponent";
import { removeMapDataFromUser } from "@services/MapDataService";
import { useTranslation } from "next-i18next";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onClearComplete?: () => void;
}

const MapClearModalComponent: React.FC<Props> = ({ isOpen, onClose, onClearComplete }: Props) => {
  const { t } = useTranslation("common");
  // Load logged in user and check authentication
  const [loggedInUserId, setLoggedInUserId] = useState<number>();

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString) {
      const loggedInUserObject = JSON.parse(loggedInUserString);

      if (loggedInUserObject.userId != undefined) {
        setLoggedInUserId(loggedInUserObject.userId);
      } else {
        console.error("No user ID found in session, redirecting to login");
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const RemoveAllMapDataForUser = (userId) => {
    console.log("Clearing map data for user:", userId);
    removeMapDataFromUser(userId)
      .then((response) => {
        if (response.ok) {
          console.log("Map data cleared successfully for user:", userId);
          // Trigger frontend state reset
          if (onClearComplete) {
            onClearComplete();
          }
        } else {
          console.error("Failed to clear map data for user:", userId);
        }
      })
      .catch((error) => {
        console.error("Error clearing map data for user:", userId, error);
      });
  }

  const buttons = [
    {
      label: t("map.mapClear.yes"),
      onClick: () => {
        RemoveAllMapDataForUser(loggedInUserId);
        onClose();
      },
      variant: 'danger' as const
    },
    {
      label: t("map.mapClear.cancel"),
      onClick: onClose,
      variant: 'secondary' as const
    }
  ];

  return (
    <ModalComponent
      title={t("map.map_clear")}
      type="danger"
      isOpen={isOpen}
      onClose={onClose}
      buttons={buttons}
      showFooterClose={false}
    >
      <div className="space-y-5">
        <div className="text-center py-4">
          <h3 className="text-3xl font-semibold text-brand-green dark:text-brand-green-light mb-2">
            {t("map.mapClear.title1")} 🗑️
          </h3>
          <p className="text-xl text-brand-orange dark:text-brand-orange-light font-medium">
            {t("map.mapClear.title2")}
          </p>
        </div>

        <div className="bg-brand-orange-lighter/20 dark:bg-brand-orange/30 border-l-4 border-red-500 dark:border-red-500 p-4 rounded-r shadow-md">
          <div className="flex flew-row">
            <p className="text-lg text-brand-green dark:text-brand-green-light">❗</p>
            <p className="text-lg text-brand-green-dark dark:text-brand-green-light">{t("map.mapClear.danger")}</p>
          </div>
        </div>
      </div>
    </ModalComponent>
  );
}

export default MapClearModalComponent;
