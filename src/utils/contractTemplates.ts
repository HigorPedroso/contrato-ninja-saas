interface ContractValues {
  // Freelancer Contract
  contractorName?: string;
  contractorDocument?: string;
  contractorAddress?: string;
  freelancerName?: string;
  freelancerCpf?: string;
  freelancerAddress?: string;
  serviceDescription?: string;

  // Design Contract
  designerName?: string;
  designerDocument?: string;
  designerAddress?: string;
  designType?: string;

  // Consulting Contract
  companyName?: string;
  companyCnpj?: string;
  companyAddress?: string;
  consultantName?: string;
  consultantDocument?: string;
  consultantAddress?: string;
  consultingArea?: string;
  consultingObjective?: string;
  contractDuration?: string;

  // Common fields
  startDate?: string;
  deliveryDate?: string;
  amount?: string;
  paymentMethod?: string;
  meetingFrequency?: string;
  reportDeliveryMethod?: string;
  legalRepresentativeName?: string;
  legalRepresentativeCpf?: string;
  additionalClauses?: string;
}

export const generateFreelancerContract = (values) => {
    const today = new Date().toLocaleDateString("pt-BR");

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FREELANCER

Pelo presente instrumento particular, as partes abaixo identificadas:

<strong>CONTRATANTE:</strong> ${
      values.contractorName
    }, inscrito(a) no CPF/CNPJ sob o nº ${
      values.contractorDocument
    }, com endereço em ${values.contractorAddress};

<strong>CONTRATADO:</strong> ${
      values.freelancerName
    }, inscrito(a) no CPF sob o nº ${values.freelancerCpf}, residente em ${
      values.freelancerAddress
    };

Têm entre si justo e contratado o seguinte:

<strong>CLÁUSULA 1ª – DO OBJETO</strong>
O presente contrato tem como objeto a prestação de serviços de natureza freelancer, especificamente: ${
      values.serviceDescription
    }, conforme as necessidades e diretrizes definidas pela CONTRATANTE.
<br>
<strong>CLÁUSULA 2ª – DAS OBRIGAÇÕES DO CONTRATADO</strong>
O CONTRATADO se obriga a prestar os serviços com zelo, diligência, pontualidade e qualidade técnica, atendendo aos prazos estabelecidos e às orientações fornecidas pela CONTRATANTE.
<br>
<strong>CLÁUSULA 3ª – DAS OBRIGAÇÕES DO CONTRATANTE</strong>
A CONTRATANTE se compromete a fornecer as informações, materiais e recursos necessários para a execução dos serviços, bem como realizar o pagamento nos prazos acordados.
<br>
<strong>CLÁUSULA 4ª – DO PRAZO</strong>
Este contrato entra em vigor na data de sua assinatura e terá validade de ${
      values.startDate
    } até ${
      values.deliveryDate
    }, podendo ser prorrogado por mútuo acordo entre as partes.
<br>
<strong>CLÁUSULA 5ª – DO PAGAMENTO</strong>
A CONTRATANTE pagará ao CONTRATADO o valor de R$ ${values.amount}, em ${
      values.paymentMethod
    }. Eventuais despesas extras devem ser previamente autorizadas pela CONTRATANTE.
<br>
<strong>CLÁUSULA 6ª – DA CONFIDENCIALIDADE</strong>
Ambas as partes se comprometem a manter sigilo sobre todas as informações trocadas em razão deste contrato, não podendo divulgá-las a terceiros sem autorização expressa.
<br>
<strong>CLÁUSULA 7ª – DA RESCISÃO</strong>
O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 dias, ou de forma imediata em caso de descumprimento de cláusulas contratuais.
<br>
<strong>CLÁUSULA 8ª – DO FORO</strong>
Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da comarca de São Paulo/SP, renunciando a qualquer outro, por mais privilegiado que seja.

${
  values.additionalClauses
    ? `>strong>CLÁUSULA 9ª – DISPOSIÇÕES ADICIONAIS</strong>\n${values.additionalClauses}\n\n`
    : ""
}
E, por estarem assim justos e contratados, firmam o presente instrumento digitalmente.

${today}
<br>
<strong>CONTRATANTE:</strong> ___________________________
<strong>CONTRATADO:</strong> ___________________________`;
  };

export const generateDesignContract = (values) => {
    const today = new Date().toLocaleDateString("pt-BR");

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGNER GRÁFICO
  
Pelo presente instrumento particular, as partes identificadas a seguir:
  
  <strong>CONTRATANTE:</strong> ${
    values.companyName
  }, inscrito(a) no CPF/CNPJ sob o nº ${
      values.companyCnpj
    }, com sede ou residência em ${values.companyAddress};
  
  <strong>CONTRATADO (DESIGNER):</strong> ${
    values.designerName
  }, inscrito(a) no CPF sob o nº ${values.designerDocument}, residente em ${
      values.designerAddress
    };
  
Têm entre si justo e contratado o que segue:
  
  <br>
  
  <strong>CLÁUSULA 1ª – DO OBJETO</strong>
  O presente contrato tem como objeto a prestação de serviços de design gráfico, consistindo na criação de ${
    values.designType
  }, conforme briefing e orientações fornecidas pela CONTRATANTE.
  
  <br>
  
  <strong>CLÁUSULA 2ª – DA ENTREGA E FORMATO</strong>
  O CONTRATADO compromete-se a entregar os materiais em formato digital, nos padrões previamente combinados (ex: .PNG, .JPG, .AI, .PSD, .PDF), dentro do prazo estipulado. Caso haja necessidade de impressão, as especificações deverão ser detalhadas pela CONTRATANTE com antecedência.
  
  <br>
  
  <strong>CLÁUSULA 3ª – DAS OBRIGAÇÕES DO CONTRATADO</strong>
  O CONTRATADO compromete-se a:
  <br>
  Executar os serviços com qualidade técnica e criatividade, respeitando prazos acordados;
  Submeter o material para aprovação da CONTRATANTE antes da entrega final;
  Corrigir eventuais ajustes solicitados dentro do escopo original;
  Não reutilizar ou revender os materiais criados para terceiros, salvo acordo prévio.
  
  <br>
  
  <strong>CLÁUSULA 4ª – DAS OBRIGAÇÕES DA CONTRATANTE</strong>
  Cabe à CONTRATANTE:
  <br>
  Fornecer briefing claro, materiais de referência e todas as informações necessárias para o desenvolvimento do projeto;
  Responder às solicitações de aprovação e feedbacks dentro de prazo razoável;
  Realizar os pagamentos conforme acordado neste contrato.
  
  <br>
  
  <strong>CLÁUSULA 5ª – DO PAGAMENTO</strong>
  O valor acordado pelos serviços prestados é de R$ ${
    values.amount
  }, a ser pago em ${
      values.paymentMethod
    }. O não cumprimento do pagamento poderá implicar em suspensão dos serviços.
  
  <br>
  
  <strong>CLÁUSULA 6ª – DO PRAZO</strong>
  Os serviços contratados terão início em ${
    values.startDate
  } e prazo de conclusão estimado em ${
      values.deliveryDate
    }, podendo ser ajustado mediante acordo entre as partes.
  
  <br>
  
  <strong>CLÁUSULA 7ª – DA PROPRIEDADE INTELECTUAL</strong>
  Após a entrega final e o pagamento integral, os direitos sobre o material criado serão cedidos à CONTRATANTE, que poderá utilizá-los livremente. O CONTRATADO se reserva o direito de exibir os trabalhos no portfólio pessoal, salvo acordo em contrário.
  
  <br>
  
  <strong>CLÁUSULA 8ª – DA CONFIDENCIALIDADE</strong>
  Ambas as partes comprometem-se a manter confidenciais todas as informações trocadas durante a execução do projeto, sob pena de responsabilidade legal.
  
  <br>
  
  <strong>CLÁUSULA 9ª – DA RESCISÃO</strong>
  Este contrato poderá ser rescindido a qualquer momento por mútuo acordo, ou unilateralmente em caso de descumprimento de cláusulas, mediante notificação prévia com prazo de 30 dias. Em caso de rescisão após início dos trabalhos, o CONTRATADO poderá reter percentual proporcional ao trabalho executado.
  
  <br>
  
  <strong>CLÁUSULA 10ª – DO FORO</strong>
  Fica eleito o foro da comarca de São Paulo/SP, com renúncia de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer controvérsias decorrentes deste contrato.
  
  ${
    values.additionalClauses
      ? `<br><br><strong>CLÁUSULA 11ª – DISPOSIÇÕES ADICIONAIS</strong><br>${values.additionalClauses}`
      : ""
  }
  
  <br>
  
  E, por estarem de pleno acordo, firmam o presente instrumento digitalmente.
  
  <br>
  
  São Paulo, ${today}.
  
  <br>
  
  <strong>CONTRATANTE:</strong> ___________________________
  <strong>CONTRATADO (DESIGNER):</strong> ___________________________`;
  };

