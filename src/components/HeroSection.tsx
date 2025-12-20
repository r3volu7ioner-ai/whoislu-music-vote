import React from 'react';
import { Sparkles, ChevronDown, Disc3, Music2 } from 'lucide-react';

const HeroSection: React.FC = () => {
  const scrollToTracks = () => {
    document.getElementById('tracks')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://d64gsuwffb70l.cloudfront.net/69332beeb9fbd2f10b81258a_1764961511821_b799c587.png"
          alt="WhoIsLu Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/50 to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 via-transparent to-purple-900/20" />
      </div>

      {/* Animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating vinyl records */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`disc-${i}`}
            className="absolute text-pink-500/20 animate-float"
            style={{
              left: `${5 + i * 18}%`,
              top: `${15 + Math.random() * 50}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${5 + Math.random() * 3}s`,
            }}
          >
            <Disc3 className="w-8 h-8" />
          </div>
        ))}

        {/* Floating music notes */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`note-${i}`}
            className="absolute text-purple-400/20 animate-float-slow"
            style={{
              left: `${10 + i * 11}%`,
              top: `${25 + Math.random() * 55}%`,
              animationDelay: `${i * 0.5 + 0.3}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          >
            <Music2 className="w-6 h-6" />
          </div>
        ))}

        {/* Neon lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">


        {/* Main title */}
        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tight">
          <span className="text-[#ff0080] drop-shadow-[0_0_50px_rgba(255,0,128,0.8)]">
            WhoIsLu
          </span>
        </h1>


        {/* Subtitle */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-pink-100">
            Neon Pink Flames
          </span>
        </h2>


        {/* Description */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          15 tracks. 6 will make the album. Your vote decides which ones.
          <br />
          <span className="text-pink-400">Listen. Comment. Choose.</span>
        </p>

        {/* CTA Button */}
        <button
          onClick={scrollToTracks}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl text-white font-bold text-lg transition-all shadow-2xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105"
        >
          <span>Start Voting</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>

        {/* Stats */}
        <div className="mt-12 flex items-center justify-center gap-8 md:gap-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-pink-400">15</div>
            <div className="text-gray-500 text-sm">Tracks</div>
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-pink-500/30 to-transparent" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-pink-400">6</div>
            <div className="text-gray-500 text-sm">Album Spots</div>
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-pink-500/30 to-transparent" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-pink-400">2</div>
            <div className="text-gray-500 text-sm">Bonus Tracks</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-pink-500/50" />
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) rotate(-5deg);
          }
          66% {
            transform: translateY(-25px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;