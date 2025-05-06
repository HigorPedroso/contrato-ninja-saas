
import { useEffect, useState } from "react";
import { FileText, Download, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchUserContracts, Contract } from "@/services/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const ContractsList = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
                    <TableCell>{contract.type}</TableCell>
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
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
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
    </div>
  );
};

export default ContractsList;
