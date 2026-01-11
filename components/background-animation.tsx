"use client";

import { motion } from "framer-motion";

export function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(white,transparent_85%)]" />
      
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-px bg-blue-400 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: "100%",
            opacity: Math.random() * 0.4 + 0.2,
            scale: Math.random() * 2 + 1
          }}
          animate={{
            y: "-100%",
            x: `${Math.random() * 100}%`
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * -20
          }}
        />
      ))}
    </div>
  );
}