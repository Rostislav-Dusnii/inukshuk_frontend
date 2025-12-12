import React from "react";
import { Hint } from "@types";
import { Lightbulb, Check, Trash2 } from "lucide-react";

interface HintListProps {
  hints: Hint[];
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
  selectedHintId?: number;
}

export const HintList: React.FC<HintListProps> = ({
  hints,
  onActivate,
  onDelete,
  selectedHintId,
}) => {
  return (
    <ul className="space-y-2">
      {hints.map((hint) => (
        <li
          key={hint.id}
          onClick={() => onActivate(hint.id)}
          className={`relative p-3 rounded-md cursor-pointer transition 
            ${
              hint.active
                ? "border-4 border-brand-green-light bg-white dark:bg-gray-900 dark:border-brand-green-light"
                : "border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb
                className={`w-5 h-5 ${
                  hint.active
                    ? "text-brand-green-light"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {hint.title}
              </h3>
            </div>

            {!hint.active && hint.id !== selectedHintId && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(hint.id);
                }}
                className="flex items-center justify-center cursor-pointer 
             text-brand-orange hover:text-brand-orange-dark 
             dark:text-brand-orange-dark dark:hover:text-brand-orange-darker"
              >
                <Trash2 className="w-5 h-5" />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            {hint.content}
          </p>

          {hint.active && (
            <Check className="absolute top-2 right-2 w-5 h-5 text-brand-green-light" />
          )}
        </li>
      ))}
    </ul>
  );
};


