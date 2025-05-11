
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_slug: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Author {
  name: string;
  slug: string;
  image_url: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      
      try {
        // Fetch the post by slug
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*, author_slug")
          .eq("slug", slug)
          .eq("published", true)
          .single();

        if (postError) {
          throw new Error("Post não encontrado");
        }

        setPost(postData);

        // Fetch the author details using author_slug
        if (postData.author_slug) {
          const { data: authorData } = await supabase
            .from("authors")
            .select("name, image_url")
            .eq("slug", postData.author_slug)
            .single();

          setAuthor(authorData);
        }
      } catch (err: any) {
        console.error("Erro ao buscar post:", err);
        setError(err.message || "Ocorreu um erro ao carregar o post");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Add this function near the top of the component
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `${supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-6 py-12">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/3 mx-auto mb-12" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-6 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
            <p className="text-gray-600">
              {error || "O post que você está procurando não existe ou foi removido."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Featured image */}
        {post.featured_image && (
          <div className="w-full h-[400px] bg-gray-100 relative">
            <img
              src={getImageUrl(post.featured_image)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        )}
        
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
            
            <div className="flex items-center mb-8">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={author?.image_url} alt={author?.name} />
                  <AvatarFallback>
                    {author?.name ? author.name.charAt(0) : "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{author?.name || "Autor desconhecido"}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(post.published_at || post.created_at)}
                  </p>
                </div>
              </div>
            </div>
            
            {post.excerpt && (
              <div className="mb-8 text-lg text-gray-600 font-medium border-l-4 border-brand-400 pl-4">
                {post.excerpt}
              </div>
            )}
            
            <div className="prose prose-lg max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
