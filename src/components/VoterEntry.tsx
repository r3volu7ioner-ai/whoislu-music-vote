import React, { useState } from 'react';
import { Music, Sparkles, ArrowRight } from 'lucide-react';

interface VoterEntryProps {
  onEnter: (name: string) => void;
}

const VoterEntry: React.FC<VoterEntryProps> = ({ onEnter }) => {
  const [name, setName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsAnimating(true);
      setTimeout(() => {
        onEnter(name.trim());
      }, 800);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden transition-all duration-800 ${isAnimating ? 'scale-110 opacity-0' : ''}`}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f]" />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
        
        {/* Neon glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-lg w-full mx-4">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <Music className="w-16 h-16 text-pink-500" />
              <div className="absolute inset-0 w-16 h-16 bg-pink-500 blur-xl opacity-50 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tight">
            <span className="text-[#ff0080] drop-shadow-[0_0_30px_rgba(255,0,128,0.8)]">
              WhoIsLu
            </span>
          </h1>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#ff0080]" />
            <span className="text-pink-300/80 text-sm tracking-[0.3em] uppercase">Neon Pink Flames</span>
            <Sparkles className="w-4 h-4 text-[#ff0080]" />
          </div>
        </div>


        {/* Entry Form */}
        <div className="relative">
          {/* Glassmorphism card */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Enter the Lu.niverse
            </h2>
            <p className="text-gray-400 text-center mb-8">
              Help choose which 6 tracks make the album
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name..."
                  className="w-full px-6 py-4 bg-black/50 border border-pink-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-lg"
                  autoFocus
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-purple-500/0 pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
              >
                <span>Begin Voting</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <span>15 Tracks</span>
                <span className="w-1 h-1 bg-pink-500 rounded-full" />
                <span>Vote for 6</span>
                <span className="w-1 h-1 bg-pink-500 rounded-full" />
                <span>Leave Comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Your votes shape the final album
        </p>
      </div>
    </div>
  );
};

export default VoterEntry;