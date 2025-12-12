import { useEffect, useState } from "react";
import ModalComponent from "./ModalComponent";
import React from "react";
import RewardsIconComponent from "./RewardsIconComponent";
import HintsService from "@services/HintService";
import { Hint } from "@types";

type Props = {
  counter: number;
  earnedReward: boolean;
  setEarnedReward: (value: boolean) => void;
};

const RewardsModalComponent: React.FC<Props> = ({
  counter,
  earnedReward,
  setEarnedReward,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeHint, setActiveHint] = useState<Hint | null>(null);

  useEffect(() => {
    if (!earnedReward && counter > 7) {
      setIsModalOpen(true);
      setEarnedReward(true);
    }
  }, [counter, earnedReward, setEarnedReward]);

  useEffect(() => {
    if (isModalOpen) {
      HintsService.getActiveHint()
        .then(setActiveHint)
        .catch((err) => console.error("Failed to fetch active hint", err));
    }
  }, [isModalOpen]);

  return (
    <>
      <ModalComponent
        title="Reward Earned"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="space-y-5">
          <div className="text-center py-4">
            <h3 className="text-3xl font-semibold text-brand-green dark:text-brand-green-light mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-xl text-brand-orange dark:text-brand-orange-light font-medium">
              You&apos;ve earned a hint
            </p>
          </div>

          {activeHint ? (
            <div className="bg-brand-orange-lighter/20 dark:bg-brand-orange/30 border-l-4 border-brand-orange dark:border-brand-orange-light p-4 rounded-r shadow-md">
              <div className="flex flex-row gap-2">
                <p className="text-lg text-brand-green dark:text-brand-green-light">
                  💡
                </p>
                <div>
                  <h4 className="text-lg font-semibold text-brand-green-dark dark:text-brand-green-light">
                    {activeHint.title}
                  </h4>
                  <p className="text-lg text-brand-green-dark dark:text-brand-green-light">
                    {activeHint.content}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No active hint available
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400 pt-2">
            <p>
              Note: You can access this message again by clicking the rewards icon in the bottom left corner.
            </p>
          </div>
        </div>
      </ModalComponent>
    </>)
}

export default RewardsModalComponent;
