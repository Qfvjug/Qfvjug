import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Notification } from "@shared/schema";
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
import {
  Plus,
  Trash,
  Bell,
  Search,
  Eye,
  AlertCircle,
  FileDown,
  Video,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

// Form validation schema
const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.string().min(1, "Type is required"),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const NOTIFICATION_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "download", label: "Download", icon: FileDown },
  { value: "announcement", label: "Announcement", icon: AlertCircle },
];

const NotificationManager = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  // Form for adding notifications
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "announcement",
    }
  });

  // Reset form when dialog opens/closes
  const resetForm = () => {
    form.reset({
      title: "",
      message: "",
      type: "announcement",
    });
  };

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      const response = await apiRequest("POST", "/api/notifications", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification sent",
        description: "The notification has been sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to send notification",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to mark notification as read",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notifications/${id}`, null);
    },
    onSuccess: () => {
      toast({
        title: "Notification deleted",
        description: "The notification has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete notification",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: NotificationFormValues) => {
    createMutation.mutate(data);
  };

  // Get icon by type
  const getTypeIcon = (type: string) => {
    const foundType = NOTIFICATION_TYPES.find(t => t.value === type);
    const Icon = foundType?.icon || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  // Filter notifications by search term
  const filteredNotifications = notifications?.filter(notification => 
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Notifications Management</CardTitle>
            <CardDescription>Send and manage notifications</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search notifications..."
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
                  New Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Send New Notification</DialogTitle>
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
                            <Input placeholder="Notification title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Notification message" 
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
                              {NOTIFICATION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="h-4 w-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            Sending...
                          </span>
                        ) : (
                          <span>Send Notification</span>
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
            <p className="mt-2 text-muted-foreground">Loading notifications...</p>
          </div>
        ) : !filteredNotifications?.length ? (
          <div className="py-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? "No notifications found matching your search" : "No notifications sent yet"}
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
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications?.map((notification) => (
                  <TableRow key={notification.id} className={notification.read ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(notification.type)}
                        <span className="capitalize">{notification.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatRelativeTime(notification.createdAt)}</TableCell>
                    <TableCell>
                      {notification.read ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-primary font-medium">
                          <span className="h-2 w-2 rounded-full bg-primary"></span>
                          Unread
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this notification?")) {
                              deleteMutation.mutate(notification.id);
                            }
                          }}
                          title="Delete"
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

export default NotificationManager;
