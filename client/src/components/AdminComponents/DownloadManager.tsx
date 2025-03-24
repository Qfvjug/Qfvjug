import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash, Search, Download as DownloadIcon } from "lucide-react";

// Form validation schema
const downloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  version: z.string().min(1, "Version is required"),
  downloadUrl: z.string().min(1, "Download URL is required"),
  thumbnailUrl: z.string().optional(),
});

type DownloadFormValues = z.infer<typeof downloadSchema>;

const DOWNLOAD_TYPES = [
  { value: "game", label: "Game" },
  { value: "mod", label: "Mod" },
  { value: "tool", label: "Tool" },
];

const DownloadManager = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<Download | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all downloads
  const { data: downloads, isLoading } = useQuery<Download[]>({
    queryKey: ['/api/downloads'],
  });

  // Form for adding/editing downloads
  const form = useForm<DownloadFormValues>({
    resolver: zodResolver(downloadSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "game",
      version: "1.0.0",
      downloadUrl: "",
      thumbnailUrl: "",
    }
  });

  // Reset form when dialog opens/closes
  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      type: "game",
      version: "1.0.0",
      downloadUrl: "",
      thumbnailUrl: "",
    });
    setEditingDownload(null);
  };

  // Set form values when editing
  const editDownload = (download: Download) => {
    setEditingDownload(download);
    form.reset({
      title: download.title,
      description: download.description || "",
      type: download.type,
      version: download.version,
      downloadUrl: download.downloadUrl,
      thumbnailUrl: download.thumbnailUrl || "",
    });
    setIsAddDialogOpen(true);
  };

  // Create download mutation
  const createMutation = useMutation({
    mutationFn: async (data: DownloadFormValues) => {
      const response = await apiRequest("POST", "/api/downloads", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Download added",
        description: "The download has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/downloads'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to add download",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Update download mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: DownloadFormValues }) => {
      const response = await apiRequest("PUT", `/api/downloads/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Download updated",
        description: "The download has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/downloads'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to update download",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete download mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/downloads/${id}`, null);
    },
    onSuccess: () => {
      toast({
        title: "Download deleted",
        description: "The download has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/downloads'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete download",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: DownloadFormValues) => {
    if (editingDownload) {
      updateMutation.mutate({ id: editingDownload.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter downloads by search term
  const filteredDownloads = downloads?.filter(download => 
    download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (download.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Downloads Management</CardTitle>
            <CardDescription>Manage your game downloads and tools</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search downloads..."
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
                  Add Download
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingDownload ? "Edit Download" : "Add New Download"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Download title" {...field} />
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
                              placeholder="Download description" 
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
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DOWNLOAD_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 1.0.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="downloadUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Download URL</FormLabel>
                          <FormControl>
                            <Input placeholder="URL to downloadable file" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="thumbnailUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail URL</FormLabel>
                          <FormControl>
                            <Input placeholder="URL to thumbnail image" {...field} />
                          </FormControl>
                          <FormMessage />
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
                          <span>{editingDownload ? "Update" : "Add"} Download</span>
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
            <p className="mt-2 text-muted-foreground">Loading downloads...</p>
          </div>
        ) : !filteredDownloads?.length ? (
          <div className="py-8 text-center">
            <DownloadIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? "No downloads found matching your search" : "No downloads added yet"}
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
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDownloads?.map((download) => (
                  <TableRow key={download.id}>
                    <TableCell className="font-medium">{download.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                        {download.type}
                      </span>
                    </TableCell>
                    <TableCell>v{download.version}</TableCell>
                    <TableCell>{download.downloadCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editDownload(download)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this download?")) {
                              deleteMutation.mutate(download.id);
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

export default DownloadManager;