export const generateConsultingContract = (values) => {
    const today = new Date().toLocaleDateString("pt-BR");

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CONSULTORIA EMPRESARIAL
  
  Pelo presente instrumento particular, as partes abaixo identificadas:
  
  <strong>CONTRATANTE:</strong> ${
    values.companyName
  }, pessoa jurídica inscrita no CNPJ sob o nº ${
      values.companyCnpj
    }, com sede em ${values.companyAddress}, neste ato representada por ${
      values.legalRepresentativeName
    }, CPF ${values.legalRepresentativeCpf};
  
  <strong>CONTRATADO (CONSULTOR):</strong> ${
    values.consultantName
  }, inscrito(a) no CPF/CNPJ sob o nº ${
      values.consultantDocument
    }, com endereço em ${values.consultantAddress};
  
  Têm entre si justo e contratado o que segue:
  <br>
  <strong>CLÁUSULA 1ª – DO OBJETO</strong>
  O presente contrato tem como objeto a prestação de serviços de consultoria empresarial na área de ${
    values.consultingArea
  }, com o seguinte objetivo: ${values.consultingObjective}.
  <br>
  <strong>CLÁUSULA 2ª – DO PRAZO</strong>
  O presente contrato terá duração de ${
    values.contractDuration
  } meses, iniciando-se em ${
      values.startDate
    }, podendo ser prorrogado mediante acordo entre as partes.
  <br>
  <strong>CLÁUSULA 3ª – DAS OBRIGAÇÕES DO CONTRATADO</strong>
  O CONTRATADO se compromete a:
  - Prestar os serviços de consultoria com zelo e dedicação;
  - Realizar reuniões ${values.meetingFrequency} com a CONTRATANTE;
  - Entregar relatórios na forma de ${values.reportDeliveryMethod};
  - Manter sigilo sobre todas as informações obtidas durante a prestação dos serviços.
  <br>
  <strong>CLÁUSULA 4ª – DAS OBRIGAÇÕES DA CONTRATANTE</strong>
  A CONTRATANTE se compromete a:
  - Fornecer todas as informações necessárias para a execução dos serviços;
  - Realizar os pagamentos conforme acordado;
  - Disponibilizar acesso às instalações e documentos necessários.
  <br>
  <strong>CLÁUSULA 5ª – DO VALOR E FORMA DE PAGAMENTO</strong>
  Pelos serviços prestados, a CONTRATANTE pagará ao CONTRATADO o valor total de R$ ${
    values.amount
  }, a ser pago da seguinte forma: ${values.paymentMethod}.
  <br>
  <strong>CLÁUSULA 6ª – DA CONFIDENCIALIDADE</strong>
  As partes se comprometem a manter absoluto sigilo sobre quaisquer dados, materiais, documentos, especificações técnicas e comerciais do qual venham a ter conhecimento em virtude deste contrato, não podendo, sob qualquer pretexto, divulgar, revelar, reproduzir ou utilizar em benefício próprio ou de terceiros, sob pena de responder por perdas e danos.
  <br>
  <strong>CLÁUSULA 7ª – DA RESCISÃO</strong>
  O presente contrato poderá ser rescindido por qualquer das partes mediante notificação prévia de 30 dias, ou imediatamente em caso de descumprimento de qualquer cláusula.
  <br>
  <strong>CLÁUSULA 8ª – DO FORO</strong>
  Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas deste contrato.
  
  ${
    values.additionalClauses
      ? `<br><br><strong>CLÁUSULA 9ª – DISPOSIÇÕES ADICIONAIS</strong><br>${values.additionalClauses}`
      : ""
  }
  
  <br><br>
  E, por estarem assim justas e contratadas, as partes firmam o presente instrumento.
  <br><br>
  São Paulo, ${today}
  <br><br>
  <strong>CONTRATANTE:</strong> ___________________________
  <strong>CONSULTOR:</strong> ___________________________`;
  };