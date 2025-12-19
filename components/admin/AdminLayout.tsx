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
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Desktop Sidebar - hidden on mobile */}
        <nav
          className="hidden md:flex w-64 bg-background text-foreground p-4 flex-shrink-0 flex-col justify-between
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

        {/* Main content - adjusted padding for mobile bottom nav */}
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6 bg-background text-foreground">
          {children}
        </main>

        {/* Mobile Bottom Navigation - visible only on mobile */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 text-foreground
             border-t border-gray-200 dark:border-white dark:border-opacity-20 z-50"
        >
          <ul className="flex justify-around items-center py-3">
            <li>
              <Link
                href="/admin/event-code-settings"
                className="flex flex-col items-center gap-1 px-3 py-1 rounded hover:bg-popover transition"
              >
                <Lock className="w-6 h-6 text-brand-orange-dark" />
                <span className="text-xs font-semibold">Code</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/hints"
                className="flex flex-col items-center gap-1 px-3 py-1 rounded hover:bg-popover transition"
              >
                <Lightbulb className="w-6 h-6 text-brand-orange-dark" />
                <span className="text-xs font-semibold">Hints</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="flex flex-col items-center gap-1 px-3 py-1 rounded hover:bg-popover transition"
              >
                <User className="w-6 h-6 text-brand-orange-dark" />
                <span className="text-xs font-semibold">Users</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
