import React from "react";
import AdminClientPage from "@components/admin/AdminClientPage";
import { HintManager } from "@components/admin/HintSettings";

const HintSettingsPage: React.FC = () => {
  return (
    <>
      <AdminClientPage>
        <HintManager />
      </AdminClientPage>
    </>
  );
};

export default HintSettingsPage;
