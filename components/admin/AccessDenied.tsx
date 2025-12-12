import { useRouter } from "next/router";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "next-i18next";

 import { GetStaticProps } from "next";
const AccessDenied: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Icon + Titel */}
      <div className="flex items-center space-x-4 mb-10">
        <AlertTriangle className="w-20 h-20 text-red-600" />
        <h1 className="text-6xl font-extrabold text-red-600 tracking-wide dark:text-red-600">
          {t("accessDenied.title")}
        </h1>
      </div>

      {/* Subtekst */}
      <p className="text-2xl text-gray-700 mb-12 text-center max-w-2xl">
        {t("accessDenied.message")}
      </p>

      {/* Go Back knop */}
      <button
        onClick={() => router.back()}
        className="px-8 py-4 bg-brand-green border border-brand-green text-white text-2xl font-bold rounded-xl shadow-lg hover:bg-brand-green-dark transition"
      >
        {t("accessDenied.goBack")}
      </button>
    </div>
  );
};

export default AccessDenied;


