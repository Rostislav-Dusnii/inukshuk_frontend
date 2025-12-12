"use client";

import { UserFormatFriendRequest } from "@types";
import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  searchFunction: (query: string) => Promise<UserFormatFriendRequest[]>;
  onSendRequest: (userId: number) => void;
  friendIds: number[];
  outgoingRequestIds: number[];
  incomingRequestIds: number[];
  rejectedRequestIds: number[];
  currentUserId: number | null;
};

const SearchFriends: React.FC<Props> = ({
  searchFunction,
  onSendRequest,
  friendIds,
  outgoingRequestIds,
  incomingRequestIds,
  rejectedRequestIds,
  currentUserId,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserFormatFriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const users = await searchFunction(q);
        setResults(users.filter((u) => u.id !== currentUserId));
      } catch (error) {
        console.error("searchFunction failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, searchFunction, currentUserId]);

  const getStatus = (userId: number) => {
    if (friendIds.includes(userId)) return "FRIEND";
    if (outgoingRequestIds.includes(userId)) return "PENDING";
    if (incomingRequestIds.includes(userId)) return "INCOMING";
    if (rejectedRequestIds.includes(userId)) return "REJECTED";
    return "NONE";
  };

  const handleSendRequest = (userId: number) => {
    onSendRequest(userId);
  };

  const showIdle = query.trim() === "";
  const showLoading = loading;
  const showNoResults = !loading && query.trim() !== "" && results.length === 0;
  const showResults = !loading && results.length > 0;

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-brand-orange-lighter 
                 rounded-xl shadow-sm p-4 space-y-4"
    >
      {/* Zoekveld */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 rounded-md bg-white dark:bg-gray-800 
                     text-sm text-brand-green-darker placeholder-brand-orange 
                     border border-transparent px-4 pr-10
                     focus:outline-none focus:ring-2 focus:ring-brand-orange-lighter"
        />
        {/* Zoek-icoon */}
        <svg
          className="absolute right-3 top-2.5 w-5 h-5 text-brand-orange"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 17a6 6 0 100-12 6 6 0 000 12z"
          />
        </svg>
      </div>

      {/* Resultaatcontainer */}
      <div className="min-h-[220px] rounded-lg border border-brand-orange-lighter/50 p-2">
        {showIdle && (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Image
              src="/images/new.png"
              alt="Idle logo"
              width={120}
              height={120}
              className="mb-3 opacity-70"
              priority
            />
            <p className="text-sm text-brand-orange-lighter">Type to search…</p>
          </div>
        )}

        {showLoading && (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-brand-orange-lighter">Loading…</p>
          </div>
        )}

        {showNoResults && (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Image
              src="/images/new.png"
              alt="No results logo"
              width={120}
              height={120}
              className="mb-3 opacity-70"
              priority
            />
            <p className="text-sm text-brand-orange-lighter">No users found</p>
          </div>
        )}

        {showResults && (
          <ul className="max-h-[300px] overflow-y-auto divide-y divide-brand-orange-lighter dark:divide-brand-orange-darker">
            {results.map((user) => {
              const status = getStatus(user.id!);
              return (
                <li
                  key={user.id}
                  className="flex justify-between items-center py-3 px-2 
                             hover:bg-brand-orange-lighter/30 dark:hover:bg-brand-orange-darker/30 
                             transition-colors rounded-md"
                >
                  {/* Naam + username */}
                  <div className="flex flex-col">
                    <span className="font-medium text-brand-green-darker">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-sm text-brand-orange-darker">
                      @{user.username}
                    </span>
                  </div>

                  {/* Status / actie */}
                  {status === "NONE" && (
                    <button
                      className="px-3 py-1 text-sm rounded-md 
                                 bg-brand-orange text-white 
                                 hover:bg-brand-orange-darker transition"
                      onClick={() => handleSendRequest(user.id!)}
                    >
                      Send Request
                    </button>
                  )}

                  {status === "PENDING" && (
                    <span className="text-brand-orange font-semibold">
                      Pending
                    </span>
                  )}

                  {status === "FRIEND" && (
                    <span className="text-brand-green font-semibold">
                      Friend
                    </span>
                  )}

                  {status === "INCOMING" && (
                    <span className="text-brand-green-darker font-semibold">
                      Incoming
                    </span>
                  )}

                  {status === "REJECTED" && (
                    <span className="text-red-500 font-semibold">Rejected</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchFriends;
