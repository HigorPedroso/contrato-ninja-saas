
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPostCard from "@/components/BlogPostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";

// Mock blog data
const blogPosts = [
  {
    id: 1,
    title: "Contrato de Prestação de Serviços: o que não pode faltar",
    slug: "contrato-prestacao-servicos-o-que-nao-pode-faltar",
    excerpt:
      "Descubra as cláusulas essenciais que todo contrato de prestação de serviços deve conter para proteger freelancers e contratantes.",
    date: "02 Mai, 2025",
    author: "Dra. Ana Castro",
    authorImage: "https://randomuser.me/api/portraits/women/32.jpg",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80",
    category: "Contratos",
  },
  {
    id: 2,
    title: "Modelos de contrato para freelancers em 2025",
    slug: "modelos-contrato-freelancers-2025",
    excerpt:
      "Conheça os modelos de contrato mais usados por freelancers de diferentes áreas e como adaptá-los às suas necessidades.",
    date: "28 Abr, 2025",
    author: "Dr. Ricardo Mendes",
    authorImage: "https://randomuser.me/api/portraits/men/42.jpg",
    image: "https://images.unsplash.com/photo-1586282391535-74bc5c0bb1d0?auto=format&fit=crop&q=80",
    category: "Freelancers",
  },
  {
    id: 3,
    title: "Como evitar problemas jurídicos com clientes",
    slug: "como-evitar-problemas-juridicos-clientes",
    excerpt:
      "Aprenda estratégias práticas para prevenir conflitos legais e garantir relacionamentos saudáveis com seus clientes.",
    date: "15 Abr, 2025",
    author: "Dra. Camila Soares",
    authorImage: "https://randomuser.me/api/portraits/women/65.jpg",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80",
    category: "Dicas Legais",
  },
  {
    id: 4,
    title: "Contrato para MEI: particularidades e vantagens",
    slug: "contrato-mei-particularidades-vantagens",
    excerpt:
      "Entenda as especificidades dos contratos para Microempreendedores Individuais e como aproveitar os benefícios legais.",
    date: "10 Abr, 2025",
    author: "Dr. Paulo Oliveira",
    authorImage: "https://randomuser.me/api/portraits/men/19.jpg",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80",
    category: "MEI",
  },
  {
    id: 5,
    title: "Assinatura digital em contratos: tudo o que você precisa saber",
    slug: "assinatura-digital-contratos-tudo-o-que-precisa-saber",
    excerpt:
      "Descubra como funciona a assinatura digital, sua validade jurídica e como implementá-la em seus contratos.",
    date: "05 Abr, 2025",
    author: "Dra. Fernanda Lima",
    authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80",
    category: "Tecnologia",
  },
  {
    id: 6,
    title: "Os 5 erros mais comuns em contratos de prestação de serviços",
    slug: "erros-comuns-contratos-prestacao-servicos",
    excerpt:
      "Conheça os equívocos mais frequentes que podem comprometer a segurança jurídica do seu contrato e como evitá-los.",
    date: "01 Abr, 2025",
    author: "Dr. Marcos Vieira",
    authorImage: "https://randomuser.me/api/portraits/men/55.jpg",
    image: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&q=80",
    category: "Contratos",
  },
];

const categories = [
  { name: "Todos", count: 16 },
  { name: "Contratos", count: 8 },
  { name: "Freelancers", count: 6 },
  { name: "MEI", count: 5 },
  { name: "Dicas Legais", count: 4 },
  { name: "Tecnologia", count: 3 },
];

const popularPosts = [
  {
    title: "Guia definitivo de contratos para designers",
    slug: "guia-definitivo-contratos-designers",
  },
  {
    title: "Como cobrar por projetos: hora ou valor fixo?",
    slug: "como-cobrar-projetos-hora-valor-fixo",
  },
  {
    title: "Propriedade intelectual: proteja suas criações",
    slug: "propriedade-intelectual-proteja-suas-criacoes",
  },
  {
    title: "Rescisão de contrato: o que fazer quando dá errado",
    slug: "rescisao-contrato-o-que-fazer-quando-da-errado",
  },
];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-brand-50 py-16 md:py-24 border-b border-gray-100">
        <div className="container-tight text-center">
          <h1 className="font-bold mb-6">Blog do ContratoFlash</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Artigos, dicas e insights para ajudar freelancers e pequenas empresas
            a gerenciar seus contratos e aspectos legais com segurança.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Pesquisar artigos..."
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24">
                {/* Categories */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                  <h3 className="text-lg font-medium mb-4">Categorias</h3>
                  <ul className="space-y-2">
                    {categories.map((category) => (
                      <li key={category.name}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start font-normal ${
                            selectedCategory === category.name
                              ? "text-brand-400 bg-brand-50"
                              : "text-gray-700"
                          }`}
                          onClick={() => setSelectedCategory(category.name)}
                        >
                          {category.name}
                          <span className="ml-auto text-gray-400 text-sm">
                            {category.count}
                          </span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Popular Posts */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                  <h3 className="text-lg font-medium mb-4">
                    Artigos Populares
                  </h3>
                  <ul className="space-y-4">
                    {popularPosts.map((post, index) => (
                      <li key={index}>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-gray-700 hover:text-brand-400 block"
                        >
                          {post.title}
                        </Link>
                        {index < popularPosts.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="bg-brand-50 p-6 rounded-lg border border-brand-100">
                  <h3 className="text-lg font-medium mb-2">
                    Pronto para criar seu contrato?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use nosso gerador de contratos e tenha um documento pronto
                    em minutos!
                  </p>
                  <Link to="/registro">
                    <Button className="w-full bg-brand-400 hover:bg-brand-500">
                      Crie seu contrato agora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <BlogPostCard
                      key={post.id}
                      title={post.title}
                      excerpt={post.excerpt}
                      date={post.date}
                      author={post.author}
                      authorImage={post.authorImage}
                      image={post.image}
                      slug={post.slug}
                      category={post.category}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-xl font-medium mb-2">
                      Nenhum artigo encontrado
                    </h3>
                    <p className="text-gray-600">
                      Tente ajustar sua pesquisa ou categoria para encontrar
                      mais conteúdo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="container-tight text-center">
          <h2 className="text-3xl font-bold mb-4">
            Receba atualizações e dicas legais
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Inscreva-se para receber nossos artigos mais recentes, modelos de
            contrato gratuitos e dicas jurídicas para o seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <Input
              type="email"
              placeholder="Seu melhor email"
              className="py-6 text-base"
            />
            <Button className="bg-brand-400 hover:bg-brand-500 whitespace-nowrap">
              Inscrever-se
            </Button>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Prometemos não enviar spam. Você pode cancelar a qualquer momento.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
