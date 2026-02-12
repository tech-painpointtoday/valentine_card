import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Home, HeartCrack } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{
            rotate: [0, -10, 10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="inline-block mb-6"
        >
          <HeartCrack className="w-20 h-20 text-muted-foreground" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl mb-4">404</h1>
        <h2 className="text-2xl mb-2">ไม่พบหน้านี้</h2>
        <p className="text-muted-foreground mb-8">
          โอ้ย! หน้านี้ไม่มีอยู่จริง 💔
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all mx-auto"
        >
          <Home className="w-5 h-5" />
          กลับหน้าหลัก
        </motion.button>
      </motion.div>
    </div>
  );
}
