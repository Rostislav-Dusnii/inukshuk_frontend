import AdminClientPage from "@components/admin/AdminClientPage";
import EventCodeSettings from "@components/admin/EventcodeSettings";

const EventCodeSettingsPage: React.FC = () => {
  return (
    <AdminClientPage>
      <EventCodeSettings />
    </AdminClientPage>
  );
};

export default EventCodeSettingsPage;

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};
