import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Gift as GiftIcon, Sparkles, Loader2, Check } from 'lucide-react';
import { api } from '../utils/api';
import { ValentineCard, Gift } from '../types';

export default function GiftSelection() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<ValentineCard | null>(null);
  const [selectedGiftId, setSelectedGiftId] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCard = async () => {
      if (cardId) {
        try {
          const cardData = await api.getCard(cardId);
          setCard(cardData);
          setLoading(false);
        } catch (error) {
          console.error('Failed to load card:', error);
          navigate('/');
        }
      }
    };

    loadCard();
  }, [cardId, navigate]);

  const handleConfirm = async () => {
    if (selectedGiftId && cardId) {
      setSaving(true);
      try {
        await api.updateChoice(cardId, selectedGiftId);
        setShowConfetti(true);

        // Navigate after confetti animation
        setTimeout(() => {
          navigate(`/card/${cardId}/summary`);
        }, 2000);
      } catch (error) {
        console.error('Failed to save choice:', error);
        alert('บันทึกตัวเลือกไม่สำเร็จ ลองใหม่อีกครั้งนะ');
        setSaving(false);
      }
    }
  };

  if (loading || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf2f4]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-primary">รอลุ้นได้เลยยยย... 🎁</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12 bg-[#fdf2f4] relative overflow-x-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 15, -15, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <div className="bg-white p-4 rounded-full shadow-xl">
              <GiftIcon className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl mb-4 text-primary">
            เลือกอันที่เธอชอบหน่อยนะ
          </h1>
          <p className="text-lg text-muted-foreground">
            เราอยากรู้จังว่าเธอจะชอบอันไหนมากที่สุด?
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {card.gifts.map((gift: Gift, index: number) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, scale: 0.8, rotate: index % 2 === 0 ? -2 : 2 }}
              animate={{ opacity: 1, scale: 1, rotate: index % 2 === 0 ? -1 : 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={!selectedGiftId || selectedGiftId === gift.id ? { scale: 1.03, rotate: 0, y: -5 } : {}}
              onClick={() => setSelectedGiftId(gift.id)}
              className={`relative bg-white p-3 pb-10 shadow-xl cursor-pointer transition-all duration-500 border border-gray-100 w-full sm:w-64 md:w-72 ${selectedGiftId === gift.id
                ? 'ring-4 ring-primary ring-offset-4 ring-offset-[#fdf2f4] z-20'
                : selectedGiftId
                  ? 'blur-[2px] opacity-40 scale-[0.98] grayscale-[0.2]'
                  : ''
                }`}
            >
              {/* Polaroid-style Image Frame */}
              <div className="relative aspect-square overflow-hidden bg-gray-50 mb-4 border border-gray-100">
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="w-full h-full object-cover transition-transform duration-500"
                />

                <AnimatePresence>
                  {selectedGiftId === gift.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, rotate: -90 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0, rotate: -90 }}
                      className="absolute top-4 right-4 z-30"
                    >
                      <div className="bg-primary text-white rounded-full p-2 shadow-lg border-2 border-white">
                        <Check className="w-6 h-6 stroke-[4px]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-center">
                <h3 className="text-xl text-foreground/80 break-words">
                  {gift.name}
                </h3>
              </div>

              {/* Decorative Tape effect */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-primary/10 backdrop-blur-sm -rotate-2 border border-primary/5" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-md mx-auto sticky bottom-8 z-50"
        >
          <motion.button
            whileHover={selectedGiftId ? { scale: 1.05 } : {}}
            whileTap={selectedGiftId ? { scale: 0.95 } : {}}
            onClick={handleConfirm}
            disabled={!selectedGiftId || saving}
            className={`w-full py-5 rounded-full shadow-2xl transition-all flex items-center justify-center gap-3 text-xl font-bold ${selectedGiftId && !saving
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
              }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                รอแป๊บนึงน้าาา...
              </>
            ) : (
              <>
                {selectedGiftId && <Sparkles className="w-6 h-6 animate-pulse" />}
                 ตกลงเอาอันนี้นะ
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Confetti / Burst effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: 0,
                  x: 0,
                  scale: 0,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{
                  y: (Math.random() - 0.5) * window.innerHeight * 1.5,
                  x: (Math.random() - 0.5) * window.innerWidth * 1.5,
                  scale: [0, 1, 0.5, 0],
                  rotate: Math.random() * 720
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeOut"
                }}
                className="absolute text-5xl"
              >
                {['💖', '💝', '💕', '💗', '✨', '🌸', '🌷', '🎀', '🤍', '🎁', '💌', '🍫'][Math.floor(Math.random() * 12)]}
              </motion.div>
            ))}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl border-4 border-primary/20 text-center"
            >
              <h2 className="text-4xl text-primary mb-2">ว่าแล้ว เธอต้องเลือกอันนี้แน่ ๆ! 🥰</h2>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${i * 10}%`,
              top: `${Math.random() * 100}%`
            }}
            className="absolute text-primary"
          >
          </motion.div>
        ))}
      </div>
    </div>
  );
}