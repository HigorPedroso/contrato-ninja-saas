
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  slug: string;
  created_at: string;
  published_at: string | null;
  author_id: string | null;
};

const BlogPostsPage = () => {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isSubscribed) {
      toast({
        title: "Acesso restrito",
        description: "Apenas usuários premium podem acessar o gerenciamento do blog.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } else {
      fetchPosts();
    }
  }, [isSubscribed]);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setPosts(data || []);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      toast({
        title: "Erro ao carregar posts",
        description: "Não foi possível carregar a lista de posts do blog.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateSlug = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Auto-gerar slug apenas se não estiver em edição ou o slug não foi modificado manualmente
    if (!isEditing || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };
  
  const handleCreatePost = () => {
    setIsEditing(false);
    setCurrentPost(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setSlug("");
    setPublished(false);
    setIsDialogOpen(true);
  };
  
  const handleEditPost = (post: BlogPost) => {
    setIsEditing(true);
    setCurrentPost(post);
    setTitle(post.title);
    setExcerpt(post.excerpt || "");
    setContent(post.content);
    setSlug(post.slug);
    setPublished(post.published || false);
    setIsDialogOpen(true);
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postId);
        
      if (error) throw error;
      
      toast({
        title: "Post excluído",
        description: "O post foi removido com sucesso.",
      });
      
      fetchPosts();
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o post. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !slug) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, conteúdo e slug são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para criar posts.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditing && currentPost) {
        // Atualiza post existente
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title,
            excerpt,
            content,
            slug,
            published,
            published_at: published ? (currentPost.published_at || new Date().toISOString()) : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentPost.id);
          
        if (error) throw error;
        
        toast({
          title: "Post atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Cria novo post
        const { error } = await supabase
          .from("blog_posts")
          .insert({
            title,
            excerpt,
            content,
            slug,
            published,
            author_id: user.id,
            published_at: published ? new Date().toISOString() : null,
          });
          
        if (error) throw error;
        
        toast({
          title: "Post criado",
          description: "O novo post foi criado com sucesso.",
        });
      }
      
      setIsDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Erro ao salvar post:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o post. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader 
          title="Gerenciamento do Blog" 
          description="Crie e edite posts para o blog da plataforma" 
        />
        
        <main className="container mx-auto px-6 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-medium">Posts do Blog</h2>
            <Button
              onClick={handleCreatePost}
              className="bg-brand-400 hover:bg-brand-500"
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Novo Post
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            </div>
          ) : posts.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell className="text-sm text-gray-500">{post.slug}</TableCell>
                        <TableCell>{formatDate(post.created_at)}</TableCell>
                        <TableCell>
                          {post.published ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Publicado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">
                              Rascunho
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-2">Nenhum post encontrado</h3>
              <p className="text-gray-500 mb-6">Comece criando seu primeiro post para o blog.</p>
              <Button onClick={handleCreatePost} className="bg-brand-400 hover:bg-brand-500">
                <Plus className="mr-2 h-4 w-4" /> Criar Novo Post
              </Button>
            </div>
          )}
          
          {/* Dialog para criar/editar post */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Editar Post" : "Criar Novo Post"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para {isEditing ? "atualizar o" : "criar um novo"} post.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Digite o título do post"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input 
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug-do-post"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="excerpt">Resumo</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Breve resumo do post (opcional)"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Conteúdo do post em formato markdown"
                    rows={10}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={published ? "published" : "draft"}
                    onValueChange={(value) => setPublished(value === "published")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-brand-400 hover:bg-brand-500"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : isEditing ? "Atualizar" : "Publicar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default BlogPostsPage;
