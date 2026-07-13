import { motion } from "motion/react"
import { useState } from "react"

export default function LoginModal({ onLoginSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");

  const handlesubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim()) return;

    onLoginSuccess({
      name: name.trim(),
      email: email.trim(),
      designation: designation.trim()
    })
  }
  return (
    <div className="flex justify-center min-w-[98.5vw] min-h-[98.5vh] bg-[url('/public/bg.jpg')] bg-cover bg-center overflow-hidden rounded-2xl">
      <div className="flex justify-center items-center min-w-[98.5vw] min-h-[98.5vh] backdrop-blur-sm bg-black/30 overflow-hidden rounded-2xl">
        
        {/* Animated Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex max-h-full w-220 bg-black overflow-hidden rounded-2xl"
        >
          <div className="flex bg-[url('/public/bg.jpg')] bg-cover bg-center max-h-full w-100 m-2 rounded-2xl overflow-hidden">
          </div>
          
          <div className="flex-1 h-full flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden text-zinc-100">
            
            {/* Animated Form Content */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="w-full max-w-sm flex flex-col gap-6"
            >
              
              {/* Heading */}
              <div className="text-center">
                <h2 className="text-3xl font-semibold tracking-tight">Get Started</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Enter your details to create your account
                </p>
              </div>

              {/* Form */}
              <form className="flex flex-col gap-4" onSubmit={(e) => handlesubmit(e)}>
                
                {/* Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Fletcher" 
                    className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/80 transition box-border"
                  />
                </div>

                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/80 transition box-border"
                  />
                </div>

                {/* Designation Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Designation</label>
                  <input 
                    type="text" 
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Lead Developer" 
                    className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/80 transition box-border"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full bg-[#5B44C7] hover:bg-[#4a35ab] text-white font-medium text-sm py-3.5 rounded-xl transition mt-2 shadow-lg shadow-purple-900/20"
                >
                  Continue
                </button>

              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}