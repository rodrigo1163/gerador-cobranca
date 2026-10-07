# ADR 0001 — Fronteira da integração Pix e escolha dos provedores

- **Status:** superado pelo ADR 0002
- **Data:** 2026-10-02

## Contexto

O endpoint `POST /orders/:orderId/pix` precisa criar uma cobrança para o valor já registrado no pedido. AbacatePay e Asaas usam requisições e respostas diferentes, mas o domínio de pedidos não deve depender dos campos, credenciais ou regras de transporte de cada API. O enunciado original do desafio citava Delfinance como segundo provedor; este projeto implementou Asaas.

## Decisão e fronteira

O caso de uso `GenerateOrderPixUseCase` valida o pedido, obtém `amountInCents` do repositório e chama a porta `PaymentService` com apenas `orderId` e `amountInCents`. A porta devolve `chargeId`, `pixCopyPaste` e `qrCodeDataUrl`. Cada adaptador traduz essa entrada para sua API, valida a resposta e converte falhas conhecidas em erros da aplicação. Credenciais, cliente HTTP, criação de cliente exigida pelo Asaas e conversão de centavos para reais ficam na infraestrutura.

`PaymentsModule` escolhe a implementação injetada; atualmente é `AsaasPaymentService`. `AbacatePayPaymentService` também implementa a porta. O caso de uso grava `orderId`, `chargeId` e `provider` em `OrderChargeLink` somente depois de receber uma resposta válida. Gerar a cobrança não marca o pedido como pago: a confirmação do pagamento está fora desta decisão e não é implementada por esse fluxo.

## Alternativas consideradas

| Alternativa                                                                   | Motivo para não adotá-la agora                                                                                                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chamar as APIs diretamente no controller ou no caso de uso                    | Espalharia autenticação, formatos externos e tratamento de erros pela aplicação; trocar o provedor exigiria alterar o fluxo de pedidos.                                                          |
| Implementar Delfinance como segundo adaptador                                 | A escolha deste projeto foi Asaas Sandbox. Ela se afasta do provedor solicitado no enunciado original; cumprir esse requisito literalmente ainda exigiria um adaptador Delfinance e seus testes. |
| Escolher o provedor por pedido ou tentar outro automaticamente após uma falha | Exigiria regras de roteamento e reconciliação de cobranças. Após uma falha de rede, o primeiro provedor pode ter criado a cobrança mesmo sem resposta; alternar ou repetir pode duplicá-la.      |

## Custos e consequências

- Cada provedor exige manutenção de um adaptador, credenciais e testes de contrato próprios. No Asaas, a criação de cliente e a busca do QR Code acrescentam chamadas externas à criação da cobrança.
- A seleção é global no `PaymentsModule`; mudar de gateway exige alterar a configuração de injeção e reiniciar a aplicação. A porta comum mantém estável o contrato do caso de uso, mas não fornece roteamento dinâmico.
- A chamada externa ocorre antes da gravação de `OrderChargeLink`, sem transação distribuída. Se o provedor criar a cobrança e a resposta se perder, ou se a persistência local falhar, pode existir uma cobrança sem vínculo local. O fluxo atual não define prazo de timeout, consulta de reconciliação, chave de idempotência nem repetição segura; não se deve tratar uma falha de rede como prova de que a cobrança não foi criada.
- O vínculo persistido admite uma cobrança por pedido (`orderId` é a chave primária). Isso não impede cobranças remotas adicionais se o endpoint for chamado novamente. Antes de habilitar repetição automática ou múltiplos provedores por pedido, será necessário definir idempotência e reconciliação.

## Referências no código

- `src/domain/orders/application/services/payment-service.ts`
- `src/domain/orders/application/use-cases/generate-order-pix.use-case.ts`
- `src/infra/payments/payments.module.ts`
- `src/infra/payments/abacate-pay/abacate-pay-payment.service.ts`
- `src/infra/payments/asaas/asaas-payment.service.ts`
- `src/infra/database/prisma/schema.prisma`
