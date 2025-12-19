import AdminClientPage from "@components/admin/AdminClientPage";

const AdminPage: React.FC = () => {
    return <AdminClientPage />;
};

export default AdminPage;

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};