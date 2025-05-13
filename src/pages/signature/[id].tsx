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

  // Add check for already signed contract
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

  // Add signature verification function
  const verifyPdfSignatures = async (file: File): Promise<{ valid: boolean; count: number }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch(
        'https://vqhmhsmufgcoiajgxzmm.supabase.co/functions/v1/verify-signature',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: formData
        }
      );
  
      const data = await response.json();
      console.log('Raw signature data:', data);
      
      // Updated signature count calculation
      const uniqueSignatures = new Set(data.foundMarkers?.map((marker: string) => {
        const match = marker.match(/Assinatura\s+(\d+)/i);
        return match ? match[1] : marker;
      }));
  
      const signatureCount = uniqueSignatures.size;
      console.log('Found unique signatures:', uniqueSignatures);
      console.log('Total signature count:', signatureCount);
  
      return {
        valid: data.signed,
        count: signatureCount
      };
    } catch (error) {
      console.error('Error verifying signatures:', error);
      return { valid: false, count: 0 };
    }
  };
  
  // Update handleFileUpload with more detailed feedback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const { valid, count } = await verifyPdfSignatures(file);
      
      console.log('Signature validation:', { valid, count });
  
      if (!valid) {
        toast({
          title: "PDF não assinado",
          description: "Nenhuma assinatura digital válida foi encontrada no documento.",
          variant: "destructive",
        });
        setFile(null);
        return;
      }
  
      if (count < 2) {
        toast({
          title: "Assinaturas insuficientes",
          description: `Encontradas ${count} assinatura(s). O PDF deve conter duas assinaturas digitais válidas.`,
          variant: "destructive",
        });
        setFile(null);
        return;
      }
  
      setFile(file);
      toast({
        title: "PDF válido",
        description: `Encontradas 2 assinaturas digitais válidas.`,
      });
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  // Add new state for submission success
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Update handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !contract) return;
  
    try {
      setUploading(true);
      const fileName = `${contract.id}_client_signed_${Date.now()}.pdf`;
  
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('signed-contracts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
  
      if (error) throw error;
  
      // Update contract status
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          status: 'signed',
          client_signed_file_path: data.path,
          client_signed_at: new Date().toISOString(),
        })
        .eq('id', contract.id);
  
      if (updateError) throw updateError;
  
      setIsSubmitted(true); // Set submission success
      toast({
        title: "Sucesso",
        description: "Contrato assinado enviado com sucesso!",
      });
    } catch (error) {
      console.error('Error uploading signed contract:', error);
      toast({
        title: "Erro no envio",
        description: "Não foi possível enviar o contrato assinado.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  // Add success page condition
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

  if (!contract) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

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