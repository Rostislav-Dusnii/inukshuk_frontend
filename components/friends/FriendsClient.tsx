"use client";

import React, { useEffect, useState, useRef } from "react";
import FriendList from "./FriendsList";
import FriendRequests from "./FriendRequests";
import FriendService from "@services/FriendService";
import { GetFriends, GetFriendRequests } from "@types";
import SearchFriends from "./FriendSearch";
import { useRouter } from "next/navigation";

const FriendsClient: React.FC = () => {
  const [friends, setFriends] = useState<GetFriends[]>([]);
  const [requests, setRequests] = useState<GetFriendRequests[]>([]);
  const userIdRef = useRef<number | null>(null);
  const router = useRouter();

  const loadFriends = async (userId: number) => {
    try {
      const data = await FriendService.getFriendsForUser(userId);
      setFriends(data ?? []);
    } catch (error) {
      console.error("Failed to load friends", error);
    }
  };

  const loadRequests = async (userId: number) => {
    try {
      const data = await FriendService.getFriendRequests(
        userId,
        "all",
        "PENDING"
      );
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load friend requests", error);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("loggedInUser");
    if (!stored) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(stored);
    const userId = parsed.userId;
    userIdRef.current = userId;

    loadFriends(userId);
    loadRequests(userId);

    const requestsInterval = setInterval(() => {
      loadRequests(userId);
    }, 40000);

    const friendsInterval = setInterval(() => {
      loadFriends(userId);
    }, 40000);

    return () => {
      clearInterval(requestsInterval);
      clearInterval(friendsInterval);
    };
  }, []);

  const handleAccept = async (id: number) => {
    if (!userIdRef.current) return;

    setRequests((prev) => prev.filter((r) => r.id !== id));

    try {
      await FriendService.acceptFriendRequest(id, userIdRef.current);
      await loadFriends(userIdRef.current);
    } catch (error) {
      console.error("Failed to accept friend request", error);
      await loadRequests(userIdRef.current);
      await loadFriends(userIdRef.current);
    }
  };

  const handleDecline = async (id: number) => {
    if (!userIdRef.current) return;

    setRequests((prev) => prev.filter((r) => r.id !== id));

    try {
      await FriendService.rejectFriendRequest(id, userIdRef.current);
    } catch (error) {
      console.error("Failed to decline friend request", error);
      await loadRequests(userIdRef.current);
    }
  };

  const handleSendRequest = async (targetUserId: number) => {
    if (!userIdRef.current) return;

    setRequests((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: { id: userIdRef.current },
        receiver: { id: targetUserId },
        status: "PENDING",
      } as GetFriendRequests,
    ]);

    try {
      await FriendService.sendFriendRequest(userIdRef.current, targetUserId);
      await loadRequests(userIdRef.current);
    } catch (error) {
      console.error("Failed to send friend request", error);
      await loadRequests(userIdRef.current);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!userIdRef.current) return;

    setFriends((prev) => prev.filter((f) => f.id !== friendId));

    try {
      await FriendService.removeFriend(userIdRef.current, friendId);
    } catch (error) {
      console.error("Failed to remove friend", error);
      await loadFriends(userIdRef.current);
    }
  };

  const friendIds = friends.map((f) => f.id);
  const outgoingRequestIds = requests
    .filter((r) => r.sender?.id === userIdRef.current && r.status === "PENDING")
    .map((r) => r.receiver?.id);
  const incomingRequestIds = requests
    .filter(
      (r) => r.receiver?.id === userIdRef.current && r.status === "PENDING"
    )
    .map((r) => r.sender?.id);
  const rejectedRequestIds = requests
    .filter(
      (r) =>
        (r.sender?.id === userIdRef.current ||
          r.receiver?.id === userIdRef.current) &&
        r.status === "REJECTED"
    )
    .map((r) =>
      r.receiver?.id === userIdRef.current ? r.sender?.id : r.receiver?.id
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="bg-orange-50 dark:bg-orange-100 border border-orange-200 dark:border-orange-300 rounded-xl shadow-md p-6">
        <SearchFriends
          searchFunction={(query) =>
            userIdRef.current
              ? FriendService.searchUsers(userIdRef.current, query)
              : Promise.resolve([])
          }
          onSendRequest={handleSendRequest}
          friendIds={friendIds}
          outgoingRequestIds={outgoingRequestIds}
          incomingRequestIds={incomingRequestIds}
          rejectedRequestIds={rejectedRequestIds}
          currentUserId={userIdRef.current}
        />
      </div>
      <hr className="border-t border-gray-300 dark:border-gray-700 my-6" />

      <div className="bg-orange-50 dark:bg-orange-100 border border-orange-200 dark:border-orange-300 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-brand-orange flex items-center gap-2">
          <svg
            className="w-5 h-5 text-brand-orange"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9h2v5H9V9zm0-4h2v2H9V5z" />
          </svg>
          My Friends
        </h2>

        {friends.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            You have no friends yet. Start connecting!
          </p>
        ) : (
          <FriendList friends={friends} onRemoveFriend={handleRemoveFriend} />
        )}
      </div>
      <hr className="border-t border-gray-300 dark:border-gray-700 my-6" />

      <div className="bg-orange-50 dark:bg-orange-100 border border-orange-200 dark:border-orange-300 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-brand-orange flex items-center gap-2">
          <svg
            className="w-5 h-5 text-brand-orange"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9h2v5H9V9zm0-4h2v2H9V5z" />
          </svg>
          Friend Requests
        </h2>

        <FriendRequests
          requests={requests}
          onAccept={handleAccept}
          onDecline={handleDecline}
          currentUserId={userIdRef.current}
        />
      </div>
    </div>
  );
};

export default FriendsClient;
