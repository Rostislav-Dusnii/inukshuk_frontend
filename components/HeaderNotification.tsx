"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import FriendService from "@services/FriendService";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "next-i18next";


const HeaderNotification: React.FC = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [requests, setRequests] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userIdRef = useRef<number | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen(!open);
    setPendingCount(0); // reset teller bij openen
  };

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, right: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  const dropdownPosition = getDropdownPosition();

  return (
    <div className="relative" ref={buttonRef}>
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

      {/* Dropdown - rendered as portal */}
      {open && mounted && createPortal(
        <div
          id="notification-dropdown"
          className="fixed w-72 bg-white dark:bg-gray-900 shadow-xl rounded-lg p-3 z-[9999] border border-gray-200 dark:border-gray-700"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
          }}
        >
          {requests.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No new requests
            </p>
          ) : (
            requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-brand-orange">@{r.sender?.username}</span> sent a friend request
                </span>
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default HeaderNotification;

