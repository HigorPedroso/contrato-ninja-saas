import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './cors.ts';

const SIGNATURE_MARKERS = [
  '/Type /Sig',
  '/SubFilter',
  '/ByteRange',
  '/Contents',
  '/Filter /Adobe.PPKMS',
  'PKCS#7',
  'adbe.pkcs7.detached',
  'ICP-Brasil'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No PDF file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Convert to string but preserve binary data
    const pdfContent = new TextDecoder('latin1').decode(buffer);
    
    // Search for signature markers
    const foundMarkers = SIGNATURE_MARKERS.filter(marker => 
      pdfContent.includes(marker)
    );

    // Consider it signed if we find at least 2 signature markers
    const isSigned = foundMarkers.length >= 2;

    return new Response(
      JSON.stringify({
        signed: isSigned,
        foundMarkers
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});