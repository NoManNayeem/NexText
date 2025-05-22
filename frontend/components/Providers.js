"use client";

import { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// LayoutWrapper is UI-focused — separates structure from providers
function LayoutWrapper({ children }) {
  const { currentUser, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar currentUser={currentUser} onLogout={logout} />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}

// Providers wraps context providers around layout
export default function Providers({ children }) {
  return (
    <AuthProvider>
      <LayoutWrapper>{children}</LayoutWrapper>
    </AuthProvider>
  );
}
