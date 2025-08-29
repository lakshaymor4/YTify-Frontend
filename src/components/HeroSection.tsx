import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Youtube } from "lucide-react";
import heroImage from "@/assets/hero-music.jpg";
import axios from "axios";
import { url } from "@/utils/url";
import { useToast } from "@/hooks/use-toast";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const { toast } = useToast();
  const get_jwt = async() =>{
    console.log(url)
    await axios.get(`${url}/auth/gett`)
    .then(resp=>{
      console.log(resp)
      if(resp.data.status=="success"){
        window.sessionStorage.setItem("token", resp.data.token);
        onGetStarted();
      }
      else{
         toast({
            title: "Auth error",
            description: "Auth Failed.",
            variant: "destructive",
          });
      }
    })
    .catch(err=>{
      toast({
        title: "Auth error",
        description: "Auth Failed.",
        variant: "destructive",
      });
    });

  }
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
 
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80" />
      </div>

 
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="animate-fade-in">
 
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Music className="w-8 h-8 text-success" />
            </div>
            <ArrowRight className="w-8 h-8 text-muted-foreground animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
              <Youtube className="w-8 h-8 text-secondary" />
            </div>
          </div>

       
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Migrate Your{" "}
            <span className="gradient-text">Spotify Playlists</span>
            <br />
            to YouTube Music
          </h1>

         
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Seamlessly transfer all your carefully curated playlists from Spotify to YouTube Music. 
            Keep your music organized and never lose a beat.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">All Playlists</h3>
              <p className="text-sm text-muted-foreground">
                Transfer public, private, and liked songs playlists
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Progress</h3>
              <p className="text-sm text-muted-foreground">
                Track your transfer progress with live updates
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Youtube className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Privacy Control</h3>
              <p className="text-sm text-muted-foreground">
                Choose public, unlisted, or private for new playlists
              </p>
            </div>
          </div>

          <Button 
            onClick={get_jwt}
            size="lg"
            className="hero-button text-lg px-8 py-6 animate-pulse-glow"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

         
          <div className="mt-12 text-sm text-muted-foreground">
            <p>✓ Secure authentication • ✓ No data stored • ✓ Open source</p>
          </div>
        </div>
      </div>

      
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />
    </div>
  );
};