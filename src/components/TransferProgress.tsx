import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {url} from "@/utils/url";

interface TransferStatus {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_playlist?: string;
  completed_playlists: string[];
  failed_playlists: Array<{ name: string; error: string }>;
  message?: string;
}

interface TransferProgressProps {
  taskId: string;
  totalPlaylists: number;
  onComplete: () => void;
  onCancel: () => void;
}

export const TransferProgress = ({ taskId, totalPlaylists, onComplete, onCancel }: TransferProgressProps) => {
  const [status, setStatus] = useState<TransferStatus>({
    task_id: taskId,
    status: 'pending',
    progress: 0,
    completed_playlists: [],
    failed_playlists: []
  });
  const [isPolling, setIsPolling] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling) {
      interval = setInterval(() => pollTransferStatus(), 2000);
    }
    return () => interval && clearInterval(interval);
  }, [isPolling, taskId]);

  const pollTransferStatus = async () => {
    try {
      const token = window.sessionStorage.getItem("token");
      
      if (!token) {
        console.error("No token found in session storage");
        return;
      }

      // Log the API URL being called for debugging
      const apiUrl = `${url}/transfer/status/${token}`;
      console.log("Polling API URL:", apiUrl);
      
      const resp = await fetch(apiUrl);
      
      if (!resp.ok) {
        console.error(`API error: ${resp.status} ${resp.statusText}`);
        throw new Error(`API returned ${resp.status}`);
      }
      
      const responseText = await resp.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("Error parsing JSON response:", err);
        console.error("Response text:", responseText.substring(0, 200));
        
        if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
          console.error("Received HTML instead of JSON. Check your API endpoint configuration.");
        }
        
        throw new Error("Invalid JSON response from server");
      }

      let mapped: TransferStatus = {
        task_id: data.session_id,
        status:
          data.status === 'not found'
            ? 'failed'
            : data.status === 'in progress'
            ? 'running'
            : data.status === 'completed'
            ? 'completed'
            : data.status === 'invalid value'
            ? 'failed'
            : 'pending',
        progress: typeof data.progress === 'number' ? data.progress : parseFloat(data.progress) || 0,
        completed_playlists: [],
        failed_playlists: []
      };

      setStatus(mapped);

      if (mapped.status === 'completed' || mapped.status === 'failed') {
        setIsPolling(false);
        toast({
          title: mapped.status === 'completed' ? "Transfer Complete!" : "Transfer Failed",
          description:
            mapped.status === 'completed'
              ? `Successfully transferred ${mapped.completed_playlists.length} playlists.`
              : "Some playlists could not be transferred."
        });
        onComplete();
      }
    } catch (err) {
      console.error('Error polling transfer status:', err);
    }
  };

  const handleCancel = async () => {
    try {
      const token = window.sessionStorage.getItem("token");
      const resp = await fetch(`${url}/transfer/cancel/${token}`, { method: 'POST' });
      const data = await resp.json();
      if (data.success === "True") {
        setIsPolling(false);
        setStatus(prev => ({ ...prev, status: 'cancelled' }));
        toast({ title: "Transfer Cancelled", description: "The playlist transfer has been cancelled." });
        onCancel();
      }
    } catch (error) {
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel the transfer. Please try again.",
        variant: "destructive"
      });
    }
  };
  const getStatusIcon = () => {
    switch (status.status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-warning animate-pulse" />;
      case 'running':
        return <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-destructive" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-muted-foreground" />;
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (status.status) {
      case 'pending':
        return 'Preparing to transfer playlists...';
      case 'running':
        return 'Transferring playlists...';
      case 'completed':
        return 'All playlists transferred successfully!';
      case 'failed':
        return status.progress > 0 
          ? `Transfer failed at ${Math.round(status.progress)}% completion.` 
          : 'Transfer failed. Please try again.';
      case 'cancelled':
        return 'Transfer was cancelled.';
      default:
        return 'Unknown status';
    }
  };

   return (
    <div className="max-w-2xl mx-auto space-y-6">
 
      <Card className="playlist-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {status.status === 'pending' && <Clock className="w-6 h-6 animate-pulse" />}
            {status.status === 'running' && <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            {status.status === 'completed' && <CheckCircle className="w-6 h-6 text-success" />}
            {status.status === 'failed' && <XCircle className="w-6 h-6 text-destructive" />}
            {status.status === 'cancelled' && <XCircle className="w-6 h-6 text-muted-foreground" />}
            Transfer Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getStatusMessage()}</span>
              <span>{Math.round(status.progress)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded">
              <div className="h-3 bg-blue-500 rounded" style={{ width: `${status.progress}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{Math.round(status.progress)}</div>
              <div className="text-sm">Progress %</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{status.status === 'running' ? "Active" : status.status}</div>
              <div className="text-sm">Status</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalPlaylists}</div>
              <div className="text-sm">Total Playlists</div>
            </div>
          </div>

          {(status.status === 'pending' || status.status === 'running') && (
            <Button variant="destructive" onClick={handleCancel} className="w-full">
              <X className="w-4 h-4 mr-2" /> Cancel Transfer
            </Button>
          )}
        </CardContent>
      </Card>

      {status.failed_playlists.length > 0 && (
        <Card className="playlist-card border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Failed Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.failed_playlists.map((failed, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10">
                <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                <div>
                  <div className="font-medium text-sm">{failed.name}</div>
                  <div className="text-xs text-muted-foreground">{failed.error}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {status.completed_playlists.length > 0 && status.status === 'completed' && (
        <Card className="playlist-card border-success/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" /> Successfully Transferred
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.completed_playlists.map((playlist, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-3 h-3 text-success" /> {playlist}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
