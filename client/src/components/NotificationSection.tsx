import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const NotificationSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEnablePushNotifications = async () => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser does not support push notifications.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        // In a real app, here you would subscribe the user to push notifications
        // using the Push API and send the subscription to your server
        toast({
          title: "Notifications enabled",
          description: "You'll receive notifications for new videos and updates.",
        });
      } else {
        toast({
          title: "Notification permission denied",
          description: "You need to allow notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error enabling notifications",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEmailSubscribe = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/subscribers', {
        email,
        notificationType: 'all'
      });
      
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive email updates about new videos and releases.",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss an Update</h2>
          <p className="text-muted-foreground mb-8">
            Get notified when I release new videos, games, or important updates.
            You can receive notifications via browser push or email.
          </p>

          <Card className="rounded-xl p-6 shadow-md border border-border">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Button 
                  variant="default" 
                  className="flex-1 flex items-center justify-center"
                  onClick={handleEnablePushNotifications}
                >
                  <Bell className="h-5 w-5 mr-2" />
                  Enable Push Notifications
                </Button>
                
                <div className="flex-1 flex items-center">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-4 py-3 rounded-l-lg bg-background border border-r-0 border-input focus:outline-none focus:ring-2 focus:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Button 
                    variant="default"
                    className="rounded-l-none"
                    onClick={handleEmailSubscribe}
                    disabled={isSubmitting}
                  >
                    <Mail className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-primary" />
                  <span>New Videos</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-primary" />
                  <span>Game Releases</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-primary" />
                  <span>Live Streams</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NotificationSection;
