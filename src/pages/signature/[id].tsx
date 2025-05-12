import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SignaturePage() {
  const { id } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Move state declaration to top

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Contrato não encontrado",
        variant: "destructive",
      });
      return;
    }

    setContract(data);
  };

  // Loading state check
  if (!contract) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Already signed check
  if (contract?.client_signed_at) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-green-50 p-6 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Contrato Já Assinado</h1>
          <p className="text-green-600">
            Este contrato já foi assinado e enviado em{' '}
            {new Date(contract.client_signed_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    );
  }

  // Success state check
  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-green-50 p-6 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Contrato Enviado com Sucesso!</h1>
          <p className="text-green-600 mb-4">
            O contrato foi assinado e enviado com sucesso.
          </p>
          <p className="text-sm text-green-500">
            Você pode fechar esta página agora.
          </p>
        </div>
      </div>
    );
  }

  // Main form render
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Upload do Contrato Assinado</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl mb-4">{contract.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Selecione o PDF assinado via Gov.br
            </label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
          <Button
            type="submit"
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? "Enviando..." : "Enviar Contrato Assinado"}
          </Button>
        </form>
      </div>
    </div>
  );
}