
import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Edit,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchUserContracts,
  fetchContractById,
  updateContractStatus,
} from "@/services/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import parse from "html-react-parser";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActivity } from "@/hooks/useActivity";
import { PDFDocument } from "pdf-lib";
import { Link, useNavigate } from "react-router-dom";

// Add this import at the top with other imports
import { SHA256 } from "crypto-js";

// Add new imports
import { PenLine, ExternalLink, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Resend } from "resend";
import { ContractStatus, Contract } from "@/types/contract";
import { downloadContract } from "@/services/contractList";
import { useIsMobile } from "@/hooks/use-mobile";

const ContractsList = () => {
  const { trackActivity } = useActivity();
  const isMobile = useIsMobile();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [signatureDialog, setSignatureDialog] = useState(false);
  const { isSubscribed } = useAuth();
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadContracts = async () => {
      setIsLoading(true);
      const data = await fetchUserContracts();
      setContracts(data);
      setIsLoading(false);
    };

    loadContracts();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Function to convert escaped HTML to actual HTML and handle line breaks
  const formatContent = (content: string) => {
    if (!content) return "";

    // Replace \n with <br> for proper line breaks
    let formattedContent = content
      .replace(/\\n/g, "<br>")
      .replace(/\n/g, "<br>");

    // Return formatted content ready to be parsed
    return formattedContent;
  };

  const viewContract = async (contractId: string) => {
    try {
      const contractData = await fetchContractById(contractId);
      if (contractData) {
        await trackActivity("view", contractId, contractData.title);
        setSelectedContract(contractData);
        setOpenDialog(true);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar contrato",
        description: "Não foi possível carregar os detalhes do contrato.",
        variant: "destructive",
      });
    }
  };

  const handleSignatureDialogChange = (open: boolean) => {
    if (!open) {
      setSignedFile(null);
      setClientEmail("");
      setIsValidEmail(false);
      setHasValidSignature(false);
      setUploadProgress(0);
    }
    setSignatureDialog(open);
  };

  const handleStatusUpdate = async (
    contractId: string,
    newStatus: "draft" | "active" | "expired" | "canceled"
  ) => {
    const success = await updateContractStatus(contractId, newStatus);
    if (success) {
      const contract = contracts.find((c) => c.id === contractId);
      if (contract) {
        await trackActivity("edit", contractId, contract.title);
      }
      setContracts(
        contracts.map((contract) =>
          contract.id === contractId
            ? { ...contract, status: newStatus }
            : contract
        )
      );
    }
  };

  // Function to open signature dialog for a contract
  const openSignatureDialog = (contract: any) => {
    setSelectedContract(contract);
    setSignatureDialog(true);
  };

  const canAddSignature = (contract: Contract) => {
    const allowedTypes = [
      "Freelancer",
      "Design",
      "Consultoria",
      "Prestação de Serviços",
    ];
    return contract.status !== "signed";
  };

  // Function to check if the contract type is restricted to premium users
  const isPremiumRestricted = (contractType: string) => {
    return contractType === "Consultoria Empresarial" && !isSubscribed;
  };

  const [signatureStatus, setSignatureStatus] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [hasValidSignature, setHasValidSignature] = useState(false);

  const [signatureError, setSignatureError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setClientEmail(email);
    setIsValidEmail(validateEmail(email));
  };

  const handleSignatureClick = (contract: Contract) => {
    if (!isSubscribed) {
      setShowPremiumAlert(true);
      return;
    }
    openSignatureDialog(contract);
  };

  const sendSignatureRequestEmail = async (
    contractId: string,
    signedFileUrl: string,
    clientEmail: string
  ) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        "https://vqhmhsmufgcoiajgxzmm.supabase.co/functions/v1/enviar-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            to: clientEmail,
            subject: "Solicitação de Assinatura Digital - Contrato Flash",
            html: `
                  <h2>Solicitação de Assinatura Digital</h2>
                  <p>Um contrato está aguardando sua assinatura digital via Gov.br.</p>
                  
                  <h3>Passos para assinar:</h3>
                  <ol>
                    <li>Baixe o contrato já assinado pela outra parte: <a href="${signedFileUrl}">Download do Contrato</a></li>
                    <li>Acesse o portal de assinaturas do Gov.br: <a href="https://assinador.iti.br">Assinador Gov.br</a></li>
                    <li>Faça login com sua conta Gov.br (necessário nível Prata ou Ouro)</li>
                    <li>Upload do PDF baixado e assine digitalmente</li>
                    <li>Após assinar, faça upload do documento assinado: <a href="${window.location.origin}/signature/${contractId}">Upload do Contrato Assinado</a></li>
                  </ol>
                  
                  <p><strong>Importante:</strong> Sua conta Gov.br precisa estar no nível Prata ou Ouro para que a assinatura tenha validade jurídica.</p>
                `,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      toast({
        title: "Email enviado",
        description: "O cliente foi notificado sobre a assinatura pendente.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível notificar o cliente.",
        variant: "destructive",
      });
    }
  };

  // Add new states
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const verifyPdfSignature = async (file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        "https://vqhmhsmufgcoiajgxzmm.supabase.co/functions/v1/verify-signature",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Signature verification result:", data);

      return data.signed;
    } catch (error) {
      console.error("Error verifying PDF signature:", error);
      return false;
    }
  };

  // Update the handleFileUpload function
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const hasSignature = await verifyPdfSignature(file);
      setHasValidSignature(hasSignature); // Add this line to update the state

      if (!hasSignature) {
        toast({
          title: "PDF não assinado",
          description:
            "O arquivo PDF não possui uma assinatura digital válida. Por favor, assine o documento usando o Gov.br primeiro.",
          variant: "destructive",
        });
        setSignedFile(null);
        return;
      }
      setSignedFile(file);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PDF.",
        variant: "destructive",
      });
      setSignedFile(null);
      setHasValidSignature(false); // Reset signature validation when file is invalid
    }
  };

  // Update the handleGovBrSignature function
  const handleGovBrSignature = async () => {
    if (!signedFile || !selectedContract || !clientEmail) return;

    try {
      setUploadProgress(0);
      const fileName = `${selectedContract.id}_signed_${Date.now()}.pdf`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("signed-contracts")
        .upload(fileName, signedFile, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("signed-contracts").getPublicUrl(data.path);

      const signerIp = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip);

      // Update contract maintaining current status if it's already active
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          status: "signed", // Change to signed when client uploads
          client_signed_file_path: data.path, // Changed from signed_file_path
          client_signed_at: new Date().toISOString(), // Add signed timestamp
          signer_ip: signerIp,
          client_email: clientEmail,
        })
        .eq("id", selectedContract.id);

      if (updateError) throw updateError;

      // Send email to client
      await sendSignatureRequestEmail(
        selectedContract.id,
        publicUrl,
        clientEmail
      );

      toast({
        title: "Contrato assinado",
        description: "O PDF assinado foi enviado e o cliente foi notificado.",
      });

      setSignatureDialog(false);
      setSignedFile(null);
      setUploadProgress(0);
      setClientEmail("");

      // Refresh contracts list
      const updatedContracts = await fetchUserContracts();
      setContracts(updatedContracts);
    } catch (error) {
      console.error("Error uploading signed contract:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível processar o contrato assinado.",
        variant: "destructive",
      });
    }
  };

  const getStatusDisplay = (status: ContractStatus) => {
    const statusConfig = {
      [ContractStatus.DRAFT]: {
        label: "Rascunho",
        classes: "bg-yellow-100 text-yellow-800",
      },
      [ContractStatus.PENDING_USER_SIGNATURE]: {
        label: "Aguardando sua assinatura",
        classes: "bg-blue-100 text-blue-800",
      },
      [ContractStatus.PENDING_CLIENT_SIGNATURE]: {
        label: "Aguardando assinatura do cliente",
        classes: "bg-purple-100 text-purple-800",
      },
      [ContractStatus.SIGNED]: {
        label: "Assinado",
        classes: "bg-green-100 text-green-800",
      },
      [ContractStatus.ACTIVE]: {
        label: "Ativo",
        classes: "bg-blue-100 text-blue-800",
      },
      [ContractStatus.EXPIRED]: {
        label: "Expirado",
        classes: "bg-gray-100 text-gray-800",
      },
      [ContractStatus.CANCELED]: {
        label: "Cancelado",
        classes: "bg-red-100 text-red-800",
      },
    };

    return statusConfig[status] || statusConfig[ContractStatus.DRAFT];
  };

  const ContractCard = ({ contract }: { contract: Contract }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start space-x-2 min-w-0 flex-1">
          <FileText className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm leading-tight truncate">{contract.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{contract.type}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ml-2 ${getStatusDisplay(contract.status).classes}`}
        >
          {getStatusDisplay(contract.status).label}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        <p className="text-xs">
          <span className="text-gray-500">Cliente:</span>{" "}
          <span className="break-words">{contract.client_name || "-"}</span>
        </p>
        <p className="text-xs">
          <span className="text-gray-500">Data:</span>{" "}
          {formatDate(contract.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {contract.status === "signed" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadContract(contract.id)}
            className="text-xs h-8"
          >
            <Download className="h-3 w-3 mr-1" /> Baixar
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewContract(contract.id)}
              className="text-xs h-8"
            >
              <Eye className="h-3 w-3 mr-1" /> Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadContract(contract.id)}
              className="text-xs h-8"
            >
              <Download className="h-3 w-3 mr-1" /> Baixar
            </Button>
          </>
        )}
        {canAddSignature(contract) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSignatureClick(contract)}
            className="text-xs h-8 col-span-2"
          >
            <PenLine className="h-3 w-3 mr-1" /> Assinar
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full">
      <div className={`${isMobile ? 'p-3' : 'p-6'} border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
        <div className="w-full sm:w-auto">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium`}>Meus Contratos</h2>
          <p className={`text-gray-500 ${isMobile ? 'text-sm' : ''}`}>
            Visualize e gerencie todos os seus contratos
          </p>
        </div>
        <Link to="/dashboard/criar-contrato" className="w-full sm:w-auto">
          <Button className={`bg-brand-400 hover:bg-brand-500 w-full sm:w-auto ${isMobile ? 'text-sm h-9' : ''}`}>
            Novo Contrato
          </Button>
        </Link>
      </div>

      <div className={isMobile ? 'p-3' : 'p-4 lg:p-6'}>
        {isLoading ? (
          isMobile ? (
            // Mobile loading skeleton
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 space-y-2 w-full"
                >
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(4)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-[200px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[140px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-[80px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : contracts.length > 0 ? (
          isMobile ? (
            // Mobile contracts list - optimized for small screens
            <div className="space-y-3 max-w-full overflow-hidden">
              {contracts.map((contract) => (
                <ContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {contract.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        {contract.type}
                        {isPremiumRestricted(contract.type) && (
                          <span className="ml-2 text-xs text-amber-500 font-medium">
                            (Premium)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{contract.client_name || "-"}</TableCell>
                      <TableCell>{formatDate(contract.created_at)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusDisplay(contract.status).classes}`}
                        >
                          {getStatusDisplay(contract.status).label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {contract.status === "signed" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                console.log(contract);
                                const filePath =
                                  contract.client_signed_file_path ||
                                  contract.signed_file_path;
                                if (!filePath) {
                                  toast({
                                    title: "Erro ao baixar",
                                    description:
                                      "Arquivo assinado não encontrado",
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                const { data, error } = await supabase.storage
                                  .from("signed-contracts")
                                  .download(filePath);

                                if (data) {
                                  const url = URL.createObjectURL(data);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `contrato-${contract.id}-assinado.pdf`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                } else if (error) {
                                  toast({
                                    title: "Erro ao baixar",
                                    description:
                                      "Não foi possível baixar o arquivo assinado",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              title="Baixar contrato assinado"
                              className="text-green-600"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewContract(contract.id)}
                              title="Visualizar contrato"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className={`text-center ${isMobile ? 'py-6' : 'py-8 lg:py-12'}`}>
            <FileText className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-gray-300 mx-auto mb-4`} />
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-900 mb-1`}>
              Nenhum contrato encontrado
            </h3>
            <p className={`text-gray-500 mb-4 ${isMobile ? 'text-sm px-4' : ''}`}>
              Você ainda não possui contratos criados.
            </p>
            <Link to="/dashboard/criar-contrato">
              <Button className={`bg-brand-400 hover:bg-brand-500 ${isMobile ? 'text-sm h-9 mx-4' : ''}`}>
                Criar meu primeiro contrato
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsList;
