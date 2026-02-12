import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Sparkles, Heart, X, Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { generateCardId } from '../utils';
import { copyToClipboard } from '../utils/clipboard';
import { api } from '../utils/api';
import { Gift } from '../types';

export default function CreateCard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [senderImage, setSenderImage] = useState<string>('');
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingSenderImage, setUploadingSenderImage] = useState(false);

  // Step 2
  const [gifts, setGifts] = useState<Gift[]>([
    { id: '1', name: '', image: '' },
    { id: '2', name: '', image: '' },
  ]);

  const [cardLink, setCardLink] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [giftPreviews, setGiftPreviews] = useState<Record<string, string>>({});

  const maxMessageLength = 120;

  // Ref-based backup so message survives re-renders (e.g. when upload state changes)
  const messageRef = useRef(message);

  // Sync ref when message changes from any source (e.g. initial restore from session)
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= maxMessageLength) {
      messageRef.current = val; // Critical: update ref immediately, independent of render cycle
      setMessage(val);
      sessionStorage.setItem('draft_message', val);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('รูปต้องมีขนาดไม่เกิน 5MB นะ');
        return;
      }

      setUploadingSenderImage(true);

      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const path = await api.uploadImage(file);
        setSenderImage(path);
        toast.success('อัปโหลดรูปเรียบร้อยแล้ว! 📸');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้งนะ');
      } finally {
        setUploadingSenderImage(false);
        // Restore message from ref (latest value: typed before or during upload) so "เขียนข้อความของคุณ" is never lost
        setMessage(messageRef.current);
      }
    }
  };

  const handleGiftImageUpload = async (giftId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('รูปต้องมีขนาดไม่เกิน 5MB นะ');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setGiftPreviews(prev => ({
          ...prev,
          [giftId]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);

      setGifts(prev => prev.map(g =>
        g.id === giftId ? { ...g, image: 'uploading' } : g
      ));

      try {
        const path = await api.uploadImage(file);
        // Functional update: use latest state so gift names typed during upload are preserved
        setGifts(prev => prev.map(g =>
          g.id === giftId ? { ...g, image: path } : g
        ));
        toast.success('อัปโหลดรูปของขวัญเรียบร้อยแล้ว! 🎁');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('อัปโหลดรูปของขวัญไม่สำเร็จ ลองใหม่อีกครั้งนะ');
        setGifts(prev => prev.map(g =>
          g.id === giftId ? { ...g, image: '' } : g
        ));
        setGiftPreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[giftId];
          return newPreviews;
        });
      }
    }
  };

  const handleGiftNameChange = (giftId: string, name: string) => {
    setGifts(prev => prev.map(g =>
      g.id === giftId ? { ...g, name } : g
    ));
  };

  const addGift = () => {
    if (gifts.length < 8) {
      setGifts([...gifts, { id: Date.now().toString(), name: '', image: '' }]);
    }
  };

  const removeGift = (giftId: string) => {
    if (gifts.length > 2) {
      setGifts(gifts.filter(g => g.id !== giftId));
    }
  };

  const canProceedStep1 = (senderImage || uploadingSenderImage) && message.trim().length > 0;
  // Note: Allow proceeding if uploading is done OR if image is set. 
  // But strictly, we should wait. Modified logic below in button.

  const canProceedStep2 = gifts.every(g => g.name.trim() && g.image && g.image !== 'uploading') && !creatingCard;

  const handleFinish = async () => {
    setCreatingCard(true);
    try {
      const cardId = generateCardId();
      await api.createCard({
        cardId,
        senderImage,
        message,
        gifts,
      });

      // Clear draft
      sessionStorage.removeItem('draft_message');

      const link = `${window.location.origin}/card/${cardId}`;
      setCardLink(link);
      setShowSuccess(true);
      toast.success('สร้างการ์ดเรียบร้อยแล้ว! 🎉');
    } catch (error) {
      console.error('Create card error:', error);
      toast.error('สร้างการ์ดไม่สำเร็จ ลองใหม่อีกครั้งนะ');
    } finally {
      setCreatingCard(false);
    }
  };

  const copyLink = async () => {
    const success = await copyToClipboard(cardLink);
    if (success) {
      toast.success('คัดลอกลิงก์แล้ว! 💖');
    } else {
      toast.error('คัดลอกไม่สำเร็จ กรุณาคัดลอกด้วยตัวเองนะ');
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <Heart className="w-16 h-16 text-primary fill-primary" />
          </motion.div>

          <h2 className="text-2xl mb-2">สร้างการ์ดเสร็จแล้ว! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            แชร์ลิงก์นี้ให้คนพิเศษของคุณเลยนะ
          </p>

          <div className="bg-muted p-4 rounded-lg mb-4 break-all text-sm">
            {cardLink}
          </div>

          <div className="space-y-3">
            <button
              onClick={copyLink}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              คัดลอกลิงก์ 📋
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem('draft_message');
                navigate('/');
              }}
              className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-xl hover:scale-105 transition-transform"
            >
              สร้างการ์ดใหม่อีกใบ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {step === 1 ? 'สร้างการ์ดของคุณ' : 'เลือกของขวัญ'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-card p-6 md:p-8 rounded-2xl shadow-xl"
            >
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                สร้างการ์ดของคุณ
              </h2>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block mb-2">อัปโหลดรูปหวานๆ 📸</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/heic,image/heif"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="sender-image"
                  />
                  <label
                    htmlFor="sender-image"
                    className="block border-2 border-dashed border-border rounded-xl p-8 hover:border-primary transition-colors cursor-pointer"
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {uploadingSenderImage ? (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        {uploadingSenderImage ? (
                          <Loader2 className="w-12 h-12 text-primary mx-auto mb-2 animate-spin" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        )}
                        <p className="text-muted-foreground">
                          {uploadingSenderImage ? 'กำลังอัปโหลด...' : 'กดเพื่ออัปโหลด'}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label>เขียนข้อความของคุณ... 💌</label>
                  <span className="text-sm text-muted-foreground">
                    {message.length}/{maxMessageLength}
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="บอกเขาว่าเขาพิเศษแค่ไหน..."
                  className="w-full h-32 p-4 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <motion.button
                whileHover={(!uploadingSenderImage && senderImage && message.trim().length > 0) ? { scale: 1.02 } : {}}
                whileTap={(!uploadingSenderImage && senderImage && message.trim().length > 0) ? { scale: 0.98 } : {}}
                onClick={() => setStep(2)}
                disabled={uploadingSenderImage || !senderImage || message.trim().length === 0}
                className={`w-full py-4 rounded-xl transition-all ${(!uploadingSenderImage && senderImage && message.trim().length > 0)
                  ? 'bg-primary text-primary-foreground hover:shadow-lg'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
              >
                {uploadingSenderImage ? 'กำลังอัปโหลดรูป...' : 'ถัดไป →'}
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card p-6 md:p-8 rounded-2xl shadow-xl"
            >
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary fill-primary" />
                เลือกของขวัญ ({gifts.length})
              </h2>

              <div className="space-y-4 mb-6">
                {gifts.map((gift, index) => (
                  <motion.div
                    key={gift.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-border rounded-xl p-4 relative"
                  >
                    {gifts.length > 2 && (
                      <button
                        onClick={() => removeGift(gift.id)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        aria-label="Remove gift"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">รูปของขวัญ</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/heic,image/heif"
                          onChange={(e) => handleGiftImageUpload(gift.id, e)}
                          className="hidden"
                          id={`gift-image-${gift.id}`}
                        />
                        <label
                          htmlFor={`gift-image-${gift.id}`}
                          className="block border-2 border-dashed border-border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer group"
                        >
                          {giftPreviews[gift.id] ? (
                            <div className="relative h-24">
                              <img
                                src={giftPreviews[gift.id]}
                                alt="Gift preview"
                                className="w-full h-full object-cover"
                              />
                              {gift.image === 'uploading' && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                                </div>
                              )}
                              {gift.image !== 'uploading' && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                  <Edit className="w-6 h-6 text-white" />
                                  <span className="text-white text-xs font-medium">เปลี่ยน</span>
                                </div>
                              )}
                            </div>
                          ) : gift.image === 'uploading' ? (
                            <div className="flex items-center justify-center h-24 p-4">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="text-center py-4 p-4">
                              <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground">กดเพื่ออัปโหลด</p>
                            </div>
                          )}
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm mb-2">ชื่อของขวัญ</label>
                        <input
                          type="text"
                          value={gift.name}
                          onChange={(e) => handleGiftNameChange(gift.id, e.target.value)}
                          placeholder="เช่น ช็อกโกแลต"
                          className="w-full p-3 bg-input-background rounded-lg border border-border focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {gifts.length < 8 && (
                <button
                  onClick={addGift}
                  className="w-full py-3 mb-4 border-2 border-dashed border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors"
                >
                  + เพิ่มของขวัญ
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-secondary text-secondary-foreground rounded-xl hover:scale-105 transition-transform"
                >
                  ← ย้อนกลับ
                </button>

                <motion.button
                  whileHover={canProceedStep2 ? { scale: 1.02 } : {}}
                  whileTap={canProceedStep2 ? { scale: 0.98 } : {}}
                  onClick={handleFinish}
                  disabled={!canProceedStep2}
                  className={`flex-1 py-4 rounded-xl transition-all ${canProceedStep2
                    ? 'bg-primary text-primary-foreground hover:shadow-lg'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                >
                  เสร็จสิ้น ✨
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}