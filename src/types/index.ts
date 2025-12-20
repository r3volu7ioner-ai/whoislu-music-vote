export interface Track {
  id: number;
  title: string;
  duration: string;
  isBonus: boolean;
  edition: string;
  emotionalTag: string;
  votes: number;
  favorites: number;
  comments: Comment[];
  coverImage: string;
  audioUrl?: string;
}

export interface Comment {
  id: string;
  voterName: string;
  text: string;
  timestamp: number; // seconds into the track
  createdAt: Date;
}

export interface Voter {
  name: string;
  votedTracks: number[];
  favoriteTracks: number[];
}