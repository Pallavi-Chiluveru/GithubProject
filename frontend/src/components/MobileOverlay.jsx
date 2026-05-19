import React from 'react';
import { motion } from 'framer-motion';

const MobileOverlay = ({ isOpen, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      onClick={onClose}
    />
  );
};

export default MobileOverlay;
