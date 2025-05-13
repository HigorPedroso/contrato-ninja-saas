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

// Add to interfaces
interface Author {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

// Add to PostFormData interface
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

interface Category {
  id: string;
  name: string;
  slug: string;
}


// Update component name and initial checks
const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true); // Add loading state
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

  // Fetch post data
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

        console.log('Fetching post...', { id, data, error });

        if (error) throw error;
        if (!data) throw new Error('Post not found');

        // Update form data
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

        // Handle image preview
        if (data.featured_image) {
          const { data: imageData } = await supabase.storage
            .from('blog-images')
            .getPublicUrl(data.featured_image);
          
          const imagePreview = document.getElementById('imagePreview');
          if (imagePreview && imageData) {
            imagePreview.innerHTML = `<img src="${imageData.publicUrl}" alt="Preview" class="mt-2 max-w-xs rounded-lg shadow-sm" />`;
          }
        }
      } catch (error: any) {
        console.error('Error:', error);
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

  // Return loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <DashboardHeader
            title="Editar Postagem"
            description="Carregando dados..."
          />
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
  // Add these useEffects after the existing post fetch useEffect
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Erro ao carregar categorias",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive",
        });
        return;
      }
      
      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAuthors = async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching authors:', error);
        toast({
          title: "Erro ao carregar autores",
          description: "Não foi possível carregar os autores.",
          variant: "destructive",
        });
        return;
      }
      
      setAuthors(data || []);
    };

    fetchAuthors();
  }, []);

  // Update handleSubmit to handle both create and update
  // Update the handleSubmit function
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

  // Update the header and button text
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <DashboardHeader
          title="Editar Postagem"
          description="Edite os detalhes do post"
        />
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
                  <Input
                    id="slug"
                    value={formData.slug}
                    readOnly
                    className="bg-gray-50"
                  />
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
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Editor
                    key={formData.content} // Add key to force re-render when content changes
                    apiKey="o628su2912ofptu58mzfax08z5284dya8pspcnpgm72ydvxq"
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                    }}
                    value={formData.content}
                    onEditorChange={(content) => setFormData({ ...formData, content })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredImage">Imagem Destacada</Label>
                  <Input
                    id="featuredImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.files?.[0] || null })}
                    required={!id}
                  />
                  <div id="imagePreview" className="mt-2"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Autor</Label>
                    <Select
                      value={formData.authorSlug}
                      onValueChange={(value) => setFormData({ ...formData, authorSlug: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um autor" />
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
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Data de Publicação</Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={formData.publishedAt || ''}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default PostEditor;
