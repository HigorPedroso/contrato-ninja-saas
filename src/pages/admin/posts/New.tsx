import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const NewPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]); // Moved inside component
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    slug: "",
    metaDescription: "",
    excerpt: "",
    content: "",
    featuredImage: null,
    category: "",
    publishedAt: null,
    authorSlug: "", // Added authorSlug to initial state
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, featuredImage: file });
    }
  };

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

      const { data, error } = await supabase.from('blog_posts').insert([
        {
          title: formData.title,
          slug: formData.slug,
          meta_description: formData.metaDescription,
          excerpt: formData.excerpt,
          content: formData.content,
          featured_image: imageUrl,
          author_slug: formData.authorSlug, // Added author_slug
          category: formData.category,
          published_at: formData.publishedAt,
          published: !!formData.publishedAt,
        },
      ]).select().single();

      if (error) throw error;

      toast({
        title: "Post criado com sucesso!",
        description: "Seu post foi salvo e está pronto para publicação.",
      });

      navigate('/admin');
    } catch (error: any) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro ao criar post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
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
        return;
      }
      
      setAuthors(data || []);
    };
  
    fetchAuthors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <DashboardHeader
          title="Criar Nova Postagem"
          description="Crie um novo post para o blog"
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
                    onChange={handleTitleChange}
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
                    apiKey="o628su2912ofptu58mzfax08z5284dya8pspcnpgm72ydvxq"
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
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
                    onChange={handleImageUpload}
                    required
                  />
                </div>

                <div className="space-y-2">

                  <div className="space-y-2">
                    <Label htmlFor="author">Autor</Label>
                    <Select
                      value={formData.authorSlug}
                      onValueChange={(value) => setFormData({ ...formData, authorSlug: value })}
                      required
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
                    {loading ? "Salvando..." : "Salvar Post"}
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

export default NewPost;