
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

    // Verificar se o cliente existe no Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    // Configurar cliente Supabase com a service role key para bypass de RLS
    const supabaseAdmin = createClient(
      supabaseUrl, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Se o cliente não existir no Stripe, atualizar como plano gratuito
    if (customers.data.length === 0) {
      await supabaseAdmin.from("profiles").update({
        subscription_plan: "free",
        subscription_expires_at: null,
      }).eq("id", user.id);

      return new Response(
        JSON.stringify({ 
          subscribed: false,
          subscription_tier: "free",
          subscription_end: null
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;

    // Buscar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    // Verificar se há uma assinatura ativa
    const hasActiveSubscription = subscriptions.data.length > 0;
    let subscriptionTier = "free";
    let subscriptionEnd = null;

    if (hasActiveSubscription) {
      const subscription = subscriptions.data[0];
      
      // Definir data de término da assinatura atual
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Determinar o nível da assinatura com base no preço
      subscriptionTier = "premium"; // Para simplificar, consideramos qualquer assinatura ativa como premium
    }

    // Atualizar o perfil do usuário no Supabase
    await supabaseAdmin.from("profiles").update({
      subscription_plan: hasActiveSubscription ? "premium" : "free",
      subscription_expires_at: subscriptionEnd,
      stripe_customer_id: customerId,
      stripe_subscription_id: hasActiveSubscription ? subscriptions.data[0].id : null
    }).eq("id", user.id);

    // Retornar o status da assinatura
    return new Response(
      JSON.stringify({
        subscribed: hasActiveSubscription,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd
      }),
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
