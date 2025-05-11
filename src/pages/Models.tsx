import { useState, useEffect } from "react";
import { Search, Filter, Eye, FileText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ContractModel {
  slug: any;
  id: string;
  title: string;
  description: string | null;
  content: string;
  template_type: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

const Models = () => {
  const [models, setModels] = useState<ContractModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewModel, setPreviewModel] = useState<ContractModel | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      console.log("Fetching models...");
      const { data, error } = await supabase
        .from("contract_templates")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data) {
        console.warn("No data received from Supabase");
        return;
      }

      console.log("Received models:", data.length);
      
      const modelsWithSlugs = data.map(model => ({
        ...model,
        slug: model.title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      }));

      setModels(modelsWithSlugs);
    } catch (error) {
      console.error("Error fetching models:", error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (model.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || model.template_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        <div className="container-tight py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Modelos de Contratos</h1>
            <p className="text-gray-600">
              Escolha entre diversos modelos profissionais validados por advogados
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar modelos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 rounded-lg border border-gray-200"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              <option value="freelancer">Freelancer</option>
              <option value="designer">Designer</option>
              <option value="consultoria">Consultoria Empresarial</option>
            </select>
          </div>

          {/* Grid of Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-8 bg-gray-200 rounded" />
                    <div className="h-6 w-48 bg-gray-200 rounded ml-3" />
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded mb-6" />
                  <div className="flex gap-2">
                    <div className="h-9 w-24 bg-gray-200 rounded" />
                    <div className="h-9 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              ))
            ) : filteredModels.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum modelo encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar seus filtros ou termos de busca
                </p>
              </div>
            ) : (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <FileText className="h-8 w-8 text-brand-400" />
                    <h3 className="text-xl font-semibold ml-3">{model.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6 line-clamp-2">{model.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewModel(model)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(user ? `/dashboard` : '/login')}
                    >
                      Usar modelo
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview Modal */}
          <Dialog open={!!previewModel} onOpenChange={() => setPreviewModel(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
              {previewModel && (
                <div className="flex flex-col h-full max-h-[calc(90vh-4rem)]">
                  <h2 className="text-2xl font-semibold mb-4 flex-shrink-0">{previewModel.title}</h2>
                  <div 
                    className="flex-1 overflow-y-auto prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:font-semibold prose-strong:text-gray-900 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    dangerouslySetInnerHTML={{ __html: previewModel.content }}
                  />
                  <div className="mt-6 flex justify-end gap-4 pt-4 border-t flex-shrink-0">
                    <Button variant="outline" onClick={() => setPreviewModel(null)}>
                      Fechar
                    </Button>
                    <Button onClick={() => navigate(user ? `/dashboard` : '/login')}>
                      Usar este modelo
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Models;