import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Info, Loader2, Save } from "lucide-react";

// Form validation schema
const settingsSchema = z.object({
  youtubeChannelId: z.string().min(1, "YouTube channel ID is required"),
  featuredVideoId: z.string().optional(),
  newsTickerItems: z.array(z.string()).min(1, "At least one ticker item is required"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const SettingsManager = () => {
  const { toast } = useToast();

  // Fetch site settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['/api/settings'],
  });

  // Form setup
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      youtubeChannelId: "",
      featuredVideoId: "",
      newsTickerItems: [""],
    },
  });

  // Update form when settings are loaded
  useQuery({
    queryKey: ['/api/settings'],
    enabled: !isLoading && !error && !!settings,
    onSuccess: (data) => {
      form.reset({
        youtubeChannelId: data.youtubeChannelId || "",
        featuredVideoId: data.featuredVideoId || "",
        newsTickerItems: Array.isArray(data.newsTickerItems) && data.newsTickerItems.length > 0 
          ? data.newsTickerItems 
          : ["Welcome to Qfvjug's YouTube Channel Website!"],
      });
    },
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Site settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SettingsFormValues) => {
    // Filter out empty ticker items
    const filteredTickerItems = data.newsTickerItems.filter(item => item.trim() !== "");
    
    if (filteredTickerItems.length === 0) {
      toast({
        title: "Validation error",
        description: "At least one news ticker item is required",
        variant: "destructive",
      });
      return;
    }
    
    updateMutation.mutate({
      ...data,
      newsTickerItems: filteredTickerItems,
    });
  };

  // Add ticker item
  const addTickerItem = () => {
    const currentItems = form.getValues().newsTickerItems;
    form.setValue("newsTickerItems", [...currentItems, ""]);
  };

  // Remove ticker item
  const removeTickerItem = (index: number) => {
    const currentItems = form.getValues().newsTickerItems;
    if (currentItems.length > 1) {
      const newItems = [...currentItems];
      newItems.splice(index, 1);
      form.setValue("newsTickerItems", newItems);
    } else {
      toast({
        title: "Cannot remove item",
        description: "At least one news ticker item is required",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Manage your website settings</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Manage your website settings</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-10 text-destructive">
            <AlertTriangle className="h-8 w-8 mr-2" />
            <span>Failed to load settings. Please try again.</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/settings'] })}
          >
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Manage your website settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="youtubeChannelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Channel ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. UCXuqSBlHAE6Xw-yeJA0Tunw" {...field} />
                  </FormControl>
                  <FormDescription>
                    The ID of your YouTube channel (found in your channel URL)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featuredVideoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Video ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. dQw4w9WgXcQ" {...field} />
                  </FormControl>
                  <FormDescription>
                    The YouTube ID of the video to feature on your homepage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium">News Ticker Items</h3>
                <div className="ml-2 text-muted-foreground flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  <span className="text-xs">Messages that scroll across the ticker</span>
                </div>
              </div>
              
              <Separator className="mb-4" />
              
              <div className="space-y-3">
                {form.watch("newsTickerItems").map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`newsTickerItems.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="News ticker message" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeTickerItem(index)}
                    >
                      <span>×</span>
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTickerItem}
                className="mt-3"
              >
                + Add Item
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsManager;
