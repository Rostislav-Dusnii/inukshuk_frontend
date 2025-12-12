import React, { useState } from "react";
import AdminService from "@services/AdminService";
import { useTranslation } from "next-i18next";

const DeleteAllUsers: React.FC = () => {
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation("common");

  const handleDeleteClick = () => {
    setError("");
    setSuccess(false);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await AdminService.deleteAllUsersWithRoleUser();
      setShowConfirm(false);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("errors.generic"));
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
      <h1 className="text-3xl font-extrabold text-center mb-6 tracking-wide">
        <span className="text-brand-orange-dark">
          {t("admin.users.title").split(" ")[0]}{" "}
        </span>
        <span className="text-brand-green-dark">
          {t("admin.users.title").split(" ")[1]}{" "}
        </span>
        <span className="text-gray-800 dark:text-gray-100">
          {t("admin.users.title").split(" ")[2]}
        </span>
      </h1>

      <p className="mb-6 text-gray-700 dark:text-gray-300 text-center text-xl">
        <strong>{t("admin.users.action")}:</strong>{" "}
        <span className="text-brand-green-dark font-bold text-xl dark:text-white">
          {t("admin.users.info")}
        </span>
      </p>

      {error && (
        <div className="mb-4 p-3 border border-red-500 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 border border-brand-green bg-brand-green-lighter text-brand-green-dark rounded-lg">
          {t("admin.users.success")}
        </div>
      )}

      <button
        onClick={handleDeleteClick}
        className="w-full py-3 bg-brand-green hover:bg-brand-green-dark border border-brand-green text-white font-semibold rounded-lg shadow transition"
      >
        {t("admin.users.delete_all")}
      </button>

      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-5 mt-8 bg-brand-orange-lighter dark:bg-brand-orange-dark/30">
        <h3 className="text-lg font-semibold text-brand-orange-dark mb-3">
          {t("admin.users.requirement")}
        </h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>{t("admin.users.more_info")}</li>
          <li>{t("admin.users.warning")}</li>
        </ul>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
              {t("common.confirm")}
              {t("common.delete")}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t("admin.users.confirm_delete")}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-brand-green border border-brand-green text-white rounded-lg hover:bg-brand-green-dark transition"
              >
                {t("common.yes")}, {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAllUsers;
