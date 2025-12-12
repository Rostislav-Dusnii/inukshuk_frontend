"use client";

import React, { useEffect, useState } from "react";
import AccessDenied from "./AccessDenied";
import AdminLayout from "./AdminLayout";

interface AdminClientPageProps {
  children?: React.ReactNode;
}

const AdminClientPage: React.FC<AdminClientPageProps> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString) {
      const loggedInUser = JSON.parse(loggedInUserString);
      setRole(loggedInUser.role);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!role || role.toUpperCase() !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <AdminLayout>
      {children || (
        <div>
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to the admin panel. Use the sidebar to navigate.
          </p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminClientPage;
