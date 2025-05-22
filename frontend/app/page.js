"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMessageCircle,
  FiShield,
  FiFeather,
} from "react-icons/fi";

// Feature data
const features = [
  {
    icon: <FiMessageCircle className="text-5xl text-blue-600 dark:text-blue-400 mb-4" />,
    title: "Instant Messaging",
    text: "Real‐time chat powered by WebSockets—messages delivered instantly.",
  },
  {
    icon: <FiShield className="text-5xl text-blue-600 dark:text-blue-400 mb-4" />,
    title: "Secure",
    text: "JWT authentication keeps your conversations private and protected.",
  },
  {
    icon: <FiFeather className="text-5xl text-blue-600 dark:text-blue-400 mb-4" />,
    title: "Lightweight",
    text: "Minimal dependencies, fast load times, and a clean, intuitive UI.",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggeredContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <section className="flex flex-col items-center justify-center flex-1 px-6 py-28 bg-gradient-to-b from-gray-900 to-gray-950 transition-colors duration-300">
      
      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-2xl text-center"
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-600 dark:text-blue-400 mb-6 leading-tight">
          Connect in Real Time
        </h1>
        <p className="text-xl sm:text-2xl text-gray-300 dark:text-gray-400 mb-12">
          Secure, lightweight chat built with Next.js & FastAPI. Start talking instantly — no setup required.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
          >
            Log In
          </Link>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggeredContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
      >
        {features.map((feature, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md hover:shadow-xl transition-shadow"
          >
            {feature.icon}
            <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100 text-center">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {feature.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
