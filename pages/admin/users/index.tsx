import React from "react";
import UserSettings from "@components/admin/UserSettings";
import AdminClientPage from "@components/admin/AdminClientPage";

const UserSettingsPage: React.FC = () => {
  return (
    <>
      <AdminClientPage>
        <UserSettings />
      </AdminClientPage>
    </>
  );
};

export default UserSettingsPage;
