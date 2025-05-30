import { toast } from "@/hooks/use-toast";
import { useActivity } from "@/hooks/useActivity";
import { fetchContractById } from "./contracts";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { formatDate } from "date-fns";

export const downloadContract = async (contractId: string) => {

    const { trackActivity } = useActivity();

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