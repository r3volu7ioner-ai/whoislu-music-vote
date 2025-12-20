import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Lock, Music, Save, Trash2, Plus, ArrowLeft, Image, Clock, 
  Tag, Sparkles, Star, BarChart3, Users, MessageSquare, Vote,
  Eye, EyeOff, RefreshCw, Check, X, Upload, FileText, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: number;
  title: string;
  duration: string;
  is_bonus: boolean;
  edition: string;
  emotional_tag: string;
  cover_image: string;
  audio_url: string;
  sort_order: number;
}

interface SiteContent {
  id: number;
  key: string;
  title: string;
  content: string;
  is_active: boolean;
}

interface Stats {
  totalTracks: number;
  totalVotes: number;
  totalComments: number;
  uniqueVoters: number;
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [savedPassword, setSavedPassword] = useState('');
  const [uploading, setUploading] = useState<{ field: 'audio' | 'cover'; trackId: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'tracks' | 'content'>('tracks');
  const [newContentKey, setNewContentKey] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();


  async function uploadToBucket(params: { field: 'audio' | 'cover'; file: File }) {
    if (!editingTrack) return;
    const pwd = savedPassword || password.trim();
    if (!pwd) {
      toast({ title: 'Nicht eingeloggt', description: 'Bitte zuerst im Admin-Panel einloggen.' });
      return;
    }

    const bucket = params.field === 'audio' ? 'audio-tracks' : 'cover-images';
    const folder = params.field === 'audio' ? 'tracks' : 'covers';

    try {
      setUploading({ field: params.field, trackId: editingTrack.id });

      const { data, error } = await supabase.functions.invoke('whoislu-api', {
        body: {
          action: 'adminCreateSignedUpload',
          password: pwd,
          bucket,
          folder,
          fileName: params.file.name,
          contentType: params.file.type || 'application/octet-stream'
        }
      });

      if (error) throw error;
      const { path, token } = data as any;

      // Upload file using signed token
      const up = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, params.file);
      if (up.error) throw up.error;

      const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

      if (params.field === 'audio') {
        setEditingTrack({ ...editingTrack, audio_url: publicUrl });
      } else {
        setEditingTrack({ ...editingTrack, cover_image: publicUrl });
      }

      toast({ title: 'Upload fertig', description: 'URL wurde automatisch eingetragen.' });
    } catch (e: any) {
      console.error('Upload error', e);
      toast({ title: 'Upload fehlgeschlagen', description: e?.message ?? String(e) });
    } finally {
      setUploading(null);
    }
  }

