// import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// import { useTranslation } from "next-i18next";
// import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// const { t } = useTranslation();

const dateToString = (date: Date, language: string): string => {
    date = new Date(date);
    let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let month = new Intl.DateTimeFormat(language, { month: 'long' }).format(date);
    let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    let hour = new Intl.DateTimeFormat('eu', { hour: '2-digit' }).format(date);
    let minute = new Intl.DateTimeFormat('eu', { minute: '2-digit' }).format(date);

    return `${day} ${month} ${year} at ${hour}:${minute}`;
}

const Util = {
    dateToString
};

// export const getServerSideProps = async (context: { locale: any }) => {
//   const { locale } = context;

//   return {
//     props: {
//       ...(await serverSideTranslations(locale ?? 'en', ['common'])),
//     },
//   };
// };
   
export default Util;