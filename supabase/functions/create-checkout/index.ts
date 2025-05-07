
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lidar com requisições OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Configurar Supabase client para autenticação do usuário
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Autenticar o usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Cabeçalho de autorização não fornecido");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData?.user) {
      throw new Error("Não foi possível autenticar o usuário");
    }

    const user = userData.user;

    // Configurar Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não está configurada");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Verificar se o cliente já existe no Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Criar um novo cliente no Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Determinar o preço com base na requisição
    const { priceId } = await req.json();
    const priceIdToUse = priceId === "price_premium" 
      ? Deno.env.get("STRIPE_PREMIUM_PRICE_ID") || "price_1234" // Use o preço real do Stripe
      : "price_free"; // Plano gratuito não usa o Stripe
    
    if (priceIdToUse === "price_free") {
      // Para o plano gratuito, não precisamos criar uma sessão do Stripe
      // Atualizamos diretamente o perfil do usuário
      const supabaseAdmin = createClient(
        supabaseUrl, 
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        { auth: { persistSession: false } }
      );
      
      await supabaseAdmin.from("profiles").update({
        subscription_plan: "free",
        subscription_expires_at: null,
      }).eq("id", user.id);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Plano gratuito ativado com sucesso",
          url: "/dashboard" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Criar uma sessão de checkout do Stripe
    const origin = req.headers.get("origin") || "";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceIdToUse,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard/assinatura?success=true`,
      cancel_url: `${origin}/dashboard/assinatura?canceled=true`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
