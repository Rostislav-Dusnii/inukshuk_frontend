import MapClientPage from "@components/map/MapClientPage";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

export default function MapPage() {
    return (
        <>
            <Head>
                <title>Map</title>
            </Head>
            <MapClientPage />
        </>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en", ["common"])),
        },
    };
};
