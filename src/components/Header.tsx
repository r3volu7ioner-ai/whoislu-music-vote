import React from 'react';
import { Music, User, Share2, BarChart3 } from 'lucide-react';

interface HeaderProps {
  voterName: string;
  votesRemaining: number;
  onShowResults: () => void;
  onShare: () => void;
}

const Header: React.FC<HeaderProps> = ({ voterName, votesRemaining, onShowResults, onShare }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Music className="w-8 h-8 text-pink-500" />
              <div className="absolute inset-0 w-8 h-8 bg-pink-500 blur-lg opacity-50" />
            </div>
            <div>
            <h1 className="text-xl font-bold text-[#ff0080] drop-shadow-[0_0_15px_rgba(255,0,128,0.6)]">
              WhoIsLu

              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Neon Pink Flames</p>
            </div>

          </div>

          {/* Center - Vote counter */}
          <div className="hidden md:flex items-center gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-gray-400 text-sm">Votes remaining: </span>
              <span className={`font-bold ${votesRemaining > 0 ? 'text-pink-400' : 'text-gray-500'}`}>
                {votesRemaining}
              </span>
              <span className="text-gray-500 text-sm"> / 6</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Results button */}
            <button
              onClick={onShowResults}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Results</span>
            </button>

            {/* Share button */}
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-lg text-white font-medium transition-all shadow-lg shadow-pink-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Share</span>
            </button>

            {/* User info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <User className="w-4 h-4 text-pink-400" />
              <span className="text-gray-300 text-sm font-medium">{voterName}</span>
            </div>
          </div>
        </div>

        {/* Mobile vote counter */}
        <div className="md:hidden mt-3 flex justify-center">
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="text-gray-400 text-sm">Votes: </span>
            <span className={`font-bold ${votesRemaining > 0 ? 'text-pink-400' : 'text-gray-500'}`}>
              {6 - votesRemaining}
            </span>
            <span className="text-gray-500 text-sm"> / 6</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;