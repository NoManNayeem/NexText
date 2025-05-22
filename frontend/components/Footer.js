export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {currentYear} NexText. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
