import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Heart, Star, MessageCircle, Clock, Sparkles, ChevronDown, ChevronUp, Send, Volume2, VolumeX } from 'lucide-react';
import { Track, Comment } from '@/types';

interface TrackCardProps {
  track: Track;
  voterName: string;
  hasVoted: boolean;
  isFavorite: boolean;
  onVote: (trackId: number) => void;
  onFavorite: (trackId: number) => void;
  onAddComment: (trackId: number, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  rank?: number;
}

const TrackCard: React.FC<TrackCardProps> = ({
  track,
  voterName,
  hasVoted,
  isFavorite,
  onVote,
  onFavorite,
  onAddComment,
  rank
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformHover, setWaveformHover] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Parse duration to seconds
  const parseDuration = (duration: string): number => {
    const [mins, secs] = duration.split(':').map(Number);
    return mins * 60 + secs;
  };

  const totalSeconds = parseDuration(track.duration);

  // Initialize audio element
  useEffect(() => {
    if (track.audioUrl) {
      audioRef.current = new Audio(track.audioUrl);
      audioRef.current.preload = 'metadata';
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(Math.floor(audioRef.current.currentTime));
        }
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audioRef.current.addEventListener('error', () => {
        setAudioError(true);
        setIsPlaying(false);
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [track.audioUrl]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current || audioError) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        setAudioError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = Math.floor(percentage * totalSeconds);
      setCurrentTime(newTime);
      
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  const handleWaveformHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      setWaveformHover(Math.floor(percentage * totalSeconds));
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(track.id, {
        voterName,
        text: newComment.trim(),
        timestamp: currentTime
      });
      setNewComment('');
    }
  };

  // Generate waveform bars
  const waveformBars = Array.from({ length: 50 }, (_, i) => ({
    height: 20 + Math.random() * 60,
    active: (i / 50) * totalSeconds <= currentTime
  }));

  return (
    <div className={`relative group ${track.isBonus ? 'col-span-1' : ''}`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500 ${
        hasVoted 
          ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 opacity-100' 
          : 'bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100'
      }`} />
      
      {/* Card */}
      <div className={`relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 ${
        hasVoted 
          ? 'border-pink-500/50 shadow-lg shadow-pink-500/20' 
          : 'border-white/10 hover:border-pink-500/30'
      } ${track.isBonus ? 'ring-2 ring-cyan-500/30' : ''}`}>
        
        {/* Bonus badge */}
        {track.isBonus && (
          <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            BONUS
          </div>
        )}

        {/* Rank badge */}
        {rank && rank <= 6 && (
          <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-pink-500/30">
            {rank}
          </div>
        )}

        {/* Cover image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={track.coverImage}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Play button overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className={`w-16 h-16 ${audioError ? 'bg-gray-500/90' : 'bg-pink-500/90'} backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50 hover:scale-110 transition-transform`}>
              {audioError ? (
                <VolumeX className="w-7 h-7 text-white" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" />
              )}
            </div>
          </button>

          {/* Now playing indicator */}
          {isPlaying && (
            <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-pink-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
                <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              </div>
              <span>Playing</span>
            </div>
          )}

          {/* Track info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
              {track.title}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-pink-300">{track.edition}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {track.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Waveform / Progress bar */}
        <div 
          ref={progressRef}
          className="h-16 px-4 py-2 bg-black/30 cursor-pointer relative"
          onClick={handleWaveformClick}
          onMouseMove={handleWaveformHover}
          onMouseLeave={() => setWaveformHover(null)}
        >
          <div className="flex items-end justify-between h-full gap-[2px]">
            {waveformBars.map((bar, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all duration-150 ${
                  bar.active 
                    ? 'bg-gradient-to-t from-pink-500 to-pink-400' 
                    : 'bg-white/20 group-hover:bg-white/30'
                }`}
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
          
          {/* Timestamp tooltip */}
          {waveformHover !== null && (
            <div 
              className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 rounded text-xs text-white pointer-events-none"
              style={{ left: `${(waveformHover / totalSeconds) * 100}%`, transform: 'translateX(-50%)' }}
            >
              {formatTime(waveformHover)}
            </div>
          )}

          {/* Comment markers */}
          {track.comments.map((comment) => (
            <div
              key={comment.id}
              className="absolute bottom-0 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 cursor-pointer hover:scale-150 transition-transform"
              style={{ left: `${(comment.timestamp / totalSeconds) * 100}%` }}
              title={`${comment.voterName}: ${comment.text}`}
            />
          ))}
        </div>

        {/* Current time display */}
        <div className="px-4 py-1 flex justify-between items-center text-xs text-gray-400 bg-black/20">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            {track.audioUrl && (
              <button
                onClick={toggleMute}
                className="p-1 hover:text-pink-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            )}
            <span>{track.duration}</span>
          </div>
        </div>

        {/* Emotional tag */}
        <div className="px-4 py-2 border-t border-white/5">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{track.emotionalTag}</span>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Vote button */}
            <button
              onClick={() => onVote(track.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                hasVoted
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-white/10 text-gray-300 hover:bg-pink-500/20 hover:text-pink-300'
              }`}
            >
              <Star className={`w-4 h-4 ${hasVoted ? 'fill-white' : ''}`} />
              <span>{track.votes}</span>
            </button>

            {/* Favorite button */}
            <button
              onClick={() => onFavorite(track.id)}
              className={`p-2 rounded-lg transition-all ${
                isFavorite
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/10 text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-400' : ''}`} />
            </button>
          </div>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{track.comments.length}</span>
            {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="border-t border-white/5 bg-black/30">
            {/* Add comment */}
            <div className="p-4 border-b border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Comment at ${formatTime(currentTime)}...`}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="p-2 bg-pink-500 hover:bg-pink-400 disabled:bg-gray-600 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Comments list */}
            <div className="max-h-48 overflow-y-auto">
              {track.comments.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm text-center">No comments yet. Be the first!</p>
              ) : (
                track.comments.map((comment) => (
                  <div key={comment.id} className="p-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-pink-400 font-medium text-sm">{comment.voterName}</span>
                      <span className="text-xs text-gray-500">at {formatTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackCard;