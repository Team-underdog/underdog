import { motion } from "motion/react";

export function PixelLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-center"
    >
      <div className="relative">
        {/* 픽셀 아트 스타일 배경 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transform rotate-1 opacity-20"></div>

        {/* 메인 로고 텍스트 */}
        <div className="relative bg-background border-2 border-foreground rounded-lg px-6 py-3 shadow-lg">
          <div className="flex flex-col items-center space-y-1">
            {/* CAMPUS */}
            <div className="flex space-x-1">
              {["C", "A", "M", "P", "U", "S"].map(
                (letter, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.3,
                    }}
                    className="w-6 h-8 bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-lg border border-foreground/20 pixel-art pixel-text"
                    style={{
                      imageRendering: "pixelated",
                      fontFamily: '"Courier New", monospace',
                      textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
                    }}
                  >
                    {letter}
                  </motion.div>
                ),
              )}
            </div>

            {/* CHRONICLE */}
            <div className="flex space-x-1">
              {[
                "C",
                "H",
                "R",
                "O",
                "N",
                "I",
                "C",
                "L",
                "E",
              ].map((letter, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: (index + 6) * 0.1,
                    duration: 0.3,
                  }}
                  className="w-5 h-6 bg-secondary text-secondary-foreground flex items-center justify-center font-mono font-bold text-sm border border-foreground/20 pixel-art pixel-text"
                  style={{
                    imageRendering: "pixelated",
                    fontFamily: '"Courier New", monospace',
                    textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
                  }}
                >
                  {letter}
                </motion.div>
              ))}
            </div>
          </div>

          {/* 픽셀 아트 장식 */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-secondary"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-secondary"></div>
        </div>

        {/* 글리치 효과 (옵셔널) */}
        <motion.div
          animate={{
            x: [0, 2, -2, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg mix-blend-overlay"
        />
      </div>
    </motion.div>
  );
}