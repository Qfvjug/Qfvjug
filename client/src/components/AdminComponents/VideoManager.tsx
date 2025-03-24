import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Video } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Star, Edit, Trash, Search, Video as VideoIcon } from "lucide-react";

// Form validation schema
const videoSchema = z.object({
  youtubeId: z.string().min(1, "YouTube ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().default("general"),
  isFeatured: z.boolean().default(false),
});

type VideoFormValues = z.infer<typeof videoSchema>;

const VideoManager = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all videos
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  // Form for adding/editing videos
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      youtubeId: "",
      title: "",
      description: "",
      category: "general",
      isFeatured: false,
    }
  });

  // Reset form when dialog opens/closes
  const resetForm = () => {
    form.reset({
      youtubeId: "",
      title: "",
      description: "",
      category: "general",
      isFeatured: false,
    });
    setEditingVideo(null);
  };

  // Set form values when editing
  const editVideo = (video: Video) => {
    setEditingVideo(video);
    form.reset({
      youtubeId: video.youtubeId,
      title: video.title,
      description: video.description || "",
      category: video.category,
      isFeatured: video.isFeatured,
    });
    setIsAddDialogOpen(true);
  };

  // Create video mutation
  const createMutation = useMutation({
    mutationFn: async (data: VideoFormValues) => {
      const response = await apiRequest("POST", "/api/videos", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Video added",
        description: "The video has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to add video",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Update video mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: VideoFormValues }) => {
      const response = await apiRequest("PUT", `/api/videos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Video updated",
        description: "The video has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to update video",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete video mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/videos/${id}`, null);
    },
    onSuccess: () => {
      toast({
        title: "Video deleted",
        description: "The video has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete video",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Feature video mutation
  const featureMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/videos/${id}/feature`, null);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Video featured",
        description: "The video has been set as featured",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to feature video",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: VideoFormValues) => {
    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter videos by search term
  const filteredVideos = videos?.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Videos Management</CardTitle>
            <CardDescription>Manage your YouTube videos</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingVideo ? "Edit Video" : "Add New Video"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="youtubeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. dQw4w9WgXcQ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Video title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Video description" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. minecraft, unity, tutorial" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Video</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              This video will be displayed on the homepage
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {createMutation.isPending || updateMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            Saving...
                          </span>
                        ) : (
                          <span>{editingVideo ? "Update" : "Add"} Video</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent"></div>
            <p className="mt-2 text-muted-foreground">Loading videos...</p>
          </div>
        ) : !filteredVideos?.length ? (
          <div className="py-8 text-center">
            <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? "No videos found matching your search" : "No videos added yet"}
            </p>
            {searchTerm && (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos?.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium max-w-md">
                      <div className="flex items-center gap-2">
                        {video.isFeatured && (
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="currentColor" />
                        )}
                        <span className="truncate">{video.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {video.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!video.isFeatured && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => featureMutation.mutate(video.id)}
                            title="Set as featured"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editVideo(video)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this video?")) {
                              deleteMutation.mutate(video.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoManager;
