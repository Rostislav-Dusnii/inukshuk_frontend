import Header from "@components/header";
import FriendsClient from "@components/friends/FriendsClient";
import { useTranslation } from "next-i18next";

export default function FriendsPage() {
  const { t } = useTranslation("common");
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-5xl font-extrabold mb-8 tracking-wide">
          <span className="text-brand-orange">{t("friends.title").substring(0,t("friends.title").length/2)}</span>
          <span className="text-brand-green">{t("friends.title").substring(t("friends.title").length/2)}</span>
        </h1>

        <FriendsClient />
      </main>
    </>
  );
}

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
