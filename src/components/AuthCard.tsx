import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Music, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {url} from "@/utils/url";
import axios from "axios";

interface AuthCardProps {
  onAuthComplete: () => void;
}

export const AuthCard = ({ onAuthComplete }: AuthCardProps) => {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeHeader, setYoutubeHeader] = useState("");
  const [isConnecting, setIsConnecting] = useState({ spotify: false, youtube: false });
  const { toast } = useToast();

const handleSpotifyLogin = () => {
  const token = window.sessionStorage.getItem("token");
  const authUrl = `${url}/auth/spotify/login?token=${token || ''}`;

  const popup = window.open(authUrl, "SpotifyLogin", "width=500,height=650");

  const messageHandler = (event: MessageEvent) => {
    if (event.data?.type === "SPOTIFY_AUTH_DONE") {
      popup?.close();
      setSpotifyConnected(true); // <-- update state
      toast({
        title: "Spotify Connected!",
        description: "Successfully authenticated with Spotify",
      });
      window.removeEventListener("message", messageHandler);
    }
  };

  window.addEventListener("message", messageHandler);
};

  const handleYouTubeConnect = async () => {
    if (!youtubeHeader.trim()) {
      toast({
        title: "Missing Header",
        description: "Please enter your YouTube Music header",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(prev => ({ ...prev, youtube: true }));
    try {
       await axios.post(
        `${url}/auth/setyt`,
        { headers: youtubeHeader }, // request body
      {
        headers: {
          Authorization: `${window.sessionStorage.getItem("token")}`,
        },
      }
      )
      .then(resp=>{
        console.log(resp)
        if(resp.data.status=="success"){
          setYoutubeConnected(true);
          toast({
            title: "YouTube Music Connected!",
            description: "Successfully authenticated with YouTube Music",
          });
        }
        else{
          toast({
            title: "Connection Failed",
            description: "Failed to connect to YouTube Music. Please check your header.",
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        console.error(error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect to YouTube Music. Please check your header.",
          variant: "destructive",
        });
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to YouTube Music. Please check your header.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(prev => ({ ...prev, youtube: false }));
    }
  };

  const isFullyAuthenticated = spotifyConnected && youtubeConnected;

  if (isFullyAuthenticated) {
    setTimeout(() => onAuthComplete(), 1000);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
   
      <Card className="playlist-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            Connect Spotify
            {spotifyConnected && <CheckCircle className="w-5 h-5 text-success" />}
          </CardTitle>
          <CardDescription>
            Authenticate with your Spotify account to access your playlists
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {spotifyConnected ? (
            <div className="status-connected">
              Connected Successfully
            </div>
          ) : (
            <Button
              onClick={handleSpotifyLogin}
              disabled={isConnecting.spotify}
              className="hero-button w-full"
            >
              {isConnecting.spotify ? "Connecting..." : "Connect Spotify"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="playlist-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
            <Youtube className="w-8 h-8 text-secondary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            Connect YouTube Music
            {youtubeConnected && <CheckCircle className="w-5 h-5 text-success" />}
          </CardTitle>
          <CardDescription>
            Enter your YouTube Music header to enable playlist transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {youtubeConnected ? (
            <div className="status-connected text-center">
              Connected Successfully
            </div>
          ) : (
            <>
              <Input
                placeholder="Paste your YouTube Music header here..."
                value={youtubeHeader}
                onChange={(e) => setYoutubeHeader(e.target.value)}
                className="bg-input/50"
              />
              <Button
                onClick={handleYouTubeConnect}
                disabled={isConnecting.youtube || !youtubeHeader.trim()}
                className="secondary-button w-full"
              >
                {isConnecting.youtube ? "Connecting..." : "Connect YouTube Music"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {isFullyAuthenticated && (
        <div className="md:col-span-2 text-center animate-fade-in">
          <div className="status-connected mb-4">
            Both services connected! Redirecting to playlists...
          </div>
        </div>
      )}
    </div>
  );
};