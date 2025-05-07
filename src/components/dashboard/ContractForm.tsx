
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, FileText, Download, Eye } from "lucide-react";
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
    
    // Tradução das labels para português
    let label = field.replace(/_/g, ' ').toLowerCase();
    
    // Mapeamento de termos em inglês para português
    const translations: Record<string, string> = {
      'client': 'cliente',
      'name': 'nome',
      'service': 'serviço',
      'description': 'descrição',
      'value': 'valor',
      'amount': 'montante',
      'date': 'data',
      'deadline': 'prazo',
      'payment': 'pagamento',
      'terms': 'termos',
      'activities': 'atividades',
      'contract': 'contrato',
      'period': 'período',
      'company': 'empresa',
      'address': 'endereço',
      'percentage': 'percentual',
      'number': 'número'
    };
    
    // Aplica tradução quando possível
    Object.entries(translations).forEach(([en, pt]) => {
      label = label.replace(new RegExp(en, 'gi'), pt);
    });
    
    // Primeira letra maiúscula
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    let type: "text" | "textarea" | "number" | "date" = "text";
    
    // Determine o tipo de campo baseado no nome
    if (field.includes("DATE")) {
      type = "date";
    } else if (field.includes("AMOUNT") || field.includes("PERCENTAGE") || field.includes("NUMBER") || field.includes("VALUE")) {
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
  const [isPreviewing, setIsPreviewing] = useState(false);
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
      // Extrai campos do template
      const extractedFields = getFieldsFromTemplate(template.content);
      setFields(extractedFields);
      // Reinicia os dados do formulário
      setFormData({});
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const formatContractContent = (content: string) => {
    // Formatação do conteúdo do contrato com estilos HTML
    let formattedContent = content
      .replace(/\n\n/g, '<br><br>') // Quebras de linha
      .replace(/\n/g, '<br>') // Quebras de linha simples
      .replace(/CLÁUSULA (.*?):/g, '<br><strong>CLÁUSULA $1:</strong><br>') // Destaca cláusulas
      .replace(/Artigo (.*?):/g, '<br><strong>Artigo $1:</strong><br>') // Destaca artigos
      .replace(/O QUE SERÁ FEITO/g, '<strong>O QUE SERÁ FEITO</strong>')
      .replace(/QUANTO SERÁ PAGO/g, '<strong>QUANTO SERÁ PAGO</strong>')
      .replace(/PRAZO DE ENTREGA/g, '<strong>PRAZO DE ENTREGA</strong>')
      .replace(/RESCISÃO/g, '<strong>RESCISÃO</strong>')
      .replace(/FORO/g, '<strong>FORO</strong>');
    
    return formattedContent;
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
    
    // Substitui os placeholders com os dados do formulário
    for (const [key, value] of Object.entries(formData)) {
      content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }

    // Simplifica o contrato para linguagem mais acessível
    content = simplifyContractLanguage(content);

    // Formata o conteúdo para melhor visualização
    const formattedContent = formatContractContent(content);

    setGeneratedContent(formattedContent);
    setStep(2);
    window.scrollTo(0, 0);
  };

  // Função para simplificar a linguagem jurídica do contrato
  const simplifyContractLanguage = (content: string): string => {
    let simplified = content;
    
    // Substitui jargões e termos complexos por linguagem mais simples
    const replacements = [
      { from: "as partes, de comum acordo, pactuam", to: "ambos concordam" },
      { from: "o presente instrumento", to: "este contrato" },
      { from: "conforme disposto na cláusula", to: "como indicado no item" },
      { from: "no que tange", to: "sobre" },
      { from: "far-se-á", to: "será feito" },
      { from: "supramencionado", to: "mencionado acima" },
      { from: "supracitado", to: "citado acima" },
      { from: "mediante", to: "por meio de" },
      { from: "rescisão do instrumento", to: "cancelamento do contrato" },
      { from: "o ora contratado", to: "o prestador de serviços" },
      { from: "o ora contratante", to: "o cliente" },
      { from: "outorgar", to: "conceder" },
      { from: "subsequente", to: "seguinte" },
      { from: "precedente", to: "anterior" },
      { from: "adimplemento", to: "pagamento" },
      { from: "inadimplemento", to: "falta de pagamento" },
      { from: "a parte que incorrer em mora", to: "quem atrasar o pagamento" },
      { from: "por intermédio de", to: "através de" },
      { from: "elege-se o foro", to: "fica definido o foro" },
      { from: "dirimir questões oriundas", to: "resolver problemas relacionados" }
    ];
    
    replacements.forEach(({ from, to }) => {
      simplified = simplified.replace(new RegExp(from, 'gi'), to);
    });
    
    // Adiciona subtítulos mais claros
    simplified = simplified
      .replace(/CLÁUSULA\s+(\d+|PRIMEIRA|SEGUNDA|TERCEIRA|QUARTA|QUINTA)\s*[-–:]\s*DO OBJETO/gi, "O QUE SERÁ FEITO")
      .replace(/CLÁUSULA\s+(\d+|PRIMEIRA|SEGUNDA|TERCEIRA|QUARTA|QUINTA)\s*[-–:]\s*DO PAGAMENTO/gi, "QUANTO SERÁ PAGO")
      .replace(/CLÁUSULA\s+(\d+|PRIMEIRA|SEGUNDA|TERCEIRA|QUARTA|QUINTA)\s*[-–:]\s*DO PRAZO/gi, "PRAZO DE ENTREGA")
      .replace(/CLÁUSULA\s+(\d+|PRIMEIRA|SEGUNDA|TERCEIRA|QUARTA|QUINTA)\s*[-–:]\s*DA RESCISÃO/gi, "RESCISÃO")
      .replace(/CLÁUSULA\s+(\d+|PRIMEIRA|SEGUNDA|TERCEIRA|QUARTA|QUINTA)\s*[-–:]\s*DO FORO/gi, "FORO");
    
    return simplified;
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
      // Verifica se o usuário tem premium antes de permitir salvar
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Erro ao verificar plano do usuário:", profileError);
      }
      
      const isPremium = profile?.subscription_plan === 'premium';
      const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
      
      if (selectedTemplateObj?.is_premium && !isPremium) {
        toast({
          title: "Recurso premium",
          description: "Este modelo de contrato é exclusivo para assinantes premium. Faça upgrade do seu plano para continuar.",
          variant: "destructive",
        });
        return;
      }

      // Salva contrato no banco de dados
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
        console.error("Erro ao criar contrato:", error);
        throw error;
      }
      
      toast({
        title: "Contrato criado com sucesso!",
        description: "Seu contrato foi salvo e está disponível para download.",
      });
      
      // Redirecionamento para página de contratos
      navigate("/dashboard/contratos");
    } catch (error: any) {
      console.error("Erro ao criar contrato:", error);
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
      
      // Define estilo e tamanho da fonte
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      
      // Adiciona título
      doc.text(contractTitle, 20, 20);
      
      // Adiciona informações do cliente, se disponíveis
      if (clientName) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Cliente: ${clientName}`, 20, 35);
        
        if (clientEmail) {
          doc.text(`Email: ${clientEmail}`, 20, 42);
        }
      }
      
      // Converte HTML para texto puro para o PDF
      const htmlContent = generatedContent;
      let plainContent = htmlContent
        .replace(/<br>/g, '\n')
        .replace(/<\/?strong>/g, '')
        .replace(/<\/?[^>]+(>|$)/g, '');
      
      // Adiciona conteúdo com espaçamento adequado
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      // Divide o texto em linhas para caber na largura da página
      const splitText = doc.splitTextToSize(plainContent, 170);
      doc.text(splitText, 20, clientName ? 55 : 40);
      
      // Adiciona rodapé com data e assinaturas
      const today = new Date();
      const dateStr = today.toLocaleDateString('pt-BR');
      
      const pageHeight = doc.internal.pageSize.height;
      
      // Adiciona local para assinaturas
      doc.text("_".repeat(30), 30, pageHeight - 50);
      doc.text("_".repeat(30), 120, pageHeight - 50);
      
      doc.setFontSize(10);
      doc.text("CONTRATANTE", 40, pageHeight - 40);
      doc.text("CONTRATADO", 130, pageHeight - 40);
      
      // Adiciona data
      doc.setFontSize(9);
      doc.text(`Documento gerado em: ${dateStr} via ContratoFlash`, 20, pageHeight - 20);
      
      // Gera um nome de arquivo baseado no título e nome do cliente
      let filename = "contrato";
      if (clientName) {
        // Remove caracteres especiais e substitui espaços por hifens
        const clientNameNormalized = clientName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        filename += `-${clientNameNormalized}`;
      }
      filename += ".pdf";
      
      // Salva o PDF
      doc.save(filename);
      
      toast({
        title: "PDF gerado com sucesso",
        description: "Seu contrato foi baixado como PDF.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const previewPDF = () => {
    setIsPreviewing(!isPreviewing);
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

          <div className="border p-4 rounded-lg my-8">
            <h3 className="text-lg font-medium mb-4">Visualização do Contrato</h3>
            
            {isPreviewing ? (
              <div 
                className="prose prose-sm max-w-none p-8 bg-white shadow-sm rounded"
                dangerouslySetInnerHTML={{ __html: generatedContent }}
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: generatedContent }}></div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Editar Informações
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-brand-400 text-brand-400 hover:bg-brand-50"
                onClick={previewPDF}
              >
                <Eye className="mr-2 h-4 w-4" /> {isPreviewing ? "Fechar visualização" : "Visualizar contrato"}
              </Button>
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
