import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Bell, Video, Globe } from 'lucide-react';

const LiveStreams: React.FC = () => {
  return (
    <div className="bg-neo-bg min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl font-bold text-neo-text">Live Streams</h1>
        <p className="text-neo-text-secondary mt-2">Bientôt disponible — Nous travaillons sur quelque chose d'exceptionnel</p>
      </motion.div>

      {/* Central card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="neo-card p-12 max-w-2xl mx-auto text-center mb-8"
      >
        {/* Animated icon circle */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full bg-neo-primary opacity-10"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-3 rounded-full bg-neo-primary opacity-10"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <div className="neo-circle absolute inset-4 flex items-center justify-center">
            <Radio className="w-8 h-8 text-neo-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-neo-text mb-3">Fonctionnalité en développement</h2>
        <p className="text-neo-text-secondary leading-relaxed max-w-md mx-auto mb-8">
          Nous préparons une expérience de streaming live immersive et de haute qualité.
          Soyez parmi les premiers notifiés lors du lancement !
        </p>

        {/* Animated progress bar */}
        <div className="neo-inset rounded-full h-2 w-full max-w-xs mx-auto mb-8 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-neo-primary"
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <button className="neo-btn-primary inline-flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span>Me notifier</span>
        </button>
      </motion.div>

      {/* Features grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl mx-auto"
      >
        <div className="neo-card-sm p-6 text-center">
          <div className="neo-circle w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Video className="w-5 h-5 text-neo-primary" />
          </div>
          <h5 className="font-semibold text-neo-text mb-1">Streaming HD</h5>
          <p className="text-sm text-neo-text-secondary">Qualité optimale pour une expérience immersive</p>
        </div>
        <div className="neo-card-sm p-6 text-center">
          <div className="neo-circle w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Bell className="w-5 h-5 text-neo-primary" />
          </div>
          <h5 className="font-semibold text-neo-text mb-1">Notifications</h5>
          <p className="text-sm text-neo-text-secondary">Soyez alerté dès le lancement</p>
        </div>
        <div className="neo-card-sm p-6 text-center">
          <div className="neo-circle w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Globe className="w-5 h-5 text-neo-primary" />
          </div>
          <h5 className="font-semibold text-neo-text mb-1">Multi-appareils</h5>
          <p className="text-sm text-neo-text-secondary">Disponible sur tous vos appareils</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveStreams;
