import React, { useState } from "react";
import AdminService from "@services/AdminService";

const DeleteAllUsers: React.FC = () => {
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setError(err.message || "An unexpected error occurred.");
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
      <h1 className="text-3xl font-extrabold text-center mb-6 tracking-wide">
        <span className="text-brand-orange-dark">DELETE </span>
        <span className="text-brand-green-dark">USERS </span>
        <span className="text-gray-800 dark:text-gray-100">SETTINGS</span>
      </h1>

      <p className="mb-6 text-gray-700 dark:text-gray-300 text-center text-xl">
        <strong>Action:</strong>{" "}
        <span className="text-brand-green-dark font-bold text-xl dark:text-white">
          Delete all users with role USER
        </span>
      </p>

      {error && (
        <div className="mb-4 p-3 border border-red-500 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 border border-brand-green bg-brand-green-lighter text-brand-green-dark rounded-lg">
          ✅ All users with role USER have been deleted.
        </div>
      )}

      <button
        onClick={handleDeleteClick}
        className="w-full py-3 bg-brand-green hover:bg-brand-green-dark border border-brand-green text-white font-semibold rounded-lg shadow transition"
      >
        Delete All Users
      </button>

      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-5 mt-8 bg-brand-orange-lighter dark:bg-brand-orange-dark/30">
        <h3 className="text-lg font-semibold text-brand-orange-dark mb-3">
          Delete Action Requirements
        </h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>This will remove all users with role USER</li>
          <li>Action cannot be undone</li>
        </ul>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
              Confirm Delete
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete all users with role USER?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-brand-green border border-brand-green text-white rounded-lg hover:bg-brand-green-dark transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAllUsers;
