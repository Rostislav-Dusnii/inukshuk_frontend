"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import FriendService from "@services/FriendService";
import { GetFriends, GetFriendRequests } from "@types";


type FriendsContextValue = {
  userId: number | null;
  friends: GetFriends[];
  requests: GetFriendRequests[];
  refreshAll: () => Promise<void>;
  accept: (requestId: number) => Promise<void>;
  decline: (requestId: number) => Promise<void>;
};

const FriendsContext = createContext<FriendsContextValue | undefined>(
  undefined
);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [friends, setFriends] = useState<GetFriends[]>([]);
  const [requests, setRequests] = useState<GetFriendRequests[]>([]);
  const userIdRef = useRef<number | null>(null);

  
  const refreshAll = async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    const [f, r] = await Promise.all([
      FriendService.getFriendsForUser(uid),
      FriendService.getFriendRequests(uid, "incoming", "PENDING"),
    ]);
    setFriends(Array.isArray(f) ? f : []);
    setRequests(Array.isArray(r) ? r : []);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("loggedInUser");
    if (!stored) return;
    const parsed = JSON.parse(stored);
    userIdRef.current = parsed.userId;
    refreshAll();

    // lichte polling om in sync te blijven zonder UI-sprongen
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const accept = async (requestId: number) => {
    const uid = userIdRef.current;
    if (!uid) return;
    // Optimistisch: verwijder meteen uit requests
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await FriendService.acceptFriendRequest(requestId, uid);
      // vriendenlijst kan veranderen → refresh friends, requests blijven al optimistisch juist
      const f = await FriendService.getFriendsForUser(uid);
      setFriends(Array.isArray(f) ? f : []);
    } catch (e) {
      // bij fout kun je eventueel herladen om te herstellen
      refreshAll();
    }
  };

  const decline = async (requestId: number) => {
    const uid = userIdRef.current;
    if (!uid) return;
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await FriendService.rejectFriendRequest(requestId, uid);
    } catch (e) {
      refreshAll();
    }
  };

  const value: FriendsContextValue = {
    userId: userIdRef.current,
    friends,
    requests,
    refreshAll,
    accept,
    decline,
  };

  return (
    <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error("useFriends must be used within FriendsProvider");
  return ctx;
};