  const handleLogin = async () => {
    if (!password.trim()) {
      setLoginError('Bitte Passwort eingeben');
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const { data, error } = await supabase.functions.invoke('whoislu-api', {
        body: { action: 'adminLogin', password: password.trim() }
      });

      if (error) {
        console.error('Login error:', error);
        setLoginError('Verbindungsfehler. Bitte erneut versuchen.');
        setIsLoading(false);
        return;
      }

      if (data && data.success) {
        setIsAuthenticated(true);
        setSavedPassword(password.trim());
        toast({ title: 'Willkommen!', description: 'Du bist jetzt eingeloggt.' });
        // Load data after successful login
        await loadAllData(password.trim());
      } else {
        setLoginError('Falsches Passwort!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Ein Fehler ist aufgetreten. Bitte erneut versuchen.');
    }
    setIsLoading(false);
  };

  const loadAllData = async (pwd: string) => {
    try {
      // Load tracks
      const tracksRes = await supabase.functions.invoke('whoislu-api', {
        body: { action: 'adminGetTracks', password: pwd }
      });
      if (tracksRes.data?.tracks) {
        setTracks(tracksRes.data.tracks);
      }

      // Load stats
      const statsRes = await supabase.functions.invoke('whoislu-api', {
        body: { action: 'adminGetStats', password: pwd }
      });
      if (statsRes.data) {
        setStats(statsRes.data);
      }

      // Load site content
      const contentRes = await supabase.functions.invoke('whoislu-api', {
        body: { action: 'adminGetSiteContent', password: pwd }
      });
      if (contentRes.data?.content) {
        setSiteContent(contentRes.data.content);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSaveTrack = async (track: Track) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('whoislu-api', {
        body: {
          action: 'adminUpdateTrack',
          password: savedPassword,
          trackId: track.id,
          updates: {
            title: track.title,
            duration: track.duration,
            isBonus: track.is_bonus,
            edition: track.edition,
            emotionalTag: track.emotional_tag,
            coverImage: track.cover_image,
            audioUrl: track.audio_url,
            sortOrder: track.sort_order
          }
        }
      });

      if (error) throw error;

      toast({ title: 'Gespeichert!', description: `"${track.title}" wurde aktualisiert.` });
      setEditingTrack(null);
      await loadAllData(savedPassword);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Speichern fehlgeschlagen', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleCreateTrack = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('whoislu-api', {
        body: {
          action: 'adminCreateTrack',
          password: savedPassword,
          track: {
            title: 'Neuer Track',
            duration: '0:00',
            isBonus: false,
            edition: 'New Edition',
            emotionalTag: 'New Emotion',
            coverImage: '',
            audioUrl: ''
          }
        }
      });

      if (error) throw error;

      toast({ title: 'Erstellt!', description: 'Neuer Track wurde hinzugefügt.' });
      await loadAllData(savedPassword);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Erstellen fehlgeschlagen', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleDeleteTrack = async (trackId: number, title: string) => {
    if (!confirm(`Bist du sicher, dass du "${title}" löschen möchtest? Alle Votes und Kommentare werden auch gelöscht!`)) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('whoislu-api', {
        body: { action: 'adminDeleteTrack', password: savedPassword, trackId }
      });

      if (error) throw error;

      toast({ title: 'Gelöscht!', description: `"${title}" wurde entfernt.` });
      await loadAllData(savedPassword);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Löschen fehlgeschlagen', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  // Site Content Functions
  const handleSaveContent = async (content: SiteContent) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('whoislu-api', {
        body: {
          action: 'adminUpdateSiteContent',
          password: savedPassword,
          key: content.key,
          title: content.title,
          content: content.content,
          isActive: content.is_active
        }
      });

      if (error) throw error;

      toast({ title: 'Gespeichert!', description: `"${content.key}" wurde aktualisiert.` });
      setEditingContent(null);
      await loadAllData(savedPassword);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Speichern fehlgeschlagen', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleCreateContent = async () => {
    if (!newContentKey.trim()) {
      toast({ title: 'Fehler', description: 'Bitte gib einen Key ein', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('whoislu-api', {
        body: {
          action: 'adminCreateSiteContent',
          password: savedPassword,
          key: newContentKey.toLowerCase().replace(/\s+/g, '_'),
          title: 'Neuer Inhalt',
          content: ''
        }
      });

      if (error) throw error;

      toast({ title: 'Erstellt!', description: 'Neuer Inhalt wurde hinzugefügt.' });
      setNewContentKey('');
      await loadAllData(savedPassword);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Erstellen fehlgeschlagen', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleDeleteContent = async (key: string) => {
    if (!confirm(`Bist du sicher, dass du "${key}" löschen möchtest?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('whoislu-api', {
        body: { action: 'adminDeleteSiteContent', password: savedPassword, key }
      });

      if (error) throw error;

      toast({ title: 'Gelöscht!', description: `"${key}" wurde entfernt.` });
      await loadAllData(savedPassword);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Löschen fehlgeschlagen', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const getContentLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'about': 'Über WhoIsLu',
      'project': 'Das Projekt',
      'behind_scenes': 'Behind the Scenes',
      'hero_title': 'Hero Titel',
      'hero_subtitle': 'Hero Untertitel'
    };
    return labels[key] || key;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 mb-4">
                <Lock className="w-8 h-8 text-pink-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Bereich</h1>
              <p className="text-gray-400 text-sm">Gib dein Passwort ein, um fortzufahren</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Passwort eingeben..."
                  className="bg-white/5 border-white/10 text-white pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleLogin();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {loginError && (
                <p className="text-red-400 text-sm text-center">{loginError}</p>
              )}

              <Button
                onClick={handleLogin}
                disabled={isLoading || !password.trim()}
                className="w-full bg-pink-500 hover:bg-pink-400 text-white"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Einloggen
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Seite
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-gray-500 text-xs text-center">
                Passwort: <span className="text-pink-400 font-mono">lu2024</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-pink-400" />
              Admin Panel
            </h1>
          </div>

          <Button
            onClick={() => loadAllData(savedPassword)}
            variant="outline"
            size="sm"
            className="border-white/10 text-gray-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Music className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalTracks}</p>
                  <p className="text-xs text-gray-400">Tracks</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Vote className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalVotes}</p>
                  <p className="text-xs text-gray-400">Votes</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalComments}</p>
                  <p className="text-xs text-gray-400">Kommentare</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.uniqueVoters}</p>
                  <p className="text-xs text-gray-400">Teilnehmer</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('tracks')}
            variant={activeTab === 'tracks' ? 'default' : 'ghost'}
            className={activeTab === 'tracks' ? 'bg-pink-500 hover:bg-pink-400' : 'text-gray-400 hover:text-white'}
          >
            <Music className="w-4 h-4 mr-2" />
            Tracks
          </Button>
          <Button
            onClick={() => setActiveTab('content')}
            variant={activeTab === 'content' ? 'default' : 'ghost'}
            className={activeTab === 'content' ? 'bg-pink-500 hover:bg-pink-400' : 'text-gray-400 hover:text-white'}
          >
            <FileText className="w-4 h-4 mr-2" />
            Seiteninhalte
          </Button>
        </div>

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Tracks verwalten</h2>
              <Button
                onClick={handleCreateTrack}
                disabled={isLoading}
                className="bg-pink-500 hover:bg-pink-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Neuer Track
              </Button>
            </div>

            <div className="space-y-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden"
                >
                  {editingTrack?.id === track.id ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Titel</label>
                          <Input
                            value={editingTrack.title}
                            onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Dauer</label>
                          <Input
                            value={editingTrack.duration}
                            onChange={(e) => setEditingTrack({ ...editingTrack, duration: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="3:42"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Edition</label>
                          <Input
                            value={editingTrack.edition}
                            onChange={(e) => setEditingTrack({ ...editingTrack, edition: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Emotional Tag</label>
                          <Input
                            value={editingTrack.emotional_tag}
                            onChange={(e) => setEditingTrack({ ...editingTrack, emotional_tag: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Cover Bild URL</label>
                          <Input
                            value={editingTrack.cover_image}
                            onChange={(e) => setEditingTrack({ ...editingTrack, cover_image: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://..."
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              className="bg-white/5 border-white/10 text-white file:text-white file:bg-white/10 file:border-0 file:rounded-md file:px-3 file:py-2"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadToBucket({ field: 'cover', file: f });
                              }}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={!!uploading && uploading.field === 'cover' && uploading.trackId === editingTrack.id}
                              onClick={() => toast({ title: 'Tipp', description: 'Wähle eine Datei – der Upload startet sofort.' })}
                              className="bg-white/10 hover:bg-white/20 text-white"
                            >
                              {uploading && uploading.field === 'cover' && uploading.trackId === editingTrack.id ? 'Uploading…' : 'Upload'}
                            </Button>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Audio URL</label>
                          <Input
                            value={editingTrack.audio_url || ''}
                            onChange={(e) => setEditingTrack({ ...editingTrack, audio_url: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="https://..."
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              type="file"
                              accept="audio/*"
                              className="bg-white/5 border-white/10 text-white file:text-white file:bg-white/10 file:border-0 file:rounded-md file:px-3 file:py-2"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadToBucket({ field: 'audio', file: f });
                              }}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={!!uploading && uploading.field === 'audio' && uploading.trackId === editingTrack.id}
                              onClick={() => toast({ title: 'Tipp', description: 'Wähle eine Datei – der Upload startet sofort.' })}
                              className="bg-white/10 hover:bg-white/20 text-white"
                            >
                              {uploading && uploading.field === 'audio' && uploading.trackId === editingTrack.id ? 'Uploading…' : 'Upload'}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingTrack.is_bonus}
                              onChange={(e) => setEditingTrack({ ...editingTrack, is_bonus: e.target.checked })}
                              className="rounded bg-white/10 border-white/20"
                            />
                            Bonus Track
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Sortierung</label>
                          <Input
                            type="number"
                            value={editingTrack.sort_order}
                            onChange={(e) => setEditingTrack({ ...editingTrack, sort_order: parseInt(e.target.value) || 0 })}
                            className="bg-white/5 border-white/10 text-white w-24"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                        <Button
                          onClick={() => handleSaveTrack(editingTrack)}
                          disabled={isLoading}
                          className="bg-green-500 hover:bg-green-400"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Speichern
                        </Button>
                        <Button
                          onClick={() => setEditingTrack(null)}
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                        {track.cover_image ? (
                          <img
                            src={track.cover_image}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white truncate">{track.title}</h3>
                          {track.is_bonus && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                              Bonus
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {track.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {track.edition}
                          </span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {track.emotional_tag}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setEditingTrack(track)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          Bearbeiten
                        </Button>
                        <Button
                          onClick={() => handleDeleteTrack(track.id, track.title)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {tracks.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Keine Tracks vorhanden</p>
              </div>
            )}
          </>
        )}

        {/* Site Content Tab */}
        {activeTab === 'content' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Seiteninhalte verwalten</h2>
              <div className="flex items-center gap-2">
                <Input
                  value={newContentKey}
                  onChange={(e) => setNewContentKey(e.target.value)}
                  placeholder="Neuer Key (z.B. faq)"
                  className="bg-white/5 border-white/10 text-white w-48"
                />
                <Button
                  onClick={handleCreateContent}
                  disabled={isLoading || !newContentKey.trim()}
                  className="bg-pink-500 hover:bg-pink-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {siteContent.map((content) => (
                <div
                  key={content.id}
                  className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden"
                >
                  {editingContent?.id === content.id ? (
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Key (nicht änderbar)</label>
                          <Input
                            value={editingContent.key}
                            disabled
                            className="bg-white/10 border-white/10 text-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Titel</label>
                          <Input
                            value={editingContent.title}
                            onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Inhalt</label>
                          <Textarea
                            value={editingContent.content}
                            onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                            className="bg-white/5 border-white/10 text-white min-h-[150px]"
                            placeholder="Hier den Inhalt eingeben..."
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingContent.is_active}
                              onChange={(e) => setEditingContent({ ...editingContent, is_active: e.target.checked })}
                              className="rounded bg-white/10 border-white/20"
                            />
                            Aktiv (auf der Seite anzeigen)
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                        <Button
                          onClick={() => handleSaveContent(editingContent)}
                          disabled={isLoading}
                          className="bg-green-500 hover:bg-green-400"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Speichern
                        </Button>
                        <Button
                          onClick={() => setEditingContent(null)}
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded font-mono">
                              {content.key}
                            </span>
                            {!content.is_active && (
                              <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded">
                                Inaktiv
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-white">{content.title || getContentLabel(content.key)}</h3>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {content.content || 'Kein Inhalt'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setEditingContent(content)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            Bearbeiten
                          </Button>
                          <Button
                            onClick={() => handleDeleteContent(content.key)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {siteContent.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Keine Seiteninhalte vorhanden</p>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Hinweis zu Seiteninhalten
              </h3>
              <p className="text-gray-400 text-sm">
                Die Seiteninhalte werden über den "Key" identifiziert. Verfügbare Keys:
              </p>
              <ul className="text-gray-400 text-sm mt-2 space-y-1">
                <li><code className="text-pink-400">about</code> - Über WhoIsLu Seite</li>
                <li><code className="text-pink-400">project</code> - Das Projekt Seite</li>
                <li><code className="text-pink-400">behind_scenes</code> - Behind the Scenes</li>
                <li><code className="text-pink-400">hero_title</code> - Haupttitel auf der Startseite</li>
                <li><code className="text-pink-400">hero_subtitle</code> - Untertitel auf der Startseite</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;