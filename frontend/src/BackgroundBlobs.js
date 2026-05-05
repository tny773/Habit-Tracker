import React from "react";
import { motion } from "framer-motion";

function BackgroundBlobs() {
  return (
    <>
      {/* Blob 1 */}
      <motion.div
        style={blob1}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 2 */}
      <motion.div
        style={blob2}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 3 */}
      <motion.div
        style={blob3}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}

/* 🎨 BLOBS */
const baseBlob = {
  position: "fixed",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  filter: "blur(80px)",
  zIndex: 0,
};

const blob1 = {
  ...baseBlob,
  top: "10%",
  left: "10%",
  background: "#d8a7b1",
};

const blob2 = {
  ...baseBlob,
  top: "60%",
  right: "10%",
  background: "#c9d6ea",
};

const blob3 = {
  ...baseBlob,
  bottom: "10%",
  left: "40%",
  background: "#fbc2eb",
};

export default BackgroundBlobs;