
import { useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
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

const contractTypes = [
  {
    value: "prestacao-servico",
    label: "Prestação de Serviço",
    fields: ["cliente", "descricao", "valor", "prazo", "pagamento"],
  },
  {
    value: "aluguel",
    label: "Contrato de Aluguel",
    fields: [
      "locatario",
      "imovel",
      "valor",
      "prazo",
      "deposito",
      "pagamento",
      "multa",
    ],
  },
  {
    value: "compra-venda",
    label: "Compra e Venda",
    fields: ["comprador", "produto", "valor", "entrega", "pagamento", "multa"],
  },
  {
    value: "confidencialidade",
    label: "Confidencialidade (NDA)",
    fields: ["parte", "objeto", "prazo", "multa"],
  },
  {
    value: "freelancer",
    label: "Contrato para Freelancer",
    fields: [
      "cliente",
      "projeto",
      "escopo",
      "valor",
      "prazo",
      "entregas",
      "pagamento",
      "revisoes",
    ],
  },
];

const ContractForm = () => {
  const [contractType, setContractType] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();

  const handleTypeChange = (value: string) => {
    setContractType(value);
    setFormData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleNext = () => {
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Contrato gerado com sucesso!",
      description: "Seu contrato foi gerado e está pronto para download.",
    });
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      cliente: "Nome do Cliente",
      locatario: "Nome do Locatário",
      comprador: "Nome do Comprador",
      parte: "Nome da Outra Parte",
      descricao: "Descrição do Serviço",
      projeto: "Nome do Projeto",
      escopo: "Escopo do Trabalho",
      imovel: "Endereço do Imóvel",
      produto: "Descrição do Produto",
      objeto: "Objeto da Confidencialidade",
      valor: "Valor (R$)",
      prazo: "Prazo (dias)",
      deposito: "Valor do Depósito Caução (R$)",
      entrega: "Prazo de Entrega (dias)",
      pagamento: "Condições de Pagamento",
      entregas: "Detalhes das Entregas",
      multa: "Valor da Multa por Descumprimento (R$)",
      revisoes: "Número de Revisões Inclusas",
    };

    return labels[field] || field;
  };

  const getFieldType = (field: string) => {
    if (
      field === "descricao" ||
      field === "escopo" ||
      field === "pagamento" ||
      field === "entregas"
    ) {
      return "textarea";
    }
    if (
      field === "valor" ||
      field === "prazo" ||
      field === "deposito" ||
      field === "entrega" ||
      field === "multa" ||
      field === "revisoes"
    ) {
      return "number";
    }
    return "text";
  };

  const selectedContract = contractTypes.find((c) => c.value === contractType);

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
            <Label htmlFor="contract-type" className="text-base mb-2 block">
              Selecione o tipo de contrato
            </Label>
            <Select onValueChange={handleTypeChange} value={contractType}>
              <SelectTrigger id="contract-type" className="w-full">
                <SelectValue placeholder="Selecione um tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                {contractTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {contractType && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">
                  {selectedContract?.label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedContract?.fields.map((field) =>
                    getFieldType(field) === "textarea" ? (
                      <div key={field} className="md:col-span-2">
                        <Label htmlFor={field} className="mb-2 block">
                          {getFieldLabel(field)}
                        </Label>
                        <Textarea
                          id={field}
                          className="resize-none"
                          rows={4}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <div key={field}>
                        <Label htmlFor={field} className="mb-2 block">
                          {getFieldLabel(field)}
                        </Label>
                        <Input
                          id={field}
                          type={getFieldType(field)}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {selectedContract?.fields.map((field) => (
                <div key={field} className="flex">
                  <span className="font-medium mr-2 text-gray-700">
                    {getFieldLabel(field)}:
                  </span>
                  <span className="text-gray-600">
                    {(formData as any)[field] || "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Editar Informações
            </Button>
            <Button
              className="bg-brand-400 hover:bg-brand-500"
              onClick={handleSubmit}
            >
              <FileText className="mr-2 h-4 w-4" /> Gerar Contrato PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractForm;
