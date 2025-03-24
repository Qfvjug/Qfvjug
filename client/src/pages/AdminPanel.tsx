import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import VideoManager from "@/components/AdminComponents/VideoManager";
import DownloadManager from "@/components/AdminComponents/DownloadManager";
import NotificationManager from "@/components/AdminComponents/NotificationManager";
import SettingsManager from "@/components/AdminComponents/SettingsManager";
import { LogOut, Video, Download, Bell, Settings } from "lucide-react";

const AdminPanel = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("videos");

  // Check if user is logged in
  useEffect(() => {
    if (!auth.isLoggedIn()) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the admin panel",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [setLocation, toast]);

  const handleLogout = () => {
    auth.logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    setLocation("/");
  };

  if (!auth.isLoggedIn()) {
    return null; // Don't render anything if not logged in (will redirect)
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="downloads" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Downloads</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="space-y-6">
          <VideoManager />
        </TabsContent>
        
        <TabsContent value="downloads" className="space-y-6">
          <DownloadManager />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <NotificationManager />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <SettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
