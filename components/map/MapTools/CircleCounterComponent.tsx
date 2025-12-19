import { useTranslation } from "next-i18next";

type Props = {
    counter: number
}

const CircleCounterComponent: React.FC<Props> = ({ counter }) => {
    const { t } = useTranslation("common");
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-0 md:py-3.5 md:px-4 shadow-sm border border-brand-orange/20 transition-all duration-300 hover:shadow-md hover:border-brand-orange w-full min-w-0 h-full">
            <div className="flex flex-col items-center justify-center gap-0.5 h-full">
                <p className="m-0 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 break-words text-center hidden md:block">{t("map.circleList.title")}</p>
                <p className="m-0 text-2xl font-bold bg-gradient-to-br from-brand-orange to-brand-orange-dark bg-clip-text text-transparent">
                    {counter}
                </p>
            </div>
        </div>
    )
}

export default CircleCounterComponent;