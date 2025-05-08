"use client";

import Link from "next/link";

import { ArrowLeft, CheckCircle, Gift, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "~/components/ui/button";

export default function ThankYouPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const benefitVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.7 + i * 0.1,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const benefits = [
    "Unlimited fact checks",
    "Priority processing",
    "Advanced analytics",
    "Premium support",
  ];

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-white p-4 text-center">
      <motion.div
        className="relative w-full max-w-2xl space-y-8 rounded-3xl bg-white/90 p-10 shadow-2xl backdrop-blur-sm border border-orange-100 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
        }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-gradient-to-br from-amber-300 to-orange-500"></div>
          <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-amber-300 to-orange-500"></div>
        </div>

        {/* Glass effect strip */}
        <div className="absolute -right-10 top-32 h-40 w-[600px] rotate-12 bg-gradient-to-r from-white/10 via-amber-100/20 to-white/5 blur-md"></div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -left-12 -top-12 rotate-12 text-orange-300 hidden sm:block z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Gift className="h-16 w-16" />
        </motion.div>

        <motion.div
          className="absolute -right-8 bottom-20 -rotate-12 text-amber-400 hidden sm:block z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Sparkles className="h-10 w-10" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            {/* Success icon with animation */}
            <motion.div
              className="relative mx-auto mb-6"
              variants={itemVariants}
            >
              <motion.div
                className="absolute inset-0 -z-10"
                variants={pulseVariants}
                animate="pulse"
              >
                <div className="h-32 w-32 rounded-full bg-orange-400/20 blur-xl" />
              </motion.div>
              <motion.div
                className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg border border-white/30"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <CheckCircle className="h-14 w-14 text-white" />
              </motion.div>
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent mb-4">
                Thank You!
              </h1>

              {/* Main text */}
              <motion.p
                className="text-xl text-gray-700"
                variants={itemVariants}
              >
                Your Pro plan subscription has been{" "}
                <span className="font-medium text-orange-500">
                  successfully activated
                </span>
                .
              </motion.p>
            </motion.div>
          </div>

          <div className="md:col-span-3">
            {/* Benefits section */}
            <motion.div className="space-y-5 pt-2" variants={itemVariants}>
              <motion.div className="flex items-center justify-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-orange-100"></div>
                <motion.p className="font-medium text-gray-700 text-lg">
                  Pro Benefits
                </motion.p>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-orange-100"></div>
              </motion.div>

              <motion.ul className="space-y-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/50 p-6 backdrop-blur-sm border border-orange-100/50 shadow-sm">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center text-gray-700"
                    custom={index}
                    variants={benefitVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-orange-400/10 text-orange-500"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </motion.div>
                    <span className="font-medium text-base">{benefit}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </div>

        {/* Action button */}
        <motion.div className="pt-8" variants={itemVariants}>
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <Button className="group w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-500/90 hover:to-orange-600/90 transition-all duration-300 h-12 text-base">
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <span>Return to Dashboard</span>
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Additional message */}
        <motion.p
          className="text-sm text-gray-500 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Check your email for receipt and additional information
        </motion.p>
      </motion.div>

      {/* Confetti animation */}
      <motion.div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-2 w-2 rounded-full ${
              i % 3 === 0
                ? "bg-orange-400"
                : i % 3 === 1
                  ? "bg-amber-300"
                  : "bg-orange-200"
            }`}
            initial={{
              opacity: 0,
              x: Math.random() * window?.innerWidth,
              y: -20,
            }}
            animate={{
              opacity: [0, 1, 0],
              x: `calc(${Math.random() * window.innerWidth}px + ${(Math.random() - 0.5) * 200}px)`,
              y: window.innerHeight + 100,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              delay: 0.2 + i * 0.08,
              repeat: 2,
              repeatDelay: Math.random() * 3,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
