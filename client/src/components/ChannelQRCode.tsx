import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ChannelQRCode() {
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/qrcode/channel'],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const qrCodeData = data as { qrCode?: string } || {};

  const handleShare = async () => {
    if (navigator.share && qrCodeData.qrCode) {
      try {
        // Convert base64 to blob for sharing
        const response = await fetch(qrCodeData.qrCode);
        const blob = await response.blob();
        const file = new File([blob], "channel-qrcode.png", { type: "image/png" });
        
        await navigator.share({
          title: 'Abonniere meinen YouTube-Kanal',
          text: 'Scanne diesen QR-Code, um meinen YouTube-Kanal zu abonnieren!',
          files: [file]
        });
      } catch (error) {
        toast({
          title: "Teilen fehlgeschlagen",
          description: "QR-Code konnte nicht geteilt werden.",
          variant: "destructive"
        });
      }
    } else {
      // Fallback if Web Share API not available
      toast({
        title: "Hinweis",
        description: "Speichern Sie das Bild, um es manuell zu teilen.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex"><Skeleton className="h-6 w-[250px]" /></CardTitle>
          <div className="mt-1"><Skeleton className="h-4 w-[300px]" /></div>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Skeleton className="h-[200px] w-[200px]" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>QR-Code konnte nicht geladen werden</CardTitle>
          <CardDescription>Es gab ein Problem beim Laden des QR-Codes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <Button onClick={() => refetch()}>Erneut versuchen</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Kanal QR-Code</CardTitle>
        <CardDescription>Scannen Sie diesen Code, um meinen Kanal zu abonnieren</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        {qrCodeData.qrCode ? (
          <>
            <img 
              src={qrCodeData.qrCode} 
              alt="Channel QR Code" 
              className="w-[200px] h-[200px] object-contain"
            />
            <Button onClick={handleShare} className="mt-2">
              <Share2 className="mr-2 h-4 w-4" />
              QR-Code teilen
            </Button>
          </>
        ) : (
          <div className="text-center text-gray-500">
            QR-Code nicht verfügbar
          </div>
        )}
      </CardContent>
    </Card>
  );
}