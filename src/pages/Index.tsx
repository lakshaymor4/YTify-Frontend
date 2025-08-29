import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AuthCard } from "@/components/AuthCard";
import { PlaylistSelector } from "@/components/PlaylistSelector";
import { TransferProgress } from "@/components/TransferProgress";

type AppStep = 'hero' | 'auth' | 'playlists' | 'transfer' | 'complete';

interface TransferOptions {
  create_new_playlists: boolean;
  overwrite_existing: boolean;
  privacy_status: 'public' | 'unlisted' | 'private';
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('hero');
  const [transferData, setTransferData] = useState<{
    taskId: string;
    selectedPlaylists: string[];
    options: TransferOptions;
  } | null>(null);

  const handleGetStarted = () => {
    setCurrentStep('auth');
  };

  const handleAuthComplete = () => {
    setCurrentStep('playlists');
  };

  const handleStartTransfer = (selectedPlaylists: string[], options: TransferOptions) => {
    const taskId = 'mock-task-' + Date.now();
    setTransferData({ taskId, selectedPlaylists, options });
    setCurrentStep('transfer');
  };

  const handleTransferComplete = () => {
    setCurrentStep('complete');
  };

  const handleTransferCancel = () => {
    setCurrentStep('playlists');
    setTransferData(null);
  };

  const handleStartOver = () => {
    setCurrentStep('hero');
    setTransferData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {currentStep === 'hero' && (
          <HeroSection onGetStarted={handleGetStarted} />
        )}

        {currentStep === 'auth' && (
          <div className="max-w-6xl mx-auto pt-20">
            <div className="text-center mb-12 animate-slide-up">
              <h1 className="text-3xl font-bold mb-4">Connect Your Accounts</h1>
              <p className="text-muted-foreground">
                Connect both Spotify and YouTube Music to begin transferring your playlists
              </p>
            </div>
            <AuthCard onAuthComplete={handleAuthComplete} />
          </div>
        )}

        {currentStep === 'playlists' && (
          <div className="max-w-6xl mx-auto pt-12 animate-slide-up">
            <PlaylistSelector onStartTransfer={handleStartTransfer} />
          </div>
        )}

        {currentStep === 'transfer' && transferData && (
          <div className="max-w-4xl mx-auto pt-20 animate-slide-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Transferring Playlists</h1>
              <p className="text-muted-foreground">
                Your playlists are being migrated to YouTube Music. This may take a few minutes.
              </p>
            </div>
            <TransferProgress 
              taskId={transferData.taskId}
              totalPlaylists={transferData.selectedPlaylists.length}
              onComplete={handleTransferComplete}
              onCancel={handleTransferCancel}
            />
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="max-w-2xl mx-auto pt-20 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Transfer Complete!</h1>
            <p className="text-muted-foreground mb-8">
              Your playlists have been successfully migrated to YouTube Music. 
              You can now enjoy your music on your new platform.
            </p>
            <button 
              onClick={handleStartOver}
              className="hero-button px-6 py-3 rounded-lg font-medium"
            >
              Transfer More Playlists
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
