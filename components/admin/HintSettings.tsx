import React, { useEffect, useState } from "react";
import HintService from "@services/AdminService";
import AdminService from "@services/AdminService";
import { Hint, HintInputDto } from "@types";
import AddHintForm from "./AddHintForm";
import { HintList } from "./HintList";

export const HintManager: React.FC = () => {
  const [hints, setHints] = useState<Hint[]>([]);

  const loadHints = () => {
    HintService.getHints()
      .then(setHints)
      .catch((err) => console.error("Failed to load hints", err));
  };

  useEffect(() => {
    loadHints();
  }, []);

  const handleAdd = async (input: HintInputDto) => {
    await HintService.addHint(input);
    loadHints();
  };

  const handleActivate = async (id: number) => {
    await HintService.activateHint(id);
    loadHints();
  };

  const handleDelete = async (id: number) => {
    await AdminService.deleteHint(id);
    loadHints();
  };

  return (
    <div className="space-y-6">
      <AddHintForm onAdd={handleAdd} />
      <HintList
        hints={hints}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />
    </div>
  );
};
