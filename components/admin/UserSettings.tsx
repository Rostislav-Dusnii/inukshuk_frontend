import React from "react";
import DeleteAllUsers from "./DeleteAllUsers";
import { useTranslation } from "next-i18next";


const UserSettings: React.FC = () => {
  const { t } = useTranslation("common");
  return (
    <div style={{ padding: "20px" }}>
      <h1>{t("admin.user_settings")}</h1>
      <DeleteAllUsers />
    </div>
  );
};

export default UserSettings;


