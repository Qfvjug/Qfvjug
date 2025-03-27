import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

type Comment = {
  id: number;
  videoId: number;
  author: string;
  content: string;
  approved: boolean;
  createdAt: string;
};

type CommentSectionProps = {
  videoId: number;
};

export default function CommentSection({ videoId }: CommentSectionProps) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['/api/videos', videoId, 'comments'],
    queryFn: () => apiRequest('GET', `/api/videos/${videoId}/comments`),
  });

  const mutation = useMutation({
    mutationFn: (newComment: { author: string, content: string }) => {
      return apiRequest('POST', `/api/videos/${videoId}/comments`, newComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos', videoId, 'comments'] });
      toast({
        title: "Kommentar gespeichert",
        description: "Dein Kommentar wurde erfolgreich gespeichert und wird nach Überprüfung angezeigt.",
      });
      setAuthor("");
      setContent("");
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Speichern",
        description: "Dein Kommentar konnte nicht gespeichert werden. Bitte versuche es später erneut.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author.trim() || !content.trim()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    mutation.mutate({ author, content });
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Kommentare</h3>
      
      {/* Comment Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Hinterlasse einen Kommentar</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="author" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={isSubmitting}
                placeholder="Dein Name"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Kommentar
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                placeholder="Dein Kommentar..."
                className="w-full h-24"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird gespeichert..." : "Kommentar absenden"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8">Kommentare werden geladen...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Noch keine Kommentare vorhanden. Sei der Erste!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: Comment) => (
            <Card key={comment.id} className="border border-border">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold">{comment.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), 'dd.MM.yyyy - HH:mm')}
                  </div>
                </div>
                <p className="whitespace-pre-line">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}