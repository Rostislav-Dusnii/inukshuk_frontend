import React, { useEffect, useState } from "react";
import EventCodeService from "@services/AdminService";
import { EventCode } from "@types";
import { useTranslation } from "next-i18next";


const EventCodeSettings: React.FC = () => {
  const [eventCode, setEventCode] = useState<EventCode | null>(null);
  const [newCode, setNewCode] = useState("");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    EventCodeService.getEventCode().then(setEventCode);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newCode || newCode.length < 4) {
      setError(t("admin.eventCodeMinLength"));
      return;
    }

    setShowConfirm(true);
  };

  const confirmUpdate = async () => {
    const updated = await EventCodeService.updateEventCode({ code: newCode });
    setEventCode(updated);
    setNewCode("");
    setShowConfirm(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
      <h1 className="text-3xl font-extrabold text-center mb-6 tracking-wide">
        <span className="text-brand-orange-dark">{t("admin.event_code.title").split(" ")[0]}{" "}</span>
        <span className="text-brand-green-dark">{t("admin.event_code.title").split(" ")[1]}{" "}</span>
        <span className="text-gray-800 dark:text-gray-100">{t("admin.event_code.title").split(" ")[2]}</span>
      </h1>

      {eventCode && (
        <p className="mb-6 text-gray-700 dark:text-gray-300 text-center text-xl">
          <strong>{t("admin.event_code.current")}</strong>{" "}
          <span className="text-brand-green-dark font-bold text-xl dark:text-white">
            {eventCode.code}
          </span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 mb-8">
        <div>
          <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t("admin.event_code.new_code")}
          </label>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.replace(/\s/g, ""))}
            placeholder={t("admin.event_code.placeholder")}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition
              ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-brand-green"
              }
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-brand-green hover:bg-brand-green-dark border border-brand-green text-white font-semibold rounded-lg shadow transition"
        >
          {t("admin.event_code.update")}
        </button>
      </form>

      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-5 bg-brand-orange-lighter dark:bg-brand-orange-dark/30">
        <h3 className="text-lg font-semibold text-brand-orange-dark mb-3">
          {t("admin.event_code.requirements")}
        </h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>{t("admin.event_code.req_length")}</li>
          <li>{t("admin.event_code.req_content")}</li>
        </ul>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
              {t("admin.event_code.confirm_title")}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t("admin.event_code.confirm_message")}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {t("admin.event_code.cancel")}
              </button>
              <button
                onClick={confirmUpdate}
                className="px-4 py-2 bg-brand-green border border-brand-green text-white rounded-lg hover:bg-brand-green-dark transition"
              >
                {t("admin.event_code.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCodeSettings;


