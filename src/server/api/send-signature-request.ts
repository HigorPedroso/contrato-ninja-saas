import { Router } from 'express';
import { Resend } from 'resend';

const router = Router();
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { contractId, signedFileUrl, clientEmail, signatureUrl } = req.body;

    const emailContent = `
      <h2>Solicitação de Assinatura Digital</h2>
      <p>Um contrato está aguardando sua assinatura digital via Gov.br.</p>
      
      <h3>Passos para assinar:</h3>
      <ol>
        <li>Baixe o contrato já assinado pela outra parte: <a href="${signedFileUrl}">Download do Contrato</a></li>
        <li>Acesse o portal de assinaturas do Gov.br: <a href="https://assinador.iti.br">Assinador Gov.br</a></li>
        <li>Faça login com sua conta Gov.br (necessário nível Prata ou Ouro)</li>
        <li>Upload do PDF baixado e assine digitalmente</li>
        <li>Após assinar, faça upload do documento assinado: <a href="${signatureUrl}">Upload do Contrato Assinado</a></li>
      </ol>
      
      <p><strong>Importante:</strong> Sua conta Gov.br precisa estar no nível Prata ou Ouro para que a assinatura tenha validade jurídica.</p>
    `;

    await resend.emails.send({
      from: 'Contrato Flash <noreply@seu-dominio.com>',
      to: clientEmail,
      subject: 'Solicitação de Assinatura Digital - Contrato Flash',
      html: emailContent,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending signature request email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;