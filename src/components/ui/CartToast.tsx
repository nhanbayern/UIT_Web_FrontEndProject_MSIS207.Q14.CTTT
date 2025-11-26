import { motion } from "motion/react";
import { CheckCircle2, ShoppingCart } from "lucide-react";

interface CartToastProps {
  productName: string;
}

export function CartToast({ productName }: CartToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-xl border-2 border-green-500"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <CheckCircle2 className="h-6 w-6 text-green-500" />
      </motion.div>
      <div className="flex-1">
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="font-semibold text-gray-900 mb-1"
        >
          Đã thêm vào giỏ hàng!
        </motion.p>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-600 line-clamp-2"
        >
          <span className="font-medium text-primary">{productName}</span>
        </motion.p>
      </div>
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <ShoppingCart className="h-5 w-5 text-primary" />
      </motion.div>

      {/* Confetti particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: [
              "#10b981",
              "#3b82f6",
              "#f59e0b",
              "#ef4444",
              "#8b5cf6",
              "#ec4899",
              "#14b8a6",
              "#f97316",
            ][i],
            left: "50%",
            top: "50%",
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i * Math.PI * 2) / 8) * 60,
            y: Math.sin((i * Math.PI * 2) / 8) * 60,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}
