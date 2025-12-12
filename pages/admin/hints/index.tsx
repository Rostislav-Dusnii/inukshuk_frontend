import React from "react";
import AdminClientPage from "@components/admin/AdminClientPage";
import { HintManager } from "@components/admin/HintSettings";

//import { useTranslation } from "next-i18next"; 


const HintSettingsPage: React.FC = () => {
  return (
    <>
      <AdminClientPage>
        <HintManager />
      </AdminClientPage>
    </>
  );
};

export default HintSettingsPage;



import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
