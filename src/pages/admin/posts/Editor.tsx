import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Author {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostFormData {
  title: string;
  slug: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  featuredImage: File | null;
  category: string;
  publishedAt: string | null;
  authorSlug: string;
}

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    slug: "",
    metaDescription: "",
    excerpt: "",
    content: "",
    featuredImage: null,
    category: "",
    publishedAt: null,
    authorSlug: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('authors').select('*').order('name'),
        ]);

        if (categoriesRes.error) throw categoriesRes.error;
        if (authorsRes.error) throw authorsRes.error;

        setCategories(categoriesRes.data || []);
        setAuthors(authorsRes.data || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar categorias ou autores.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Post não encontrado');

        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          metaDescription: data.meta_description || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          featuredImage: null,
          category: data.category || '',
          publishedAt: data.published_at || null,
          authorSlug: data.author_slug || '',
        });

        if (data.featured_image) {
          const { data: imageData } = await supabase.storage
            .from('blog-images')
            .getPublicUrl(data.featured_image);

          const imagePreview = document.getElementById('imagePreview');
          if (imagePreview && imageData?.publicUrl) {
            imagePreview.innerHTML = `<img src="${imageData.publicUrl}" alt="Preview" class="mt-2 max-w-xs rounded-lg shadow-sm" />`;
          }
        }
      } catch (error: any) {
        console.error('Erro:', error);
        toast({
          title: "Erro ao carregar post",
          description: error.message,
          variant: "destructive",
        });
        navigate('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (formData.featuredImage) {
        const fileExt = formData.featuredImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, formData.featuredImage);

        if (uploadError) throw uploadError;
        imageUrl = uploadData.path;
      }

      const postData = {
        title: formData.title,
        slug: formData.slug,
        meta_description: formData.metaDescription,
        excerpt: formData.excerpt,
        content: formData.content,
        author_slug: formData.authorSlug,
        category: formData.category,
        published_at: formData.publishedAt,
        published: !!formData.publishedAt,
        ...(imageUrl && { featured_image: imageUrl }),
      };

      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Post atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });

      navigate('/admin');
    } catch (error: any) {
      console.error('Erro ao atualizar post:', error);
      toast({
        title: "Erro ao atualizar post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <DashboardHeader title="Editar Postagem" description="Carregando dados..." />
          <main className="container mx-auto px-6 py-8">
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div>Carregando...</div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <DashboardHeader title="Editar Postagem" description="Edite os detalhes do post" />
        <main className="container mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Postagem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-');
                      setFormData({ ...formData, title, slug });
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={formData.slug} readOnly className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Resumo</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Editor
                     apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    value={formData.content}
                    onEditorChange={(content) => setFormData({ ...formData, content })}
                    init={{ height: 400, menubar: false }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredImage">Imagem de Destaque</Label>
                  <Input
                    type="file"
                    id="featuredImage"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, featuredImage: e.target.files?.[0] || null })
                    }
                  />
                  <div id="imagePreview"></div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    value={formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Select
                    onValueChange={(value) => setFormData({ ...formData, authorSlug: value })}
                    value={formData.authorSlug}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o autor" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.slug}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Publicado em</Label>
                  <Input
                    type="datetime-local"
                    id="publishedAt"
                    value={formData.publishedAt || ""}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default PostEditor;
