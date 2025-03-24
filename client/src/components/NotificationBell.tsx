import { useQuery } from "@tanstack/react-query";
import { BellRing, Bell, X } from "lucide-react";
import { 
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { formatRelativeTime } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 60000, // Refresh every minute
  });

  const unreadCount = notifications.filter((notification: any) => !notification.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
      
      // Invalidate notifications cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Benachrichtigung konnte nicht als gelesen markiert werden.",
        variant: "destructive"
      });
    }
  };

  // Request notification permission when component mounts
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // We'll ask for permission when the user interacts with the bell
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast({
          title: "Benachrichtigungen aktiviert",
          description: "Sie erhalten jetzt Push-Benachrichtigungen für neue Updates.",
        });
      } else {
        toast({
          title: "Benachrichtigungen deaktiviert",
          description: "Sie haben Push-Benachrichtigungen abgelehnt.",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full h-10 w-10 p-0 relative" onClick={() => {
          if (Notification.permission === 'default') {
            requestNotificationPermission();
          }
        }}>
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-5 w-5" />
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs" 
                variant="destructive"
              >
                {unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
          <span className="sr-only">Benachrichtigungen</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Card className="border-0">
          <CardHeader className="pb-3">
            <CardTitle>Benachrichtigungen</CardTitle>
            <CardDescription>
              {unreadCount > 0 
                ? `Sie haben ${unreadCount} ungelesene Benachrichtigungen.` 
                : 'Keine neuen Benachrichtigungen.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">Wird geladen...</p>
            ) : notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <div key={notification.id} className="relative">
                  <div className={`
                    p-3 rounded-lg relative 
                    ${notification.isRead ? 'bg-background' : 'bg-muted'}
                  `}>
                    <h4 className="font-medium text-sm">
                      {notification.title || 'Neue Nachricht'}
                    </h4>
                    <p className="text-muted-foreground text-xs mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Als gelesen markieren</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">Keine Benachrichtigungen vorhanden.</p>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="p-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={requestNotificationPermission}
            >
              {Notification.permission === 'granted' 
                ? 'Benachrichtigungen sind aktiviert' 
                : 'Benachrichtigungen aktivieren'}
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}