import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@fontsource/montserrat";  

export default function SplashScreen() {
    const textList = ["Setting up your board...", "Aligning your canvas...", "Organizing your tools...", "Powering up your workflow...", "Gathering your assets..."];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % textList.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 font-sans"
        >
        <div className="flex flex-col items-center gap-5">
            

            <h1 className="text-4xl font-medium tracking-tight text-neutral-200">
            Welcome to Glyphboard
            </h1>
            
            <AnimatePresence mode="wait">
                <motion.div className="text-sm text-gray-400" style={{ fontFamily: "Montserrat, sans-serif" }}
                    key={textList[currentIndex]}
                    initial = {{opacity: 0, y: 6}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -6}}
                    transition={{duration: 0.3, ease: "easeInOut"}}
                    >
                    {textList[currentIndex]}
                </motion.div>
            </AnimatePresence>

            <div className="w-44 h-1.25 bg-neutral-900 rounded-full overflow-hidden relative">
            <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
                }}
                className="absolute inset-y-0 w-1/2 bg-neutral-400/80 rounded-full"
            />
            </div>
            
        </div>
        </motion.div>
    );
}