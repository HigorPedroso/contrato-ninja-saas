
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchContractTemplates } from "@/services/contracts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";

type ContractTemplate = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  template_type: string;
  is_premium: boolean;
};

type ContractField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date";
};

const getFieldsFromTemplate = (content: string): ContractField[] => {
  const placeholderRegex = /\{([A-Z_]+)\}/g;
  const matches = content.match(placeholderRegex) || [];
  const uniqueFields = [...new Set(matches.map(match => match.slice(1, -1)))];
  
  return uniqueFields.map(field => {
    const key = field;
    
    let label = field.replace(/_/g, ' ').toLowerCase();
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    let type: "text" | "textarea" | "number" | "date" = "text";
    
    // Determine field type based on field name
    if (field.includes("DATE")) {
      type = "date";
    } else if (field.includes("AMOUNT") || field.includes("PERCENTAGE") || field.includes("NUMBER")) {
      type = "number";
    } else if (field.includes("DESCRIPTION") || field.includes("TERMS") || field.includes("ACTIVITIES")) {
      type = "textarea";
    }
    
    return { key, label, type };
  });
};

const ContractForm = () => {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [contractTitle, setContractTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [fields, setFields] = useState<ContractField[]>([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      const data = await fetchContractTemplates();
      setTemplates(data);
      setIsLoading(false);
    };

    loadTemplates();
  }, []);

  const handleTemplateChange = (value: string) => {
    const template = templates.find(t => t.id === value);
    if (template) {
      setSelectedTemplate(value);
      // Extract fields from template content
      const extractedFields = getFieldsFromTemplate(template.content);
      setFields(extractedFields);
      // Reset form data
      setFormData({});
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleNext = () => {
    if (!contractTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, forneça um título para o contrato",
        variant: "destructive",
      });
      return;
    }

    const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
    if (!selectedTemplateObj) return;
    
    let content = selectedTemplateObj.content;
    
    // Replace placeholders with form data
    for (const [key, value] of Object.entries(formData)) {
      content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    setGeneratedContent(content);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const generateContract = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar contratos",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Insert contract into database
      const { error } = await supabase.from('contracts').insert({
        user_id: user.id,
        template_id: selectedTemplate,
        title: contractTitle,
        content: generatedContent,
        client_name: clientName,
        client_email: clientEmail,
        status: 'draft',
      });
      
      if (error) {
        console.error("Error creating contract:", error);
        throw error;
      }
      
      toast({
        title: "Contrato criado com sucesso!",
        description: "Seu contrato foi salvo e está disponível para download.",
      });
      
      // Redirect to contracts page
      navigate("/dashboard/contratos");
    } catch (error: any) {
      console.error("Error creating contract:", error);
      toast({
        title: "Erro ao criar contrato",
        description: error.message || "Não foi possível salvar seu contrato. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const downloadContractAsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(contractTitle, 20, 20);
      
      // Add content
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      // Split text into lines to fit page width
      const splitText = doc.splitTextToSize(generatedContent, 170);
      doc.text(splitText, 20, 40);
      
      // Generate a filename based on contract title and client name
      let filename = "contrato";
      if (clientName) {
        // Remove special characters and replace spaces with hyphens
        const clientNameNormalized = clientName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/\s+/g, "-");
        filename += `-${clientNameNormalized}`;
      }
      filename += ".pdf";
      
      // Save the PDF
      doc.save(filename);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "Seu contrato foi baixado como PDF.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-medium">Criar Novo Contrato</h2>
        <p className="text-gray-500">
          Preencha o formulário para gerar seu contrato personalizado
        </p>
      </div>

      {step === 1 ? (
        <div className="p-6">
          <div className="mb-6">
            <Label htmlFor="contract-title" className="text-base mb-2 block">
              Título do contrato
            </Label>
            <Input 
              id="contract-title" 
              className="w-full" 
              placeholder="Ex: Contrato de design para Website da Empresa XYZ"
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="client-name" className="text-base mb-2 block">
              Nome do cliente
            </Label>
            <Input 
              id="client-name" 
              className="w-full" 
              placeholder="Nome completo ou razão social"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="client-email" className="text-base mb-2 block">
              Email do cliente
            </Label>
            <Input 
              id="client-email" 
              type="email"
              className="w-full" 
              placeholder="email@exemplo.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="contract-type" className="text-base mb-2 block">
              Selecione o modelo de contrato
            </Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={handleTemplateChange} value={selectedTemplate}>
                <SelectTrigger id="contract-type" className="w-full">
                  <SelectValue placeholder="Selecione um modelo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                      {template.is_premium && " (Premium)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedTemplate && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">
                  Informações específicas do contrato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map((field) =>
                    field.type === "textarea" ? (
                      <div key={field.key} className="md:col-span-2">
                        <Label htmlFor={field.key} className="mb-2 block">
                          {field.label}
                        </Label>
                        <Textarea
                          id={field.key}
                          className="resize-none"
                          rows={4}
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.value)
                          }
                        />
                      </div>
                    ) : field.type === "date" ? (
                      <div key={field.key}>
                        <Label htmlFor={field.key} className="mb-2 block">
                          {field.label}
                        </Label>
                        <Input
                          id={field.key}
                          type="date"
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <div key={field.key}>
                        <Label htmlFor={field.key} className="mb-2 block">
                          {field.label}
                        </Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          onChange={(e) =>
                            handleInputChange(field.key, e.target.value)
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              <Button
                className="w-full md:w-auto bg-brand-400 hover:bg-brand-500"
                onClick={handleNext}
              >
                Continuar <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="p-6">
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => setStep(1)}
          >
            <ChevronDown className="mr-2 h-4 w-4 rotate-90" /> Voltar
          </Button>

          <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium mb-4">Revise os dados</h3>
            
            <div className="mb-4">
              <span className="font-medium mr-2 text-gray-700">
                Título do contrato:
              </span>
              <span className="text-gray-600">{contractTitle}</span>
            </div>
            
            <div className="mb-4">
              <span className="font-medium mr-2 text-gray-700">
                Cliente:
              </span>
              <span className="text-gray-600">{clientName || "-"}</span>
            </div>
            
            <div className="mb-4">
              <span className="font-medium mr-2 text-gray-700">
                Email do cliente:
              </span>
              <span className="text-gray-600">{clientEmail || "-"}</span>
            </div>
            
            <div className="mb-4">
              <span className="font-medium mr-2 text-gray-700">
                Modelo de contrato:
              </span>
              <span className="text-gray-600">
                {templates.find(t => t.id === selectedTemplate)?.title || "-"}
              </span>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Informações específicas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {fields.map((field) => (
                  <div key={field.key} className="flex">
                    <span className="font-medium mr-2 text-gray-700">
                      {field.label}:
                    </span>
                    <span className="text-gray-600">
                      {formData[field.key] || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-lg my-8 whitespace-pre-wrap bg-white">
            <h3 className="text-lg font-medium mb-4">Visualização do Contrato</h3>
            <div className="prose prose-sm max-w-none">
              {generatedContent.split('\n').map((line, index) => (
                <p key={index} className="mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Editar Informações
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-brand-400 text-brand-400 hover:bg-brand-50"
                onClick={downloadContractAsPDF}
              >
                <Download className="mr-2 h-4 w-4" /> Baixar PDF
              </Button>
              <Button
                className="bg-brand-400 hover:bg-brand-500"
                onClick={generateContract}
              >
                <FileText className="mr-2 h-4 w-4" /> Salvar Contrato
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractForm;
