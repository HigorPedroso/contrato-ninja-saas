
import { useState, useEffect } from "react";
import { fetchContractTemplates } from "@/services/contracts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Templates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user, isSubscribed } = useAuth();

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      const data = await fetchContractTemplates();
      setTemplates(data);
      setLoading(false);
    };

    loadTemplates();
  }, []);

  const handlePreview = (template: any) => {
    if (template.is_premium && !isSubscribed) {
      toast({
        title: "Modelo Premium",
        description: "Este modelo está disponível apenas para assinantes do plano Premium.",
        variant: "default",
      });
      return;
    }

    setSelectedTemplate(template);
    setOpenDialog(true);
  };

  // Group templates by type
  const groupedTemplates = templates.reduce((groups: any, template) => {
    const type = template.template_type || "Outros";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(template);
    return groups;
  }, {});

  const templateTypes = Object.keys(groupedTemplates).sort();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Modelos de Contratos</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore nossa biblioteca de modelos de contratos profissionais para diferentes situações e necessidades.
            </p>
          </div>
          
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-6" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {templateTypes.map((type) => (
                <div key={type} className="mb-12">
                  <h2 className="text-2xl font-semibold mb-6 border-b pb-2">{type}</h2>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {groupedTemplates[type].map((template: any) => (
                      <Card key={template.id} className={`overflow-hidden ${template.is_premium ? 'border-brand-300' : ''}`}>
                        {template.is_premium && (
                          <div className="bg-brand-100 text-brand-700 text-sm font-medium py-1 px-3 flex items-center justify-between">
                            <span>Modelo Premium</span>
                            {!isSubscribed && <Lock className="h-3.5 w-3.5" />}
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-medium">{template.title}</h3>
                            <FileText className="h-5 w-5 text-gray-400 mt-1" />
                          </div>
                          <p className="text-gray-600 text-sm mb-6">
                            {template.description || "Modelo de contrato profissional validado por advogados."}
                          </p>
                          <div className="flex space-x-3">
                            <Button 
                              variant="outline"
                              onClick={() => handlePreview(template)}
                              className="flex-1"
                            >
                              Pré-visualizar
                            </Button>
                            
                            {user ? (
                              <Link to="/dashboard/criar-contrato" className="flex-1">
                                <Button 
                                  className={`w-full ${template.is_premium && !isSubscribed ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-400 hover:bg-brand-500'}`}
                                  disabled={template.is_premium && !isSubscribed}
                                >
                                  Usar modelo
                                </Button>
                              </Link>
                            ) : (
                              <Link to="/registro" className="flex-1">
                                <Button className="w-full bg-brand-400 hover:bg-brand-500">
                                  Cadastre-se
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              
              {templates.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum modelo encontrado
                  </h3>
                  <p className="text-gray-500">
                    Não há modelos de contratos disponíveis no momento.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedTemplate && (
              <div className="mt-4">
                <div className="mb-6">
                  <p className="text-gray-600">
                    {selectedTemplate.description || "Este é um modelo de contrato profissional."}
                  </p>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
                  {selectedTemplate.content.substring(0, 500)}... <span className="text-gray-400">(Versão resumida)</span>
                </div>
                
                <div className="flex justify-end mt-6">
                  {user ? (
                    <Link to="/dashboard/criar-contrato">
                      <Button 
                        className={`${selectedTemplate.is_premium && !isSubscribed ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-400 hover:bg-brand-500'}`}
                        disabled={selectedTemplate.is_premium && !isSubscribed}
                      >
                        {selectedTemplate.is_premium && !isSubscribed ? (
                          "Assinar para usar"
                        ) : (
                          "Usar este modelo"
                        )}
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/registro">
                      <Button className="bg-brand-400 hover:bg-brand-500">
                        Cadastre-se para usar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default Templates;
