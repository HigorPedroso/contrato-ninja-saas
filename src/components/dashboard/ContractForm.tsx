import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchContractTemplates,
  checkContractLimit,
} from "@/services/contracts";
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
import { supabase } from "@/integrations/supabase/client";
import { forwardRef } from "react";
import {
  generateFreelancerContract,
  generateDesignContract,
  generateConsultingContract
} from "@/utils/contractTemplates";
import InputMask from "react-input-mask";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  templateId: z.string(),
  clientName: z.string().optional(),
  clientEmail: z
    .string()
    .email({ message: "Email inválido" })
    .or(z.literal("")),
  amount: z.string().optional(),
  content: z.string().optional(),
  contractorName: z.string().optional(),
  contractorDocument: z.string().optional(),
  contractorAddress: z.string().optional(),
  freelancerName: z.string().optional(),
  freelancerCpf: z.string().optional(),
  freelancerAddress: z.string().optional(),
  serviceDescription: z.string().optional(),
  startDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  additionalClauses: z.string().optional(),
  companyName: z.string().optional(),
  companyCnpj: z.string().optional(),
  companyAddress: z.string().optional(),
  consultantName: z.string().optional(),
  consultantDocument: z.string().optional(),
  consultantAddress: z.string().optional(),
  consultingArea: z.string().optional(),
  consultingObjective: z.string().optional(),
  contractDuration: z.string().optional(),
  meetingFrequency: z.string().optional(),
  reportDeliveryMethod: z.string().optional(),
  legalRepresentativeName: z.string().optional(),
  legalRepresentativeCpf: z.string().optional(),
});

