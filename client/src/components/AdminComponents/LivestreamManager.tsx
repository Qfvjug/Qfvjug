import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Youtube } from "lucide-react";

// Define types
interface LivestreamData {
  isLiveStreaming: boolean;
  liveStreamId?: string;
}

const LivestreamManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [liveStreamId, setLiveStreamId] = useState("");
  
  const { data, isLoading } = useQuery<LivestreamData>({
    queryKey: ['/api/livestream'],
  });
  
  // Set initial livestream ID if available
  useEffect(() => {
    if (data?.liveStreamId) {
      setLiveStreamId(data.liveStreamId);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (values: { isLiveStreaming: boolean, liveStreamId?: string }) => {
      return apiRequest('POST', '/api/livestream', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/livestream'] });
      toast({
        title: data?.isLiveStreaming ? "Live-Stream beendet" : "Live-Stream gestartet",
        description: data?.isLiveStreaming 
          ? "Der Live-Stream wurde erfolgreich beendet." 
          : "Der Live-Stream wurde erfolgreich gestartet.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Beim Aktualisieren des Live-Stream-Status ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  });

  const toggleLiveStream = () => {
    if (!data?.isLiveStreaming && (!liveStreamId || liveStreamId.trim() === "")) {
      toast({
        title: "Fehlende YouTube-ID",
        description: "Bitte gib die YouTube-ID des Livestreams ein.",
        variant: "destructive"
      });
      return;
    }

    mutation.mutate({
      isLiveStreaming: !data?.isLiveStreaming,
      liveStreamId: !data?.isLiveStreaming ? liveStreamId : undefined
    });
  };

  const handlePreview = () => {
    if (liveStreamId && liveStreamId.trim() !== "") {
      window.open(`https://youtube.com/watch?v=${liveStreamId}`, '_blank');
    } else {
      toast({
        title: "Fehlende YouTube-ID",
        description: "Bitte gib die YouTube-ID des Livestreams ein.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Livestream-Verwaltung</CardTitle>
        <CardDescription>
          Verwalte den Livestream-Status deiner Website. Wenn du live streamst, wird ein Banner auf der Startseite angezeigt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Livestream Status</Label>
            <div className="text-sm text-muted-foreground">
              {data?.isLiveStreaming ? "Livestream ist aktiv" : "Livestream ist inaktiv"}
            </div>
          </div>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Switch
              checked={data?.isLiveStreaming || false}
              onCheckedChange={toggleLiveStream}
              disabled={mutation.isPending}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stream-id">YouTube Livestream ID</Label>
          <div className="flex gap-2">
            <Input
              id="stream-id"
              placeholder="z.B. dQw4w9WgXcQ"
              value={liveStreamId}
              onChange={(e) => setLiveStreamId(e.target.value)}
              disabled={data?.isLiveStreaming || mutation.isPending}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreview}
              disabled={!liveStreamId || liveStreamId.trim() === ""}
            >
              <Youtube className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Die YouTube-ID findest du in der URL deines Livestreams (z.B. youtube.com/watch?v=<strong>DIESE_ID</strong>)
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={toggleLiveStream}
          disabled={isLoading || mutation.isPending || (!data?.isLiveStreaming && (!liveStreamId || liveStreamId.trim() === ""))}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird bearbeitet...
            </>
          ) : data?.isLiveStreaming ? (
            "Livestream beenden"
          ) : (
            "Livestream starten"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LivestreamManager;