"use client";

import { GetFriends } from "@types";
import React from "react";
import { Trash2 } from "lucide-react";

type Props = {
  friends: GetFriends[];
  onRemoveFriend?: (friendId: number) => void;
};

const FriendsList: React.FC<Props> = ({ friends, onRemoveFriend }) => {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {friends.map((f) => (
        <li
          key={f.id}
          className="flex justify-between items-center py-3 px-4 
                     bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg 
                     hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {/* Naam + username */}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {f.firstName} {f.lastName}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              @{f.username}
            </span>
          </div>

          <div
            onClick={() => onRemoveFriend && onRemoveFriend(f.id)}
            className="cursor-pointer text-brand-orange hover:text-brand-orange-darker"
          >
            <Trash2 className="w-6 h-6" strokeWidth={2.5} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FriendsList;
