import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Hearts */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              rotate: [0, 20, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: i * 0.4
            }}
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

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="text-center max-w-lg relative z-10"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block mb-8 relative"
        >
          <Heart className="w-24 h-24 text-primary fill-primary drop-shadow-[0_0_30px_rgba(233,74,119,0.3)]" />
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4"
          >
            <Sparkles className="w-10 h-10 text-accent" />
          </motion.div>
        </motion.div>

        <h1 className="text-5xl md:text-6xl mb-6 font-['Gloria_Hallelujah'] tracking-tight">
          Valentine's Card
        </h1>

        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          สร้างการ์ดวาเลนไทน์สุดพิเศษ <br />
          พร้อมรูปและของขวัญสุดเซอร์ไพรส์ 💖
        </p>

        <Link to="/create">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(233,74,119,0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-10 py-5 rounded-full shadow-[0_10px_25px_rgba(233,74,119,0.3)] transition-all text-xl font-bold flex items-center gap-2 mx-auto"
          >
            สร้างการ์ดของคุณ ✨
          </motion.button>
        </Link>

        <p className="mt-12 text-muted-foreground/60 text-md">
          Made with love by YourHome
        </p>

      </motion.div>
    </div>
  );
}
