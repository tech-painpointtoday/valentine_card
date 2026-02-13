import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "../contexts/AudioContext";

export default function BackgroundMusic() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleMute}
      className="fixed bottom-4 left-4 z-[9999] bg-background/80 backdrop-blur-sm border-2 border-primary/30 rounded-full p-3 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all"
      aria-label={isMuted ? "Unmute background music" : "Mute background music"}
    >
      <AnimatePresence mode="wait">
        {isMuted ? (
          <motion.div
            key="muted"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VolumeX className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="unmuted"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Volume2 className="w-6 h-6 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
