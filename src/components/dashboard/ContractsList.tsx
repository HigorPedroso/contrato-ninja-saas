
import { useEffect, useState } from "react";
import { FileText, Download, Eye, Edit, Check, AlertTriangle, X } from "lucide-react";
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
import { fetchUserContracts, fetchContractById, updateContractStatus, Contract } from "@/services/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

const ContractsList = () => {
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
    let formattedContent = content.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    
    // Return formatted content ready to be parsed
    return formattedContent;
  };

  const viewContract = async (contractId: string) => {
    try {
      const contractData = await fetchContractById(contractId);
      if (contractData) {
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
      if (contractData) {
        const doc = new jsPDF();
        
        // Configure PDF settings
        doc.setFont("helvetica");
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const lineHeight = 7;
        let yPosition = 20;
        
        // Add contract title
        doc.setFontSize(16);
        doc.text(contractData.title, pageWidth / 2, yPosition, { align: "center" });
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
        doc.text(`Data: ${formatDate(contractData.created_at)}`, margin, yPosition);
        yPosition += lineHeight * 2;

        // Process HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contractData.content;
        
        // Convert HTML to formatted text
        doc.setFontSize(11);
        const processNode = (node: Node, indent = 0) => {
          Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent?.trim();
              if (text) {
                const lines = doc.splitTextToSize(text, pageWidth - (2 * margin));
                lines.forEach(line => {
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
              if (element.tagName === 'STRONG' || element.tagName === 'B') {
                doc.setFont("helvetica", "bold");
                processNode(child, indent);
                doc.setFont("helvetica", "normal");
              } else if (element.tagName === 'BR' || element.tagName === 'P') {
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
        
        toast({
          title: "Download concluído",
          description: "O contrato foi baixado com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao baixar contrato",
        description: "Não foi possível gerar o PDF do contrato.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (contractId: string, newStatus: 'draft' | 'active' | 'expired' | 'canceled') => {
    const success = await updateContractStatus(contractId, newStatus);
    if (success) {
      // Update the local state to reflect the change
      setContracts(contracts.map(contract => 
        contract.id === contractId ? {...contract, status: newStatus} : contract
      ));
    }
  };

  // Function to open signature dialog for a contract
  const openSignatureDialog = (contract: any) => {
    setSelectedContract(contract);
    setSignatureDialog(true);
  };

  // Check if contract type allows signature option
  const canAddSignature = (contract: Contract) => {
    const allowedTypes = ['Freelancer', 'Design', 'Consultoria'];
    return allowedTypes.includes(contract.type);
  };

  // Function to check if the contract type is restricted to premium users
  const isPremiumRestricted = (contractType: string) => {
    return contractType === 'Consultoria Empresarial' && !isSubscribed;
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
                    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[140px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
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
                        <span className="ml-2 text-xs text-amber-500 font-medium">(Premium)</span>
                      )}
                    </TableCell>
                    <TableCell>{contract.client_name || "-"}</TableCell>
                    <TableCell>{formatDate(contract.created_at)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          contract.status === "active"
                            ? "bg-green-100 text-green-800"
                            : contract.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : contract.status === "expired"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {contract.status === "active" ? "Ativo" :
                         contract.status === "draft" ? "Rascunho" :
                         contract.status === "expired" ? "Expirado" :
                         "Cancelado"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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
                            <Button variant="ghost" size="icon" title="Atualizar status">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(contract.id, "active")}
                              className="text-green-600"
                              disabled={contract.status === "active"}
                            >
                              <Check className="h-4 w-4 mr-2" /> Marcar como Ativo
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(contract.id, "draft")}
                              className="text-yellow-600"
                              disabled={contract.status === "draft"}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Marcar como Rascunho
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(contract.id, "expired")}
                              className="text-gray-600"
                              disabled={contract.status === "expired"}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" /> Marcar como Expirado
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(contract.id, "canceled")}
                              className="text-red-600"
                              disabled={contract.status === "canceled"}
                            >
                              <X className="h-4 w-4 mr-2" /> Marcar como Cancelado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {/* Show signature option for freelancer and design contracts */}
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
                <p className="mb-2"><strong>Cliente:</strong> {selectedContract.client_name}</p>
              )}
              {selectedContract.client_email && (
                <p className="mb-2"><strong>Email:</strong> {selectedContract.client_email}</p>
              )}
              <p className="mb-4"><strong>Data:</strong> {formatDate(selectedContract.created_at)}</p>
              
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
      
      {/* Dialog para assinatura do contrato */}
      <Dialog open={signatureDialog} onOpenChange={setSignatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assinatura de Contrato</DialogTitle>
          </DialogHeader>
          
          {selectedContract && (
            <div className="space-y-4">
              <p>Você está prestes a assinar o contrato <strong>{selectedContract.title}</strong>.</p>
              
              <div className="p-4 bg-amber-50 rounded border border-amber-200">
                <p className="text-amber-800 text-sm">
                  Ao assinar este contrato, você concorda com todos os termos e condições estabelecidos neste documento.
                </p>
              </div>
              
              {/* Placeholder for signature field - would need a signature component in a real app */}
              <div className="border-2 border-dashed border-gray-300 rounded-md h-32 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Digite seu nome completo para assinar</p>
              </div>
              
              <Input 
                placeholder="Seu nome completo" 
                className="w-full"
              />
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSignatureDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-brand-400 hover:bg-brand-500"
                  onClick={() => {
                    toast({
                      title: "Contrato assinado",
                      description: "O contrato foi assinado com sucesso."
                    });
                    setSignatureDialog(false);
                    handleStatusUpdate(selectedContract.id, "active");
                  }}
                >
                  Assinar Contrato
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
