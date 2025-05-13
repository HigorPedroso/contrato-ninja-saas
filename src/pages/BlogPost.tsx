
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Add these imports
import { Share2, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet-async";

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

// Add reading time calculation
const calculateReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

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
        <main className="flex-1">
          <Skeleton className="w-full h-[50vh] md:h-[60vh]" />
          <div className="container mx-auto px-4 md:px-6 -mt-20 relative z-10">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-12 w-3/4 mb-6" />
              <Skeleton className="h-24 w-full mb-8" />
              <div className="flex items-center mb-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        {/* Basic SEO */}
        <title>{post?.title ? `${post.title} | Contrato Ninja` : 'Blog | Contrato Ninja'}</title>
        <meta name="description" content={post?.excerpt || ''} />
        <meta name="author" content={author?.name || 'Contrato Ninja'} />
        <link rel="canonical" href={window.location.href} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post?.title || ''} />
        <meta property="og:description" content={post?.excerpt || ''} />
        <meta property="og:image" content={post?.featured_image ? getImageUrl(post.featured_image) : ''} />
        <meta property="og:url" content={window.location.href} />
        <meta property="article:published_time" content={post?.published_at || post?.created_at || ''} />
        <meta property="article:modified_time" content={post?.updated_at || ''} />
        <meta property="article:author" content={author?.name || ''} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post?.title || ''} />
        <meta name="twitter:description" content={post?.excerpt || ''} />
        <meta name="twitter:image" content={post?.featured_image ? getImageUrl(post.featured_image) : ''} />

        {/* Structured Data / JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post?.title,
            "image": post?.featured_image ? getImageUrl(post.featured_image) : '',
            "datePublished": post?.published_at || post?.created_at,
            "dateModified": post?.updated_at,
            "author": {
              "@type": "Person",
              "name": author?.name
            },
            "publisher": {
              "@type": "Organization",
              "name": "Contrato Ninja",
              "logo": {
                "@type": "ImageObject",
                "url": "https://your-domain.com/logo.png" // Update with your actual logo URL
              }
            },
            "description": post?.excerpt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            }
          })}
        </script>
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        <article>
          {/* Back button and reading time */}
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <Link to="/blog" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Voltar para o Blog</span>
              </Link>
              {post && (
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{calculateReadingTime(post.content)} min de leitura</span>
                </div>
              )}
            </div>
          </div>

          {/* Hero Section */}
          <div className="relative">
            {post?.featured_image ? (
              <div className="w-full h-[60vh] md:h-[70vh] relative overflow-hidden">
                <img
                  src={getImageUrl(post.featured_image)}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            ) : (
              <div className="w-full h-[40vh] bg-gray-50" />
            )}

            {/* Title and Content Combined Section */}
            <div className="container mx-auto px-4 md:px-8 -mt-32 relative z-10">
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
                {/* Title Section */}
                <div className="p-6 md:p-12 border-b border-gray-100">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
                    {post?.title}
                  </h1>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    {/* Author and Date */}
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={author?.image_url} alt={author?.name} />
                        <AvatarFallback className="bg-gray-100">
                          {author?.name ? author.name.charAt(0) : "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{author?.name || "Autor desconhecido"}</p>
                        <p className="text-sm text-gray-500">
                          Publicado em {formatDate(post?.published_at || post?.created_at)}
                        </p>
                      </div>
                    </div>
                
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                  </div>
                
                  {post?.excerpt && (
                    <div className="text-lg md:text-xl text-gray-600 font-medium border-l-2 border-gray-200 pl-6 py-4">
                      {post.excerpt}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-12">
                  <div 
                    dangerouslySetInnerHTML={{ __html: post?.content || '' }}
                    className="
                      prose prose-lg max-w-none
                      prose-a:text-brand-400
                      prose-a:font-medium
                      prose-a:no-underline
                      prose-a:border-b-2
                      prose-a:border-brand-200
                      prose-a:transition-all
                      hover:prose-a:border-brand-400
                      hover:prose-a:text-brand-500
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
