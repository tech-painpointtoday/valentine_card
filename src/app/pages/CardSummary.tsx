import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Download, Share2, Home, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import { ValentineCard, Gift } from '../types';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

const CORS_PROXY = 'https://wsrv.nl/?url=';
const CORS_PROXY_OUTPUT = '&output=png';

/**
 * Converts an image URL to a Base64 data URL using a CORS proxy.
 * - If the URL is external (starts with http), fetches via proxy and returns data:image/png;base64,...
 * - If already a data URL, returns it unchanged.
 */
async function convertImageToBase64(url: string): Promise<string | null> {
  if (!url || url.startsWith('data:')) return url;
  if (!url.startsWith('http')) return null;
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}${CORS_PROXY_OUTPUT}`;
  try {
    const res = await fetch(proxyUrl, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const base64DataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return base64DataUrl;
  } catch (e) {
    console.warn('convertImageToBase64 failed:', url, e);
    return null;
  }
}

/**
 * Waits for the browser to fully decode and paint the image.
 * Uses img.decode() when available, otherwise onload/onerror.
 */
function waitForImageLoad(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) {
    return typeof img.decode === 'function' ? img.decode().catch(() => { }) : Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };
    img.onerror = () => resolve();
  });
}

export default function CardSummary() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<ValentineCard | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const textureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCard = async () => {
      if (cardId) {
        try {
          const cardData = await api.getCard(cardId);
          if (cardData && cardData.receiverChoice) {
            setCard(cardData);
            const gift = cardData.gifts.find((g: Gift) => g.id === cardData.receiverChoice);
            setSelectedGift(gift || null);
            setLoading(false);
          } else {
            navigate(`/card/${cardId}/gift`);
          }
        } catch (error) {
          console.error('Failed to load card:', error);
          navigate('/');
        }
      }
    };

    loadCard();
  }, [cardId, navigate]);

  const handleSaveAsImage = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    const toastId = toast.loading('กำลังบันทึกความทรงจำของคุณ... 📸');

    const originalSrcs = new Map<HTMLImageElement, string>();

    try {
      const el = cardRef.current;
      const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'));

      // Step 1: Fetch Base64 for all images and update src
      for (const img of imgs) {
        const src = img.getAttribute('src');
        if (!src) continue;
        const base64 = await convertImageToBase64(src);
        if (base64) {
          originalSrcs.set(img, src);
          img.setAttribute('src', base64);
        }
      }

      // Step 2: Wait for ALL images to load/decode (no race condition)
      await Promise.all(imgs.map(waitForImageLoad));

      // Step 3: Safety delay so the browser has time to paint
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (textureRef.current) textureRef.current.style.setProperty('opacity', '0');

      const width = el.scrollWidth;
      const height = el.scrollHeight;
      const captureOptions = {
        width,
        height,
        pixelRatio: 3,
        quality: 1.0,
        backgroundColor: '#fdf2f4',
        cacheBust: true,
      };

      // Step 4: Warm-up capture (forces render engine to paint with new images)
      await toPng(el, captureOptions);

      // Step 5: Actual capture and save
      const dataUrl = await toPng(el, captureOptions);

      const blob = await fetch(dataUrl).then((r) => r.blob());
      saveAs(blob, `valentine-card-${cardId}.png`);
      toast.success('บันทึกความทรงจำไว้ในเครื่องแล้ว! 💖', { id: toastId });
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('บันทึกรูปไม่สำเร็จ ลองใหม่อีกครั้งนะ', { id: toastId });
    } finally {
      originalSrcs.forEach((src, img) => img.setAttribute('src', src));
      if (textureRef.current) textureRef.current.style.removeProperty('opacity');
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ความทรงจำวาเลนไทน์ของเรา 💖',
      text: 'ดูการ์ดวาเลนไทน์สวยๆ ใบนี้สิ! 💌',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('แชร์สำเร็จแล้ว! ✨');
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (error) {
      console.log('Sharing failed, falling back to clipboard:', error);
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      const success = await copyToClipboard(window.location.href);
      if (success) {
        toast.success('คัดลอกลิงก์แล้ว! แชร์ให้แฟนวาเลนไทน์ของคุณเลยนะ 💖');
      } else {
        toast.error('คัดลอกลิงก์ไม่ได้ กรุณาคัดลอก URL ด้วยตัวเองนะ');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดขึ้นขณะคัดลอก');
    }
  };

  if (loading || !card || !selectedGift) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf2f4]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-primary font-['Itim']">กำลังสร้างความทรงจำของคุณ... ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12 bg-[#fdf2f4]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Card Memory Container - The Scrapbook Page */}
          <div
            ref={cardRef}
            className="bg-white rounded-sm shadow-2xl overflow-hidden mb-10 p-8 md:p-12 relative border border-gray-100"
          >
            {/* Background Texture/Pattern - hidden during image capture to avoid line artifacts */}
            <div ref={textureRef} className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e94a77_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-2"
                >
                  <Heart className="w-12 h-12 text-primary fill-primary" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-['Gloria_Hallelujah'] text-primary mb-2">
                  Forever Memory
                </h1>
                <p className="font-['Itim'] text-muted-foreground text-lg italic">
                  วันวาเลนไทน์ 2026 ❤️
                </p>
              </div>

              {/* Two Polaroids Side by Side or Stacked */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-center">
                {/* Sender Polaroid */}
                <motion.div
                  initial={{ rotate: -3 }}
                  animate={{ rotate: -2 }}
                  className="bg-white p-3 pb-12 shadow-xl border border-gray-100 rotate-[-2deg] hover:rotate-0 transition-transform duration-300"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50 border border-gray-100 mb-4">
                    <img
                      src={card.senderImage}
                      alt="Valentine"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <span className="font-['Caveat'] text-xl text-primary/60 italic">ด้วยความรัก...</span>
                  </div>
                  {/* Tape */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-primary/10 backdrop-blur-sm rotate-2" />
                </motion.div>

                {/* Gift Polaroid */}
                <motion.div
                  initial={{ rotate: 3 }}
                  animate={{ rotate: 2 }}
                  className="bg-white p-3 pb-12 shadow-xl border border-gray-100 rotate-[2deg] hover:rotate-0 transition-transform duration-300"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50 border border-gray-100 mb-4">
                    <img
                      src={selectedGift.image}
                      alt={selectedGift.name}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <span className="font-['Caveat'] text-xl text-primary italic">{selectedGift.name}</span>
                  </div>
                  {/* Tape */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-[#ffc2d4]/40 backdrop-blur-sm -rotate-3" />
                </motion.div>
              </div>

              {/* Message Area */}
              <div className="bg-[#fff9fa] rounded-xl p-8 shadow-inner border border-primary/5 mb-8 relative">
                <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-accent/50 p-2" />
                <div className="font-['Gloria_Hallelujah'] text-xl text-foreground/80 leading-snug text-center italic">
                  "{card.message}"
                </div>
              </div>

              <div className="flex justify-center gap-4 text-primary opacity-50">
                <Heart className="w-6 h-6 fill-current" />
                <Heart className="w-6 h-6 fill-current" />
                <Heart className="w-6 h-6 fill-current" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveAsImage}
              disabled={isGenerating}
              className="flex items-center justify-center gap-3 bg-primary text-white px-8 py-5 rounded-full shadow-2xl font-bold text-lg disabled:opacity-50"
            >
              <Download className={`w-6 h-6 ${isGenerating ? 'animate-bounce' : ''}`} />
              {isGenerating ? 'กำลังบันทึก...' : 'บันทึกความทรงจำนี้'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center justify-center gap-3 bg-white text-primary border-2 border-primary px-8 py-5 rounded-full shadow-xl font-bold text-lg"
            >
              <Share2 className="w-6 h-6" />
              แชร์ความทรงจำ
            </motion.button>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02, color: '#e94a77' }}
            onClick={() => navigate('/')}
            className="w-full text-center flex items-center justify-center gap-2 text-muted-foreground font-['Itim'] text-xl"
          >
            <Home className="w-5 h-5" />
            กลับหน้าหลัก
          </motion.button>
        </motion.div>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            className="absolute text-primary"
          >
            <Heart className="w-10 h-10 fill-current" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}