import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, FileText, Puzzle, Clock, Crown, Lock, HandshakeIcon, Mail } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      icon: <HelpCircle className="h-5 w-5 text-brand-400" />,
      question: "O que é o Contrato Flash?",
      answer: "O Contrato Flash é uma plataforma online que permite gerar contratos jurídicos personalizados de forma rápida, prática e segura. Ideal para freelancers, designers, consultores e profissionais autônomos, nosso sistema facilita a criação de contratos prontos para serem enviados e assinados digitalmente — sem complicação, sem advogados e sem dor de cabeça."
    },
    {
      icon: <FileText className="h-5 w-5 text-brand-400" />,
      question: "Os contratos gerados são válidos juridicamente?",
      answer: "Sim! Todos os contratos gerados pelo Contrato Flash seguem os princípios legais do Código Civil Brasileiro e podem ser usados formalmente como documentos válidos em negociações, acordos e até em processos judiciais, caso necessário. Além disso, você pode utilizar ferramentas de assinatura digital com validade jurídica para reforçar ainda mais a segurança."
    },
    {
      icon: <Puzzle className="h-5 w-5 text-brand-400" />,
      question: "Posso personalizar o contrato de acordo com meu serviço?",
      answer: "Sim! Nossa plataforma permite que você escolha o tipo de serviço (freela, design, consultoria etc.), personalize cláusulas como escopo, prazos, valores, multas e condições específicas. Tudo isso de forma guiada, para que você não precise escrever do zero nem entender termos técnicos."
    },
    {
      icon: <Clock className="h-5 w-5 text-brand-400" />,
      question: "Em quanto tempo consigo gerar um contrato?",
      answer: "Você consegue gerar um contrato completo em menos de 2 minutos. Basta preencher os campos com as informações do seu projeto e pronto — o documento estará pronto para download ou envio digital."
    },
    {
      icon: <Crown className="h-5 w-5 text-brand-400" />,
      question: "Tem versão gratuita?",
      answer: "Oferecemos uma versão gratuita limitada, ideal para quem quer testar a ferramenta ou fechar contratos simples. Para acesso completo aos modelos premium, personalizações avançadas e suporte jurídico, você pode optar por um dos nossos planos pagos."
    },
    {
      icon: <Lock className="h-5 w-5 text-brand-400" />,
      question: "Meus dados estão seguros na plataforma?",
      answer: "Totalmente! Utilizamos criptografia e servidores protegidos para garantir a segurança de todas as suas informações. Nenhum dado sensível é compartilhado ou armazenado além do necessário para funcionamento da plataforma."
    },
    {
      icon: <HandshakeIcon className="h-5 w-5 text-brand-400" />,
      question: "Posso usar o Contrato Flash com meus clientes fixos?",
      answer: "Claro! Inclusive, muitos dos nossos usuários utilizam o Contrato Flash para criar contratos recorrentes com clientes de longo prazo, com cláusulas de renovação, reajuste e confidencialidade. É uma forma prática de profissionalizar parcerias e manter tudo documentado."
    },
    {
      icon: <Mail className="h-5 w-5 text-brand-400" />,
      question: "Posso entrar em contato se tiver dúvidas?",
      answer: "Sim! Nossa equipe de suporte está pronta para te ajudar. Você pode entrar em contato pelo nosso e-mail, formulário de atendimento ou chat disponível dentro da plataforma. Queremos garantir que você tenha a melhor experiência possível."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-50 to-white py-20">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Perguntas Frequentes
              </h1>
              <p className="text-xl text-gray-600">
                Tire suas dúvidas sobre o Contrato Flash
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="bg-white rounded-lg border border-gray-100 px-6"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        {faq.icon}
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;