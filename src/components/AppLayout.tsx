import React, { useState, useEffect, useCallback } from 'react';
import { Track, Comment } from '@/types';
import { getTracks, registerVoter, toggleVote, toggleFavorite, addComment, getRecentActivity } from '@/lib/api';
import VoterEntry from './VoterEntry';
import Header from './Header';
import HeroSection from './HeroSection';
import TrackCard from './TrackCard';
import ResultsModal from './ResultsModal';
import ShareModal from './ShareModal';
import ActivityFeed from './ActivityFeed';
import Footer from './Footer';
import { Grid, List, Sparkles, Music, Loader2 } from 'lucide-react';
// Version 2.0 - All Lu.bryd references removed


interface ApiVoter {
  id: string;
  name: string;
  votedTracks: number[];
  favoriteTracks: number[];
}

interface Activity {
  type: 'vote' | 'comment' | 'favorite';
  voterName: string;
  trackTitle: string;
  text?: string;
  timestamp: Date;
}

const AppLayout: React.FC = () => {
  const [voter, setVoter] = useState<ApiVoter | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'standard' | 'bonus'>('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tracks on mount
  useEffect(() => {
    loadTracks();
    loadActivities();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      loadTracks();
      loadActivities();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadTracks = async () => {
    try {
      const data = await getTracks();
      setTracks(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setError('Failed to load tracks. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const data = await getRecentActivity();
      setActivities(data.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      })));
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  };

  // Calculate votes remaining
  const votesRemaining = voter ? 6 - voter.votedTracks.length : 6;

  // Handle voter entry
  const handleVoterEntry = async (name: string) => {
    try {
      setLoading(true);
      const voterData = await registerVoter(name);
      setVoter(voterData);
      await loadTracks();
    } catch (err) {
      console.error('Failed to register voter:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle vote
  const handleVote = async (trackId: number) => {
    if (!voter) return;

    const hasVoted = voter.votedTracks.includes(trackId);
    
    // Optimistic update
    if (hasVoted) {
      setVoter({
        ...voter,
        votedTracks: voter.votedTracks.filter(id => id !== trackId)
      });
      setTracks(tracks.map(track =>
        track.id === trackId
          ? { ...track, votes: Math.max(0, track.votes - 1) }
          : track
      ));
    } else if (votesRemaining > 0) {
      setVoter({
        ...voter,
        votedTracks: [...voter.votedTracks, trackId]
      });
      setTracks(tracks.map(track =>
        track.id === trackId
          ? { ...track, votes: track.votes + 1 }
          : track
      ));
    } else {
      return; // No votes remaining
    }

    try {
      const action = await toggleVote(voter.id, trackId);
      
      // Add to activity feed
      const track = tracks.find(t => t.id === trackId);
      if (track && action === 'added') {
        setActivities(prev => [{
          type: 'vote',
          voterName: voter.name,
          trackTitle: track.title,
          timestamp: new Date()
        }, ...prev.slice(0, 14)]);
      }
    } catch (err: any) {
      console.error('Failed to vote:', err);
      // Revert optimistic update
      await loadTracks();
      if (err.message?.includes('Maximum')) {
        alert('You can only vote for 6 tracks!');
      }
    }
  };

  // Handle favorite
  const handleFavorite = async (trackId: number) => {
    if (!voter) return;

    const isFavorite = voter.favoriteTracks.includes(trackId);
    
    // Optimistic update
    if (isFavorite) {
      setVoter({
        ...voter,
        favoriteTracks: voter.favoriteTracks.filter(id => id !== trackId)
      });
      setTracks(tracks.map(track =>
        track.id === trackId
          ? { ...track, favorites: Math.max(0, track.favorites - 1) }
          : track
      ));
    } else {
      setVoter({
        ...voter,
        favoriteTracks: [...voter.favoriteTracks, trackId]
      });
      setTracks(tracks.map(track =>
        track.id === trackId
          ? { ...track, favorites: track.favorites + 1 }
          : track
      ));
    }

    try {
      const action = await toggleFavorite(voter.id, trackId);
      
      // Add to activity feed
      const track = tracks.find(t => t.id === trackId);
      if (track && action === 'added') {
        setActivities(prev => [{
          type: 'favorite',
          voterName: voter.name,
          trackTitle: track.title,
          timestamp: new Date()
        }, ...prev.slice(0, 14)]);
      }
    } catch (err) {
      console.error('Failed to favorite:', err);
      // Revert optimistic update
      await loadTracks();
    }
  };

  // Handle add comment
  const handleAddComment = async (trackId: number, comment: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!voter) return;

    try {
      const newComment = await addComment(voter.id, trackId, comment.text, comment.timestamp);
      
      setTracks(tracks.map(track =>
        track.id === trackId
          ? { ...track, comments: [newComment, ...track.comments] }
          : track
      ));

      // Add to activity feed
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        setActivities(prev => [{
          type: 'comment',
          voterName: voter.name,
          trackTitle: track.title,
          text: comment.text,
          timestamp: new Date()
        }, ...prev.slice(0, 14)]);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Filter tracks
  const filteredTracks = tracks.filter(track => {
    if (filter === 'standard') return !track.isBonus;
    if (filter === 'bonus') return track.isBonus;
    return true;
  });

  // Sort tracks by votes for ranking
  const sortedTracks = [...tracks].sort((a, b) => b.votes - a.votes);
  const getRank = (trackId: number) => {
    const index = sortedTracks.findIndex(t => t.id === trackId);
    return index + 1;
  };

  // Show loading state
  if (loading && !voter) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading the Lu.niverse...</p>
        </div>
      </div>
    );
  }

  // Show voter entry if no voter
  if (!voter) {
    return <VoterEntry onEnter={handleVoterEntry} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <Header
        voterName={voter.name}
        votesRemaining={votesRemaining}
        onShowResults={() => setShowResults(true)}
        onShare={() => setShowShare(true)}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12" id="tracks">
        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Music className="w-8 h-8 text-pink-500" />
              All Tracks
            </h2>
            <p className="text-gray-400">
              Listen, comment, and vote for your favorites. Top 6 make the album!
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({tracks.length})
              </button>
              <button
                onClick={() => setFilter('standard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === 'standard'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Standard ({tracks.filter(t => !t.isBonus).length})
              </button>
              <button
                onClick={() => setFilter('bonus')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                  filter === 'bonus'
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Bonus ({tracks.filter(t => t.isBonus).length})
              </button>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Voting Progress */}
        {voter.votedTracks.length > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Your Voting Progress</span>
              <span className="text-pink-400 font-bold">{voter.votedTracks.length} / 6 votes used</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(voter.votedTracks.length / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tracks Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {filteredTracks.map(track => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    voterName={voter.name}
                    hasVoted={voter.votedTracks.includes(track.id)}
                    isFavorite={voter.favoriteTracks.includes(track.id)}
                    onVote={handleVote}
                    onFavorite={handleFavorite}
                    onAddComment={handleAddComment}
                    rank={getRank(track.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Activity Feed */}
          <div className="lg:w-80 lg:sticky lg:top-24 lg:self-start">
            <ActivityFeed tracks={tracks} recentActivities={activities} />
            
            {/* Quick Stats */}
            <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
              <h4 className="text-white font-bold mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Votes</span>
                  <span className="text-pink-400 font-bold">
                    {tracks.reduce((sum, t) => sum + t.votes, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Comments</span>
                  <span className="text-cyan-400 font-bold">
                    {tracks.reduce((sum, t) => sum + t.comments.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Your Votes</span>
                  <span className="text-white font-bold">{voter.votedTracks.length} / 6</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        tracks={tracks}
        onShare={() => {
          setShowResults(false);
          setShowShare(true);
        }}
      />
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
};

export default AppLayout;