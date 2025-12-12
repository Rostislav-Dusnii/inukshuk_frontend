"use client";

import { useEffect, useState, useRef } from "react";
import FriendService from "@services/FriendService";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "next-i18next";


const HeaderNotification: React.FC = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [requests, setRequests] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const userIdRef = useRef<number | null>(null);
const { t } = useTranslation("common");
  useEffect(() => {
    const stored = sessionStorage.getItem("loggedInUser");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    userIdRef.current = parsed.userId;

    const fetchRequests = async () => {
      if (!userIdRef.current) return;
      const data = await FriendService.getFriendRequests(
        userIdRef.current,
        "incoming",
        "PENDING"
      );
      setRequests(data);
      setPendingCount(data.length);
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setOpen(!open);
    setPendingCount(0); // reset teller bij openen
  };

  const handleAccept = async (requestId: number) => {
    if (!userIdRef.current) return;
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await FriendService.acceptFriendRequest(requestId, userIdRef.current);
    } catch (error) {
      console.error("Failed to accept friend request", error);
    }
  };

  const handleDecline = async (requestId: number) => {
    if (!userIdRef.current) return;
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await FriendService.rejectFriendRequest(requestId, userIdRef.current);
    } catch (error) {
      console.error("Failed to decline friend request", error);
    }
  };

  return (
    <div className="relative">
      {/* Tekstballon zonder cirkel */}
      <div className="relative">
        <MessageCircle
          onClick={handleToggle}
          className="w-6 h-6 text-brand-orange hover:text-brand-orange-darker cursor-pointer"
        />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-green text-white text-xs rounded-full px-1.5 py-0.5">
            {pendingCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 shadow-lg rounded p-2 z-50">
          {requests.length === 0 ? (
            <p className="text-sm text-brand-orange-lighter">
              {t("friends.no_requests")}
            </p>
          ) : (
            requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 border-b border-brand-orange-lighter"
              >
                <span className="text-sm text-brand-green-darker">
                  @{r.sender?.username} {t("friends.sent_a_request")}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderNotification;

