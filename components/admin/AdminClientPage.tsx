"use client";

import React, { useEffect, useState } from "react";
import AccessDenied from "./AccessDenied";
import AdminLayout from "./AdminLayout";
import { useTranslation } from "next-i18next";
// import { serverSideTranslations } from "next-i18next/serverSideTranslations";
// import { GetStaticProps } from "next";

interface AdminClientPageProps {
  children?: React.ReactNode;
}

const AdminClientPage: React.FC<AdminClientPageProps> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("common");

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString) {
      const loggedInUser = JSON.parse(loggedInUserString);
      setRole(loggedInUser.role);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>{t("common.loading")}...</div>;
  }

  if (!role || role.toUpperCase() !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <AdminLayout>
      {children || (
        <div>
          <h1 className="text-3xl font-bold mb-4">{t("admin.dashboard")}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("admin.welcomeMessage")}
          </p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminClientPage;

