import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';


const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  //const { t } = useTranslation("common");
  return (
    <Link
      href="#"
      onClick={(e) => {
        e.preventDefault();
        toggleTheme();
      }}
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm hover:shadow-md h-[38px]"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5 text-brand-orange" />
      ) : (
        <Sun className="w-5 h-5 text-brand-orange" />
      )}
    </Link>
  );
};

export default ThemeToggle;
