import React from 'react';
import { MessageCircle, Star, Heart, Clock } from 'lucide-react';
import { Track, Comment } from '@/types';

interface Activity {
  type: 'vote' | 'comment' | 'favorite';
  voterName: string;
  trackTitle: string;
  text?: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  tracks: Track[];
  recentActivities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ tracks, recentActivities }) => {
  // Get all comments from all tracks
  const allComments: Activity[] = tracks.flatMap(track =>
    track.comments.map(comment => ({
      type: 'comment' as const,
      voterName: comment.voterName,
      trackTitle: track.title,
      text: comment.text,
      timestamp: comment.createdAt
    }))
  );

  // Combine and sort by timestamp
  const activities = [...recentActivities, ...allComments]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'vote':
        return <Star className="w-4 h-4 text-pink-400" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-cyan-400" />;
      case 'favorite':
        return <Heart className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-pink-400" />
          Recent Activity
        </h3>
        <p className="text-gray-500 text-sm text-center py-8">
          No activity yet. Be the first to vote!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-pink-400" />
          Recent Activity
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="text-pink-400 font-medium">{activity.voterName}</span>
                  <span className="text-gray-400">
                    {activity.type === 'vote' && ' voted for '}
                    {activity.type === 'comment' && ' commented on '}
                    {activity.type === 'favorite' && ' favorited '}
                  </span>
                  <span className="text-white font-medium">{activity.trackTitle}</span>
                </p>
                {activity.text && (
                  <p className="text-gray-500 text-sm mt-1 truncate">"{activity.text}"</p>
                )}
                <p className="text-gray-600 text-xs mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;