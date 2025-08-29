import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Music, Users, Lock, Globe, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {url} from "@/utils/url";


interface Playlist {
  id: string;
  name: string;
  description: string;
  track_count: number;
  owner: string;
  public: boolean;
  is_liked_songs: boolean;
}

interface PlaylistSelectorProps {
  onStartTransfer: (selectedPlaylists: string[], options: TransferOptions) => void;
}

interface TransferOptions {
  create_new_playlists: boolean;
  overwrite_existing: boolean;
  privacy_status: 'public' | 'unlisted' | 'private';
}

export const PlaylistSelector = ({ onStartTransfer }: PlaylistSelectorProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [transferOptions, setTransferOptions] = useState<TransferOptions>({
    create_new_playlists: true,
    overwrite_existing: false,
    privacy_status: 'private'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
  try {
    const rep = await axios.post(
      `${url}/playlist/get`,
      {},
      {
        headers: {
          Authorization: `${window.sessionStorage.getItem("token")}`,
        },
      }
    );

    console.log("Playlist API response:", rep.data);

    if (
      rep.data.success === "True" &&
      rep.data.playlists &&
      Array.isArray(rep.data.playlists)
    ) {
      setPlaylists(rep.data.playlists);
    } else {
      console.warn("Unexpected playlist response structure:", rep.data);
      setPlaylists([]); 
      toast({
        title: "Failed to Load Playlists",
        description: "Unexpected response format from server.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error fetching playlists:", error);
    toast({
      title: "Failed to Load Playlists",
      description: "Could not fetch your Spotify playlists. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  const togglePlaylistSelection = (playlistId: string) => {
    const newSelection = new Set(selectedPlaylists);
    if (newSelection.has(playlistId)) {
      newSelection.delete(playlistId);
    } else {
      newSelection.add(playlistId);
    }
    setSelectedPlaylists(newSelection);
  };

  const selectAll = () => {
    setSelectedPlaylists(new Set(playlists.map(p => p.id)));
  };

  const selectNone = () => {
    setSelectedPlaylists(new Set());
  };

  const handleStartTransfer = async () => {
  if (selectedPlaylists.size === 0) {
    toast({
      title: "No Playlists Selected",
      description: "Please select at least one playlist to transfer.",
      variant: "destructive",
    });
    return;
  }

  try {
    const resp = await axios.post(
      `${url}/transfer/start`,
      {
        playlist_ids: Array.from(selectedPlaylists), 
        options: {} 
      },
      {
        headers: {
          Authorization: `${window.sessionStorage.getItem("token")}`,
        },
      }
    );

    if (resp.data.success === "True") {
      window.sessionStorage.setItem("task_id", resp.data.task_id);
      onStartTransfer(Array.from(selectedPlaylists), transferOptions);
    } else {
      toast({
        title: "Failed to Start Transfer",
        description: "Could not initiate the transfer process. Please try again.",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error?.response?.data?.detail || "Something went wrong",
      variant: "destructive",
    });
  }
};

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading your playlists...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select Playlists to Transfer</h2>
        <p className="text-muted-foreground">
          Choose which Spotify playlists you'd like to migrate to YouTube Music
        </p>
      </div>

      
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={selectAll} size="sm">
            Select All ({playlists.length})
          </Button>
          <Button variant="outline" onClick={selectNone} size="sm">
            Select None
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedPlaylists.size} of {playlists.length} playlists selected
        </div>
      </div>

     
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <Card 
            key={playlist.id} 
            className={`playlist-card cursor-pointer transition-all duration-200 ${
              selectedPlaylists.has(playlist.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => togglePlaylistSelection(playlist.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    {playlist.is_liked_songs ? (
                      <Heart className="w-5 h-5 text-primary" />
                    ) : (
                      <Music className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <Checkbox 
                    checked={selectedPlaylists.has(playlist.id)}
                    onChange={() => togglePlaylistSelection(playlist.id)}
                  />
                </div>
                <div className="flex items-center gap-1">
                  {playlist.public ? (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <CardTitle className="text-base line-clamp-1">{playlist.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {playlist.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  {playlist.track_count} tracks
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {playlist.owner}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    
      <Card className="playlist-card">
        <CardHeader>
          <CardTitle>Transfer Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-new"
                  checked={transferOptions.create_new_playlists}
                  onCheckedChange={(checked) =>
                    setTransferOptions(prev => ({ ...prev, create_new_playlists: checked }))
                  }
                />
                <Label htmlFor="create-new">Create new playlists</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="overwrite"
                  checked={transferOptions.overwrite_existing}
                  onCheckedChange={(checked) =>
                    setTransferOptions(prev => ({ ...prev, overwrite_existing: checked }))
                  }
                />
                <Label htmlFor="overwrite">Overwrite existing playlists</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Privacy Setting</Label>
              <Select
                value={transferOptions.privacy_status}
                onValueChange={(value: 'public' | 'unlisted' | 'private') =>
                  setTransferOptions(prev => ({ ...prev, privacy_status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleStartTransfer}
            disabled={selectedPlaylists.size === 0}
            className="hero-button w-full"
          >
            Start Transfer ({selectedPlaylists.size} playlist{selectedPlaylists.size !== 1 ? 's' : ''})
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};