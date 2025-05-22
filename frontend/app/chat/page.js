"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { FiSearch } from "react-icons/fi";
import { FiMessageSquare } from "react-icons/fi";

export default function ChatIndexPage() {
  const { currentUser, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        const others = data.filter((u) => u.id !== currentUser?.id);
        setUsers(others);
        setFilteredUsers(others);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchUsers();
  }, [currentUser, logout]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter((u) =>
      u.username.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  if (!currentUser && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-800 dark:text-gray-300">
          You must be logged in to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-10 bg-gray-50 dark:bg-gray-900 max-w-4xl mx-auto w-full transition-colors duration-300">
      {/* Search Bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute top-3.5 left-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-12 pr-4 py-3 text-base rounded-full border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* User Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-850 rounded-xl shadow">
        {loading ? (
          <p className="p-6 text-center text-gray-600 dark:text-gray-400">
            Loading contacts…
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-6 text-center text-gray-600 dark:text-gray-400">
            No users found.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  className={idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                >
                  <td className="px-6 py-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 flex items-center justify-center font-bold uppercase">
                      {user.username.charAt(0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium truncate">{user.username}</td>
                  <td className="px-6 py-4 truncate text-gray-500 dark:text-gray-400">{user.id}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/chat/${user.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      <FiMessageSquare className="text-base" />
                      Chat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
