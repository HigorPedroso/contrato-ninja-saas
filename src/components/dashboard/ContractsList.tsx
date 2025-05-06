
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

const contracts = [
  {
    id: 1,
    name: "Contrato de Prestação de Serviços - Desenvolvimento Web",
    type: "Prestação de Serviços",
    client: "Empresa ABC Ltda",
    created: "10/05/2025",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Contrato de Confidencialidade - Projeto XYZ",
    type: "Confidencialidade",
    client: "Startup Inovação S.A.",
    created: "28/04/2025",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Contrato de Consultoria - Análise de Marketing Digital",
    type: "Prestação de Serviços",
    client: "Loja Virtual Ltda",
    created: "15/04/2025",
    status: "Finalizado",
  },
  {
    id: 4,
    name: "Contrato de Design Gráfico - Identidade Visual",
    type: "Freelancer",
    client: "Restaurante Sabor ME",
    created: "02/04/2025",
    status: "Ativo",
  },
];

const ContractsList = () => {
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
                      {contract.name}
                    </span>
                  </TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell>{contract.client}</TableCell>
                  <TableCell>{contract.created}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        contract.status === "Ativo"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contract.status}
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
        </div>
      </div>
    </div>
  );
};

export default ContractsList;
