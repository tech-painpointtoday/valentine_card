import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import { ValentineCard } from '../types';

/**
 * A simple handwriting typewriter effect component
 */
function HandwritingMessage({ text }: { text: string }) {
  // Split into words or chars? Chars is better for typewriter.
  const characters = text.split('');
  
  // Adjust font size based on message length
  const getFontSize = (length: number) => {
    if (length > 200) return 'text-sm md:text-base';
    if (length > 120) return 'text-base md:text-lg';
    return 'text-lg md:text-xl';
  };

  return (
    <div className={`${getFontSize(characters.length)} text-primary/80 leading-relaxed text-center px-4 italic w-full max-w-full pb-4`} style={{ 
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      wordBreak: 'break-word'
    }}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.05,
            delay: 2.2 + (index * 0.05), // Start after polaroid reveal
            ease: "easeIn"
          }}
          style={{ display: 'inline' }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

export default function CardReveal() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<ValentineCard | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const loadCard = async () => {
      if (cardId) {
        try {
          const cardData = await api.getCard(cardId);
          setCard(cardData);

          // Pre-load the sender image
          const img = new Image();
          img.src = cardData.senderImage;
          img.onload = () => {
            setImageLoaded(true);
            setLoading(false);
          };
          img.onerror = () => {
            setLoading(false);
          };
        } catch (error) {
          console.error('Failed to load card:', error);
          navigate('/');
        }
      }
    };

    loadCard();
  }, [cardId, navigate]);

  if (loading || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf2f4]">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mb-6 inline-block"
          >
            <Heart className="w-16 h-16 text-primary fill-primary drop-shadow-[0_0_10px_rgba(233,74,119,0.3)]" />
          </motion.div>
          <p className="text-primary text-xl font-medium animate-pulse">
            {imageLoaded ? 'รอแป๊บนึงน้าาาาาาา... 💖' : 'รอแป๊บนึงน้าาาาาาา... 💖'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate safe scale to prevent corner clipping during rotation
  // For a card with aspect ratio 4:5.5, when rotated, we need to account for the diagonal
  // Formula: safe scale = 1 / sqrt(2) for 45° rotation, but for small angles we can be less aggressive
  // For 1° rotation: we need ~1.015x space, so we scale down to 0.985
  // Adding extra margin for safety with hover scale of 1.05
  const maxRotation = 1; // degrees
  const hoverScale = 1.05;
  const rotationRad = (maxRotation * Math.PI) / 180;
  const aspectRatio = 5.5 / 4; // height / width
  
  // Calculate bounding box expansion due to rotation
  const expansionFactor = Math.abs(Math.cos(rotationRad)) + aspectRatio * Math.abs(Math.sin(rotationRad));
  const baseScale = 0.92; // Base scale to provide comfortable margin
  const safeScale = baseScale / (expansionFactor * hoverScale);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fdf2f4] overflow-hidden relative">
      {/* Add padding to container to prevent clipping */}
      <div className="max-w-md w-full relative z-10 px-4 py-8">
        <motion.div
          initial={{ rotateY: 0, scale: 0.8, opacity: 0, y: 50 }}
          animate={{
            rotateY: isOpen ? 180 : 0,
            scale: safeScale,
            opacity: 1,
            y: 0
          }}
          whileHover={!isOpen ? { scale: safeScale * 1.05, rotateZ: maxRotation } : {}}
          onClick={() => !isOpen && setIsOpen(true)}
          transition={{
            rotateY: { duration: 1.4, ease: [0.45, 0.05, 0.55, 0.95] },
            scale: { duration: 0.8 },
            opacity: { duration: 0.8 }
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: 2000
          }}
          className={`relative aspect-[4/5.5] w-full ${!isOpen ? 'cursor-pointer' : ''}`}
        >
          {/* Card Back (Closed Side - The Envelope View) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg)"
            }}
            className="absolute inset-0 bg-gradient-to-br from-primary via-[#ff8fab] to-secondary rounded-lg shadow-2xl p-8 flex flex-col items-center justify-center border-8 border-white/10"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <p className="mt-8 text-white text-2xl font-bold tracking-widest drop-shadow-md">
              เปิดเลยละกัน...
            </p>
          </div>

          {/* Card Front (REVEALED POLAROID) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
            className="absolute inset-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-sm p-4 pb-12 flex flex-col items-center border border-gray-100"
          >
            {/* Polaroid Image Section - Slightly reduced to leave more room for text */}
            <div className="relative w-full aspect-[1/0.95] bg-[#f0f0f0] overflow-hidden border border-gray-200">
              <motion.img
                initial={{ opacity: 0, filter: 'grayscale(50%) brightness(1.2) contrast(0.8)' }}
                animate={isOpen ? { opacity: 1, filter: 'grayscale(0%) brightness(1) contrast(1)' } : {}}
                transition={{ delay: 1.5, duration: 2.5 }}
                src={card.senderImage}
                alt="Valentine"
                className="w-full h-full object-cover"
              />
              {/* Fade-in White Flash Effect */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={isOpen ? { opacity: 0 } : {}}
                transition={{ delay: 1.5, duration: 1.5 }}
                className="absolute inset-0 bg-white pointer-events-none"
              />
            </div>

            {/* Polaroid Bottom Section (Handwriting Area) - Now scrollable */}
            <div className="mt-6 w-full flex-1 flex flex-col items-center justify-start min-h-[80px] max-h-full overflow-y-auto overflow-x-hidden polaroid-message-scroll px-2">
              <AnimatePresence>
                {isOpen && (
                  <HandwritingMessage text={card.message} />
                )}
              </AnimatePresence>
            </div>

            {/* Fake Polaroid Texture/Signature */}
            <div className="absolute bottom-4 right-6 opacity-30">
              <span className="text-sm italic opacity-70">Feb 2026</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button - Bottom Right */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: 4, type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/card/${cardId}/gift`)}
            className="fixed bottom-8 right-8 z-50 bg-primary text-white p-4 pr-6 rounded-full shadow-[0_10px_30px_rgba(233,74,119,0.4)] flex items-center gap-3 font-bold text-lg group overflow-hidden"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Heart className="w-6 h-6 fill-current" />
            </motion.div>
            <span>เลือกดูนะ ว่าเธออยากได้อะไร</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

            {/* Shiny effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Background Hearts Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {isOpen && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              top: '110%',
              left: `${Math.random() * 100}%`,
              scale: Math.random() * 0.5 + 0.3
            }}
            animate={{
              opacity: [0, 0.7, 0],
              top: '-10%',
              rotate: Math.random() * 360,
              scale: [Math.random() * 0.5 + 0.3, Math.random() * 1.2 + 0.5, 0.5]
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
            className="absolute text-primary/40"
          >
            <Heart className="w-12 h-12 fill-current" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}