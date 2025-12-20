import { supabase } from './supabase';
import { Track, Comment } from '@/types';
import { initialTracks } from '@/data/tracks';

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
  timestamp: string;
}

// Get all tracks - falls back to local data if API fails
export async function getTracks(): Promise<Track[]> {
  try {
    const { data, error } = await supabase.functions.invoke('whoislu-api', {
      body: { action: 'getTracks' }
    });
    if (error || !data?.tracks) throw error;
    return data.tracks;
  } catch (err) {
    console.warn('Using local tracks data');
    return initialTracks;
  }
}

// Register or get existing voter - creates local voter if API fails
export async function registerVoter(name: string): Promise<ApiVoter> {
  try {
    const { data, error } = await supabase.functions.invoke('whoislu-api', {
      body: { action: 'registerVoter', name }
    });
    if (error || !data?.voter) throw error;
    return data.voter;
  } catch (err) {
    console.warn('Using local voter');
    return {
      id: `local-${Date.now()}`,
      name,
      votedTracks: [],
      favoriteTracks: []
    };
  }
}

// Toggle vote for a track
export async function toggleVote(voterId: string, trackId: number): Promise<'added' | 'removed'> {
  try {
    const { data, error } = await supabase.functions.invoke('whoislu-api', {
      body: { action: 'vote', voterId, trackId }
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return data.action;
  } catch (err) {
    return 'added'; // Optimistic for local mode
  }
}

// Toggle favorite for a track
export async function toggleFavorite(voterId: string, trackId: number): Promise<'added' | 'removed'> {
  try {
    const { data, error } = await supabase.functions.invoke('whoislu-api', {
      body: { action: 'favorite', voterId, trackId }
    });
    if (error) throw error;
    return data.action;
  } catch (err) {
    return 'added';
  }
}

// Add a comment to a track
export async function addComment(
  voterId: string,
  trackId: number,
  text: string,
  timestamp: number
): Promise<Comment> {
  try {
    const { data, error } = await supabase.functions.invoke('whoislu-api', {
      body: { action: 'addComment', voterId, trackId, text, timestamp }
    });
    if (error) throw error;
    return data.comment;
  } catch (err) {
    return {
      id: `local-${Date.now()}`,
      voterName: 'You',
      text,
      timestamp,
      createdAt: new Date()
    };
  }
}

// Get recent activity
export async function getRecentActivity(): Promise<Activity[]> {
  try {
    const { data, error } = await supabase.functions.invoke('whoislu-api', {
      body: { action: 'getRecentActivity' }
    });
    if (error) throw error;
    return data.activities || [];
  } catch (err) {
    return [];
  }
}