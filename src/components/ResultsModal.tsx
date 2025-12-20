import React from 'react';
import { X, Trophy, Star, Crown, Sparkles, Share2, Download } from 'lucide-react';
import { Track } from '@/types';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  onShare: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ isOpen, onClose, tracks, onShare }) => {
  if (!isOpen) return null;

  // Sort tracks by votes
  const sortedTracks = [...tracks].sort((a, b) => b.votes - a.votes);
  const topSix = sortedTracks.slice(0, 6);
  const totalVotes = tracks.reduce((sum, t) => sum + t.votes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#1a0a1f] to-[#0a0a0f] border border-pink-500/30 rounded-2xl shadow-2xl shadow-pink-500/20">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Trophy className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Current Rankings</h2>
                <p className="text-gray-400 text-sm">Top 6 tracks make the album</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Confetti effect for top tracks */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Top 6 Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Album Tracks</h3>
              <span className="text-gray-500 text-sm">(Top 6)</span>
            </div>

            <div className="space-y-3">
              {topSix.map((track, index) => {
                const percentage = totalVotes > 0 ? (track.votes / totalVotes) * 100 : 0;
                const isLeader = index === 0;
                
                return (
                  <div
                    key={track.id}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isLeader
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white truncate">{track.title}</h4>
                          {track.isBonus && (
                            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                              Bonus
                            </span>
                          )}
                          {isLeader && (
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">{track.edition}</p>
                      </div>

                      {/* Votes */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-pink-400 font-bold">
                          <Star className="w-4 h-4 fill-pink-400" />
                          {track.votes}
                        </div>
                        <p className="text-gray-500 text-xs">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLeader
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                            : 'bg-pink-500/50'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other tracks */}
          <div>
            <h3 className="text-lg font-bold text-gray-400 mb-4">Other Tracks</h3>
            <div className="space-y-2">
              {sortedTracks.slice(6).map((track, index) => {
                const percentage = totalVotes > 0 ? (track.votes / totalVotes) * 100 : 0;
                
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5"
                  >
                    <span className="w-8 text-center text-gray-500 font-medium">
                      {index + 7}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 truncate">{track.title}</span>
                        {track.isBonus && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                            Bonus
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Star className="w-3 h-3" />
                      {track.votes}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/30">
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Total votes: <span className="text-pink-400 font-bold">{totalVotes}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share Results
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-lg text-white font-medium transition-all"
              >
                Keep Voting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;