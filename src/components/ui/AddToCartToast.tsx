import { motion } from "framer-motion";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface AddToCartToastProps {
  productName: string;
}

export function AddToCartToast({ productName }: AddToCartToastProps) {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; y: number; rotation: number; color: string }>
  >([]);

  useEffect(() => {
    // Generate confetti particles
    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#f9ca24",
      "#6c5ce7",
      "#a29bfe",
      "#fd79a8",
      "#fdcb6e",
    ];
    const newConfetti = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(newConfetti);
  }, []);

  return (
    <div className="relative">
      {/* Confetti particles */}
      {confetti.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: "50%",
            top: "50%",
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: [0, 1, 0.8],
            rotate: particle.rotation,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Toast content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-xl shadow-2xl min-w-[320px] border-2 border-gray-200"
      >
        {/* Icon with animation */}
        <motion.div
          initial={{ rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: 0.1,
          }}
          className="flex-shrink-0"
        >
          <div className="relative">
            <CheckCircle2
              className="h-7 w-7 text-emerald-500"
              strokeWidth={2.5}
            />
            <motion.div
              className="absolute inset-0 bg-emerald-500 rounded-full"
              initial={{ scale: 0, opacity: 0.3 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 mb-1"
          >
            <ShoppingCart className="h-4 w-4 flex-shrink-0 text-gray-700" />
            <span className="font-bold text-sm text-gray-900">Thành công!</span>
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium truncate text-gray-800"
          >
            Đã thêm{" "}
            <span className="font-bold text-gray-900">{productName}</span>
          </motion.p>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-xs text-gray-600"
          >
            vào giỏ hàng
          </motion.p>
        </div>

        {/* Sparkle effect */}
        <motion.div
          className="absolute -top-1 -right-1 text-yellow-500"
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2l1.5 5.5L17 9l-5.5 1.5L10 16l-1.5-5.5L3 9l5.5-1.5L10 2z" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