const ContractForm = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFreelancerContract, setIsFreelancerContract] = useState(false);
  const [isDesignContract, setIsDesignContract] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const { isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [isConsultingContract, setIsConsultingContract] = useState(false);

  const defaultValues = useMemo(
    () => ({
      title: "",
      templateId: "",
      clientName: "",
      clientEmail: "",
      amount: "",
      content: "",
      contractorName: "",
      contractorDocument: "",
      contractorAddress: "",
      freelancerName: "",
      freelancerCpf: "",
      freelancerAddress: "",
      serviceDescription: "",
      startDate: "",
      deliveryDate: "",
      paymentMethod: "",
      additionalClauses: "",
      companyName: "",
      companyCnpj: "",
      companyAddress: "",
      consultantName: "",
      consultantDocument: "",
      consultantAddress: "",
      consultingArea: "",
      consultingObjective: "",
      contractDuration: "",
      meetingFrequency: "",
      reportDeliveryMethod: "",
      legalRepresentativeName: "",
      legalRepresentativeCpf: "",
    }),
    []
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Add onSubmit function
  // Also update the onSubmit function to handle design contracts
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { canCreate, message } = await checkContractLimit();
      if (!canCreate && !isSubscribed) {
        toast({
          title: "Limite atingido",
          description:
            message || "Você atingiu o limite de contratos do plano gratuito.",
          variant: "destructive",
        });
        setLimitReached(true);
        setLimitMessage(message || "");
        return;
      }

      let content = values.content || "";
      if (isFreelancerContract) {
        content = generateFreelancerContract(values);
      } else if (isDesignContract) {
        content = generateDesignContract(values);
      } else if (isConsultingContract) {
        content = generateConsultingContract(values);
      }

      const contractData = {
        title: values.title,
        content: content,
        client_name: isFreelancerContract
          ? values.contractorName
          : values.clientName,
        client_email: values.clientEmail,
        amount: values.amount ? parseFloat(values.amount) : null,
        user_id: user?.id,
        status: "draft" as "draft" | "active" | "expired" | "canceled",
      };

      const { error } = await supabase.from("contracts").insert(contractData);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Contrato criado com sucesso.",
      });

      navigate("/dashboard/contratos");
    } catch (err) {
      console.error("Error creating contract:", err);
      toast({
        title: "Erro ao criar contrato",
        description: "Ocorreu um erro ao criar o contrato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateChange = async (templateId) => {
    form.setValue("content", "");

    if (templateId === "consulting") {
      setIsFreelancerContract(false);
      setIsDesignContract(false);
      setIsConsultingContract(true);
      return;
    }

    if (templateId === "create_new") {
      setIsFreelancerContract(false);
      setIsDesignContract(false);
      return;
    }

    if (templateId === "freelancer") {
      setIsFreelancerContract(true);
      setIsDesignContract(false);
      return;
    }

    if (templateId === "design") {
      setIsFreelancerContract(false);
      setIsDesignContract(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("contract_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;

      if (data) {
        form.setValue("content", data.content);
        setIsFreelancerContract(data.template_type === "freelancer");
      }
    } catch (err) {
      console.error("Error fetching template:", err);
      toast({
        title: "Erro",
        description: "Erro ao carregar o modelo de contrato",
        variant: "destructive",
      });
    }
  };

  const currencyMask = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d)(\d{2})$/, "$1,$2")
      .replace(/(?=(\d{3})+(\D))\B/g, ".");
  };

  const MaskedInput = forwardRef((props: any, ref) => {
    return <InputMask {...props} inputRef={ref} />;
  });
  MaskedInput.displayName = "MaskedInput";

  return (
    <Card className="p-6">
      {limitReached ? (
        <div className="text-center p-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            Limite de Contratos Atingido
          </h2>
          <p className="text-gray-600 mb-6">
            {limitMessage ||
              "Você atingiu o limite de 3 contratos por mês no plano gratuito."}
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Contrato</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="Ex: Contrato de Prestação de Serviços"
                      {...field}
                    />
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
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="create_new">Criar do zero</SelectItem>
                      <SelectItem value="freelancer">
                        Contrato de Freelancer
                      </SelectItem>
                      <SelectItem value="design">Contrato de Design</SelectItem>
                      <SelectItem value="consulting">
                        Contrato de Consultoria
                      </SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isFreelancerContract ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contractorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contratante</FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Nome completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractorAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço do Contratante</FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Endereço completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freelancerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Freelancer</FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Nome completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freelancerCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF do Freelancer</FormLabel>
                      <FormControl>
                        <MaskedInput
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          mask="999.999.999-99"
                          required
                          placeholder="000.000.000-00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyCnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ da Empresa</FormLabel>
                      <FormControl>
                        <MaskedInput
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          mask="99.999.999/9999-99"
                          required
                          placeholder="00.000.000/0000-00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freelancerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço do Freelancer</FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Endereço completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input required type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Entrega</FormLabel>
                      <FormControl>
                        <Input required type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => field.onChange(currencyMask(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contractorDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ do Contratante</FormLabel>
                              <FormControl>
                                <MaskedInput
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  mask={field.value?.length <= 14 ? "999.999.999-99" : "99.999.999/9999-99"}
                                  required
                                  placeholder="000.000.000-00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="PIX, Transferência, etc"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceDescription"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Descrição do Serviço</FormLabel>
                      <FormControl>
                        <Textarea
                          required
                          placeholder="Descreva detalhadamente o serviço a ser prestado"
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalClauses"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Cláusulas Adicionais (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Digite cláusulas adicionais aqui..."
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : isDesignContract ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input required placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyCnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ da Empresa</FormLabel>
                      <FormControl>
                        <Input required placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço da Empresa</FormLabel>
                      <FormControl>
                        <Input required placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalRepresentativeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Representante Legal</FormLabel>
                      <FormControl>
                        <Input required placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalRepresentativeCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF do Representante Legal</FormLabel>
                      <FormControl>
                        <Input required placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input required type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input required type="number" placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <FormControl>
                        <Input required placeholder="PIX, Transferência, etc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceDescription"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Descrição do Serviço</FormLabel>
                      <FormControl>
                        <Textarea
                          required
                          placeholder="Descreva detalhadamente o serviço de design a ser prestado"
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : isConsultingContract ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input required placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyCnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ da Empresa</FormLabel>
                      <FormControl>
                        <Input required placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço da Empresa</FormLabel>
                      <FormControl>
                        <Input required placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Consultor</FormLabel>
                      <FormControl>
                        <Input required placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultantDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ do Consultor</FormLabel>
                      <FormControl>
                        <Input required placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultantAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço do Consultor</FormLabel>
                      <FormControl>
                        <Input required placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultingArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área da Consultoria</FormLabel>
                      <FormControl>
                        <Input required placeholder="Ex: Marketing, Finanças, etc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input required type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração do Contrato</FormLabel>
                      <FormControl>
                        <Input required placeholder="Ex: 6 meses, 1 ano" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input required type="number" placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <FormControl>
                        <Input required placeholder="PIX, Transferência, etc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meetingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência das Reuniões</FormLabel>
                      <FormControl>
                        <Input required placeholder="Ex: Semanal, Quinzenal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reportDeliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Entrega dos Relatórios</FormLabel>
                      <FormControl>
                        <Input required placeholder="Ex: Email, Reunião Presencial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultingObjective"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Objetivo da Consultoria</FormLabel>
                      <FormControl>
                        <Textarea
                          required
                          placeholder="Descreva detalhadamente os objetivos da consultoria"
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Default contract fields */}
                </div>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo do Contrato</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Digite o conteúdo do contrato aqui..."
                          className="min-h-[400px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Contrato"
              )}
            </Button>
          </form>
          </Form>
              )}
        </Card>
      );
};

export default ContractForm;
