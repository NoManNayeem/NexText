"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiSearch,
  FiMessageCircle,
} from "react-icons/fi";

export default function Navbar({ currentUser, onLogout }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isChatPage = pathname.startsWith("/chat");
  const toggleMobile = () => setMobileOpen((prev) => !prev);

  const NavWrapper = ({ children }) => (
    <nav className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
      {children}
    </nav>
  );

  const Logo = () => (
    <Link href="/" className="flex items-center gap-2">
      <FiMessageCircle className="text-2xl text-blue-600 dark:text-blue-400" />
      <span className="font-extrabold text-2xl text-blue-600 dark:text-blue-300">
        NexText
      </span>
    </Link>
  );

  const SearchBar = () =>
    isChatPage && (
      <div className="relative w-full max-w-xs">
        <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>
    );

  const UserInfo = () => (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
        {currentUser.username.charAt(0).toUpperCase()}
      </span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {currentUser.username}
      </span>
      <button
        onClick={onLogout}
        title="Logout"
        aria-label="Logout"
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <FiLogOut className="text-xl text-red-500" />
      </button>
    </div>
  );

  const AuthLinks = () => (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="px-5 py-2 rounded-full border border-blue-600 text-blue-600 text-sm hover:bg-blue-50 transition"
      >
        Register
      </Link>
    </div>
  );

  return (
    <header className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-md sticky top-0 z-50 transition-colors duration-300">
      <NavWrapper>
        <Logo />
        <button
          onClick={toggleMobile}
          className="md:hidden text-2xl text-gray-600 dark:text-gray-300 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="hidden md:flex items-center gap-6">
          {currentUser ? (
            <>
              <SearchBar />
              <UserInfo />
            </>
          ) : (
            <AuthLinks />
          )}
        </div>
      </NavWrapper>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-4 pb-4 space-y-4">
          {currentUser ? (
            <>
              <SearchBar />
              <UserInfo />
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <AuthLinks />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
