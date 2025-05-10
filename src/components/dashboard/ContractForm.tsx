
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchContractTemplates, checkContractLimit } from "@/services/contracts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  templateId: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email({ 
    message: "Email inválido" 
  }).or(z.literal('')),
  amount: z.string().optional(),
  content: z.string().min(10, {
    message: "O conteúdo deve ter pelo menos 10 caracteres",
  }),
});

const ContractForm = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  const defaultValues = useMemo(() => ({
    title: "",
    templateId: "",
    clientName: "",
    clientEmail: "",
    amount: "",
    content: "",
  }), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    const loadTemplates = async () => {
      const templates = await fetchContractTemplates();
      setTemplates(templates);
      setIsLoading(false);
    };

    // Check if the user has reached their contract limit
    const checkLimit = async () => {
      const { canCreate, message } = await checkContractLimit();
      setLimitReached(!canCreate);
      if (message) {
        setLimitMessage(message);
      }
    };

    loadTemplates();
    checkLimit();
  }, []);

  const handleTemplateChange = async (templateId: string) => {
    // Reset the content field first
    form.setValue("content", "");
    
    if (!templateId) return;

    // Find the template from our loaded templates
    const template = templates.find(t => t.id === templateId);
    if (template) {
      form.setValue("content", template.content);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Double-check the contract limit before submission
      if (!isSubscribed) {
        const { canCreate, message } = await checkContractLimit();
        if (!canCreate) {
          toast({
            title: "Limite de contratos atingido",
            description: message || "Você atingiu o limite de contratos do plano gratuito.",
            variant: "destructive",
          });
          setLimitReached(true);
          setLimitMessage(message || "");
          return;
        }
      }

      setIsSubmitting(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Parse amount to numeric if provided
      let amount = null;
      if (values.amount && values.amount.trim() !== "") {
        amount = parseFloat(values.amount.replace(",", "."));
      }

      // Prepare data for insertion
      const contractData = {
        title: values.title,
        template_id: values.templateId || null,
        client_name: values.clientName || null,
        client_email: values.clientEmail || null,
        content: values.content,
        amount: amount,
        user_id: userData.user?.id,
        status: "draft" as const, // Explicitly type this as a literal to satisfy TypeScript
      };

      const { data, error } = await supabase
        .from("contracts")
        .insert(contractData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Contrato criado com sucesso",
        description: `O contrato "${values.title}" foi criado com sucesso.`,
      });

      // Redirect to the contracts list
      navigate("/dashboard/contratos");
    } catch (error: any) {
      console.error("Erro ao criar contrato:", error);
      toast({
        title: "Erro ao criar contrato",
        description: error.message || "Ocorreu um erro ao criar o contrato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      {limitReached ? (
        <div className="text-center p-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            Limite de Contratos Atingido
          </h2>
          <p className="text-gray-600 mb-6">
            {limitMessage || "Você atingiu o limite de 3 contratos por mês no plano gratuito."}
          </p>
          <Button
            className="bg-brand-400 hover:bg-brand-500"
            onClick={() => navigate("/dashboard/assinatura")}
          >
            Assinar Plano Premium
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Contrato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Contrato de Prestação de Serviços" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de Contrato</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTemplateChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo ou crie do zero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Criar do zero</SelectItem>
                        {templates.map((template) => {
                          // Check if this is a premium template and user doesn't have premium
                          const isPremiumRestricted = template.is_premium && !isSubscribed;
                          
                          return (
                            <SelectItem 
                              key={template.id} 
                              value={template.id}
                              disabled={isPremiumRestricted}
                            >
                              {template.title} 
                              {isPremiumRestricted ? ' (Premium)' : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: cliente@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Contrato (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 1500,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo do Contrato</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o conteúdo do contrato aqui..."
                      className="h-64 font-mono"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500 mt-2">
                    Dica: Você pode usar tags HTML para formatação, como <code>&lt;strong&gt;texto em negrito&lt;/strong&gt;</code> para texto em negrito.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/contratos")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand-400 hover:bg-brand-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Contrato...
                  </>
                ) : (
                  "Criar Contrato"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Card>
  );
};

export default ContractForm;
