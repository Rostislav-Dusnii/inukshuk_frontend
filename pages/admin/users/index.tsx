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

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
