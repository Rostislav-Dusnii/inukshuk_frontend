"use client";

import { GetFriendRequests } from "@types";
import React from "react";
import { useTranslation } from "next-i18next";

type Props = {
  requests: GetFriendRequests[];
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  currentUserId: number | null;
};

const FriendRequests: React.FC<Props> = ({
  requests,
  onAccept,
  onDecline,
  currentUserId,
}) => {
  const incomingRequests = requests.filter(
    (r) => r.receiver?.id === currentUserId && r.status === "PENDING"
  );
  const { t } = useTranslation("common");
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {incomingRequests.map((r) => (
        <li
          key={r.id}
          className="flex justify-between items-center py-3 px-4 
                     bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg 
                     hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {/* Naam + username */}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {r.sender?.firstName} {r.sender?.lastName}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              @{r.sender?.username}
            </span>
          </div>

          {/* Actieknoppen */}
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(r.id)}
              className="px-3 py-1 text-sm rounded-lg 
                         bg-brand-orange text-white border-brand-orange
                         hover:bg-brand-orange-darker transition"
            >
              {t("friends.accept")}
            </button>
            <button
              onClick={() => onDecline(r.id)}
              className="px-3 py-1 text-sm rounded-lg 
                         bg-brand-green text-white 
                         hover:bg-brand-green-darker border-brand-green transition"
            >
              {t("friends.decline")}
            </button>
          </div>
        </li>
      ))}

      {incomingRequests.length === 0 && (
        <li className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
          {t("friends.no_requests")}
        </li>
      )}
    </ul>
  );
};

export default FriendRequests;
