import Link from "next/link";
import Header from "@components/header";
import { Lock, Lightbulb, User } from "lucide-react";
import { useTranslation } from "next-i18next";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation("common");
  return (
    <>
      <Header />
      <div className="flex h-full overflow-hidden">
        <nav
          className="w-64 bg-background text-foreground p-4 flex-shrink-0 flex flex-col justify-between
             border-r border-gray-200 dark:border-white dark:border-opacity-20"
        >
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold mb-8 text-brand-green-dark text-center dark:text-brand-orange">
              {t("admin.title")}
            </h2>

            <ul className="space-y-2">
              <li className="grid grid-cols-[1fr_24px] items-center px-2 py-2 rounded hover:bg-popover transition">
                <Link
                  href="/admin/event-code-settings"
                  className="font-semibold"
                >
                  {t("admin.registration_code")}
                </Link>
                <Lock className="w-6 h-6 justify-self-end text-brand-orange-dark" />
              </li>

              <li className="grid grid-cols-[1fr_24px] items-center px-2 py-2 rounded hover:bg-popover transition">
                <Link href="/admin/hints" className="font-semibold">
                  {t("admin.hint_settings")}
                </Link>
                <Lightbulb className="w-6 h-6 justify-self-end text-brand-orange-dark" />
              </li>
              <li className="grid grid-cols-[1fr_24px] items-center px-2 py-2 rounded hover:bg-popover transition">
                <Link href="/admin/users" className="font-semibold">
                  {t("admin.user_settings")}
                </Link>
                <User className="w-6 h-6 justify-self-end text-brand-orange-dark" />
              </li>
            </ul>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto p-6 bg-background text-foreground">
          {children}
        </main>
      </div>
    </>
  );
}
