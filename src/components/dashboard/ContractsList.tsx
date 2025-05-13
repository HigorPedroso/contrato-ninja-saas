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
import { Link } from "react-router-dom";
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

// Add this import at the top with other imports
import { SHA256 } from "crypto-js";

// Add new imports
import { PenLine, ExternalLink, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Resend } from "resend";
import { ContractStatus, Contract } from "@/types/contract";

const ContractsList = () => {
  const { trackActivity } = useActivity();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [signatureDialog, setSignatureDialog] = useState(false);
  const { isSubscribed } = useAuth();

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

  const downloadContract = async (contractId: string) => {
    try {
      const contractData = await fetchContractById(contractId);
      if (!contractData) return;

      console.log("Contract data for download:", contractData);

      // Case 1: Contract with both signatures (client and user)
      if (
        contractData.status === "signed" &&
        contractData.client_signed_file_path
      ) {
        const { data: finalFile, error: finalError } = await supabase.storage
          .from("signed-contracts")
          .download(contractData.client_signed_file_path);

        if (finalFile && !finalError) {
          const url = URL.createObjectURL(finalFile);
          const a = document.createElement("a");
          a.href = url;
          a.download = `contrato-${contractData.id}-assinado-final.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          await trackActivity("download", contractId, contractData.title);
          return;
        }
      }

      // Case 2: Contract with one signature (user only)
      if (contractData.signed_file_path) {
        const { data: userSignedFile, error: userError } =
          await supabase.storage
            .from("signed-contracts")
            .download(contractData.signed_file_path);

        if (userSignedFile && !userError) {
          const url = URL.createObjectURL(userSignedFile);
          const a = document.createElement("a");
          a.href = url;
          a.download = `contrato-${contractData.id}-parcialmente-assinado.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          await trackActivity("download", contractId, contractData.title);
          return;
        }
      }

      // Case 3: Contract with no signatures (generate PDF from content)
      const doc = new jsPDF();

      // Configure PDF settings
      doc.setFont("helvetica");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = 20;

      // Add contract title
      doc.setFontSize(16);
      doc.text(contractData.title, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += lineHeight * 2;

      // Add client information if available
      doc.setFontSize(12);
      if (contractData.client_name) {
        doc.text(`Cliente: ${contractData.client_name}`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (contractData.client_email) {
        doc.text(`Email: ${contractData.client_email}`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (contractData.client_cpf) {
        doc.text(`CPF: ${contractData.client_cpf}`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (contractData.client_address) {
        doc.text(`Endereço: ${contractData.client_address}`, margin, yPosition);
        yPosition += lineHeight;
      }
      doc.text(
        `Data: ${formatDate(contractData.created_at)}`,
        margin,
        yPosition
      );
      yPosition += lineHeight * 2;

      // Process HTML content
      const tempDiv = document.createElement("div");
      // Replace undefined values with placeholders or empty strings
      const processedContent = contractData.content
        .replace(
          "undefined, inscrito(a)",
          `${contractData.client_name || "[Nome do Designer]"}, inscrito(a)`
        )
        .replace("nº undefined", `nº ${contractData.client_cpf || "[CPF]"}`)
        .replace(
          "em undefined",
          `em ${contractData.client_address || "[Endereço]"}`
        );

      tempDiv.innerHTML = processedContent;

      // Convert HTML to formatted text
      doc.setFontSize(11);
      const processNode = (node: Node, indent = 0) => {
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
              const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
              lines.forEach((line) => {
                if (yPosition > doc.internal.pageSize.getHeight() - margin) {
                  doc.addPage();
                  yPosition = margin;
                }
                doc.text(line, margin + indent, yPosition);
                yPosition += lineHeight;
              });
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const element = child as HTMLElement;
            if (element.tagName === "STRONG" || element.tagName === "B") {
              doc.setFont("helvetica", "bold");
              processNode(child, indent);
              doc.setFont("helvetica", "normal");
            } else if (element.tagName === "BR" || element.tagName === "P") {
              yPosition += lineHeight;
            } else {
              processNode(child, indent);
            }
          }
        });
      };

      processNode(tempDiv);

      // Save the PDF
      doc.save(`contrato-${contractData.id}.pdf`);
      await trackActivity("download", contractId, contractData.title);

      toast({
        title: "Download concluído",
        description: "O contrato foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao baixar contrato",
        description: "Não foi possível gerar o PDF do contrato.",
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

  // Update signature dialog to handle LibreSign
  const handleSignatureRequest = async (contract: Contract) => {
    try {
      // Generate document hash
      const documentHash = SHA256(contract.content).toString();

      // Initialize signature request
      const signatureUrl = await initializeSignature({
        contractId: contract.id,
        documentHash,
        signerEmail,
        contractTitle: contract.title,
        callbackUrl: `${window.location.origin}/api/signature-callback`,
      });

      // Update contract status
      await handleStatusUpdate(contract.id, "active");

      toast({
        title: "Solicitação de assinatura enviada",
        description:
          "Um email será enviado para o signatário com as instruções.",
      });

      setSignatureDialog(false);
    } catch (error) {
      console.error("Error requesting signature:", error);
      toast({
        title: "Erro na solicitação",
        description: "Não foi possível iniciar o processo de assinatura.",
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
    status: 'signed', // Change to signed when client uploads
    client_signed_file_path: data.path, // Changed from signed_file_path
    client_signed_at: new Date().toISOString(), // Add signed timestamp
    signer_ip: signerIp,
    client_email: clientEmail
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Meus Contratos</h2>
          <p className="text-gray-500">
            Visualize e gerencie todos os seus contratos
          </p>
        </div>
        <Link to="/dashboard/criar-contrato">
          <Button className="bg-brand-400 hover:bg-brand-500">
            Novo Contrato
          </Button>
        </Link>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          {isLoading ? (
            <Table>
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
          ) : contracts.length > 0 ? (
            <Table>
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
                              console.log(contract)
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
                          <>
                            {canAddSignature(contract) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openSignatureDialog(contract)}
                                title="Assinar contrato"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewContract(contract.id)}
                              title="Visualizar contrato"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadContract(contract.id)}
                              title="Baixar contrato"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewContract(contract.id)}
                          title="Visualizar contrato"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadContract(contract.id)}
                          title="Baixar contrato"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {/* Status update dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Atualizar status"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(contract.id, "active")}
                              className="text-green-600"
                              disabled={contract.status === "active"}
                            >
                              <Check className="h-4 w-4 mr-2" /> Marcar como Ativo
                            </DropdownMenuItem> */}
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(contract.id, "draft")
                              }
                              className="text-yellow-600"
                              disabled={contract.status === "draft"}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Marcar como
                              Rascunho
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(contract.id, "expired")
                              }
                              className="text-gray-600"
                              disabled={contract.status === "expired"}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" /> Marcar
                              como Expirado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(contract.id, "canceled")
                              }
                              className="text-red-600"
                              disabled={contract.status === "canceled"}
                            >
                              <X className="h-4 w-4 mr-2" /> Marcar como
                              Cancelado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {canAddSignature(contract) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 text-xs"
                            onClick={() => openSignatureDialog(contract)}
                          >
                            Assinar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Nenhum contrato encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Você ainda não possui contratos criados.
              </p>
              <Link to="/dashboard/criar-contrato">
                <Button className="bg-brand-400 hover:bg-brand-500">
                  Criar meu primeiro contrato
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para visualizar o contrato */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContract?.title}</DialogTitle>
          </DialogHeader>

          {selectedContract && (
            <div className="mt-4">
              {selectedContract.client_name && (
                <p className="mb-2">
                  <strong>Cliente:</strong> {selectedContract.client_name}
                </p>
              )}
              {selectedContract.client_email && (
                <p className="mb-2">
                  <strong>Email:</strong> {selectedContract.client_email}
                </p>
              )}
              <p className="mb-4">
                <strong>Data:</strong> {formatDate(selectedContract.created_at)}
              </p>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Use parse to render HTML content properly */}
                <div className="whitespace-pre-line">
                  {parse(formatContent(selectedContract.content))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => downloadContract(selectedContract.id)}
                  className="bg-brand-400 hover:bg-brand-500"
                >
                  <Download className="h-4 w-4 mr-2" /> Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={signatureDialog} onOpenChange={handleSignatureDialogChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assinatura via Gov.br</DialogTitle>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded border border-amber-200">
                <p className="text-amber-800 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Sua conta Gov.br precisa estar no nível Prata(Gratuito) ou
                  Ouro(Gratuito) para assinatura digital válida
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Passos para assinatura:</h4>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <span>
                      Baixe o contrato em PDF clicando no botão abaixo
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <span>Acesse o portal de assinaturas do Gov.br</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <span>
                      Faça upload do PDF e assine com sua conta Gov.br
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      4
                    </span>
                    <span>
                      Faça upload do PDF assinado de volta à plataforma
                    </span>
                  </li>
                </ol>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadContract(selectedContract.id)}
                  >
                    <Download className="h-4 w-4 mr-2" /> Baixar Contrato
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        "https://assinador.iti.br/assinatura/index.xhtml",
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> Acessar Gov.br
                  </Button>
                </div>

                <div className="border-t pt-4 mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Email do Cliente
                  </label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={handleEmailChange}
                    placeholder="cliente@email.com"
                    className="mb-4"
                  />
                  <label className="block text-sm font-medium mb-2">
                    Upload do Contrato Assinado
                  </label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="mb-2"
                  />
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-brand-400 h-2.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Faça upload do PDF após assiná-lo no Gov.br
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSignatureDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGovBrSignature}
                  disabled={!signedFile || !isValidEmail || !hasValidSignature}
                  className="bg-brand-400 hover:bg-brand-500"
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Confirmar Assinatura Gov.br
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractsList;
