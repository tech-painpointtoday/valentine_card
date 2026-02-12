import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Mail, Loader2 } from "lucide-react";
import { api } from "../utils/api";
import { prefetchImages } from "../utils";

export default function CardLanding() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [cardNotFound, setCardNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noThanksPosition, setNoThanksPosition] = useState({
    x: 0,
    y: 0,
  });
  const [escapeCount, setEscapeCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const noThanksRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkCard = async () => {
      if (cardId) {
        try {
          const cardData = await api.getCard(cardId);
          setLoading(false);

          // Prefetch all images for the card flow
          const imageToPrefetch = [
            cardData.senderImage,
            ...cardData.gifts.map(g => g.image)
          ];
          prefetchImages(imageToPrefetch);
        } catch (error) {
          console.error("Card not found:", error);
          setCardNotFound(true);
          setLoading(false);
        }
      }
    };

    checkCard();
  }, [cardId]);

  const handleOpenCard = () => {
    navigate(`/card/${cardId}/reveal`);
  };

  const handleNoThanksHover = () => {
    const padding = 12;
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;

    // Get button's layout origin (position without transform) so we can clamp translate(x,y) to keep it on screen
    const rect = noThanksRef.current?.getBoundingClientRect();
    const layoutLeft = rect ? rect.left - noThanksPosition.x : innerWidth / 2 - 150;
    const layoutTop = rect ? rect.top - noThanksPosition.y : innerHeight / 2 - 50;
    const w = rect?.width ?? 200;
    const h = rect?.height ?? 56;

    // Valid translate range so the button stays fully on screen (with padding)
    const minX = -layoutLeft + padding;
    const maxX = innerWidth - layoutLeft - w - padding;
    const minY = -layoutTop + padding;
    const maxY = innerHeight - layoutTop - h - padding;

    // Pick a random position within bounds; ensure range is valid
    const rangeX = Math.max(0, maxX - minX);
    const rangeY = Math.max(0, maxY - minY);
    const newX = Math.round(minX + Math.random() * rangeX);
    const newY = Math.round(minY + Math.random() * rangeY);

    setNoThanksPosition({ x: newX, y: newY });
    setEscapeCount((prev) => {
      const next = prev + 1;
      console.log("[no-thanks-button] Run-aways:", next);
      return next;
    });
    setShowTooltip(true);

    setTimeout(() => setShowTooltip(false), 1500);
  };


  const tooltipMessages = [
    "เอ๊ะ! กดไม่ได้นะ 😜",
    "อย่าปฏิเสธเลย~ 🥺",
    "ลองอีกที ก็ยังไม่ได้ 😏",
    "ยืนยันเลยว่าเปิดนะ! 💕",
    "กดเปิดซะดีกว่า 💖",
    "ปุ่มนี้มีไว้ประดับเฉยๆ นะ 😂",
    "กดปุ่มชมพูเถอะ เชื่อเรา...",
    "หนีเร็วกว่าที่คิดใช่ไหมล่าาา",
    "ยอมแพ้แล้วกด Open Card เถอะ 🙏",
    "รักนะถึงได้แกล้ง 💖",
    "ลองใหม่อีก 100 รอบก็ไม่ได้กดหรอก!",
    "มือไวไม่เท่าใจรักหรอกนะ 🥰",
    "ไม่ได้กดแน่ๆ ล้านเปอร์เซ็นต์ ✨",
    "อย่าเพิ่งท้อสิ พยายามเข้า! ✌️",
    "ทางโน้นนนน ไปทางโน้นแล้ววว 🏃‍♂️",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">
            กำลังโหลดการ์ดของคุณ...
          </p>
        </div>
      </div>
    );
  }

  if (cardNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl mb-2">ไม่พบการ์ด</h2>
          <p className="text-muted-foreground mb-6">
            การ์ดนี้ไม่มีอยู่จริงหรือหมดอายุแล้ว
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:scale-105 transition-transform"
          >
            กลับหน้าหลัก
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="text-center max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{
              rotate: [0, -5, 5, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
            className="inline-block mb-6"
          >
            <Mail className="w-24 h-24 text-primary" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl mb-4">
            คุณได้รับการ์ดวาเลนไทน์แล้ว 💌
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            มีคนพิเศษส่งของหวานๆ มาให้คุณ...
          </p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCard}
              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
              id="open-card-button"
            >
              เปิดการ์ด 💖
            </motion.button>

            <AnimatePresence>
              {escapeCount < 10 && (
                <motion.div
                  key="no-thanks"
                  className="relative inline-block w-full"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    id="no-thanks-button"
                    ref={noThanksRef}
                    onMouseEnter={handleNoThanksHover}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleNoThanksHover();
                    }}
                    animate={{
                      x: noThanksPosition.x,
                      y: noThanksPosition.y,
                    }}
                    transition={{
                      type: "tween",
                      duration: 0.2,
                      ease: "linear",
                    }}
                    style={{ willChange: "transform" }}
                    className="relative w-full bg-white/95 text-primary font-semibold px-8 py-4 rounded-xl border-2 border-primary/30 shadow-md hover:shadow-xl hover:border-primary/50 hover:bg-white transition-[box-shadow,border-color,background-color]"
                    aria-label="No thanks button - try to click it!"
                  >
                    <span className="drop-shadow-sm">เปิดการ์ด 💖 xxxx</span>
                  </motion.button>

                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full text-base font-medium shadow-2xl pointer-events-none z-50 whitespace-nowrap"
                    >
                      {
                        tooltipMessages[
                        Math.min(
                          escapeCount - 1,
                          tooltipMessages.length - 1,
                        )
                        ]
                      }
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
