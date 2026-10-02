# Gerador de cobrança Pix

Backend Node.js/TypeScript com NestJS para gerar cobranças Pix de pedidos. O caso de uso depende de `PaymentService`; a implementação ativa é escolhida em `src/infra/payments/payments.module.ts`. Este projeto usa **AbacatePay e Asaas**. A escolha do Asaas no lugar de Delfinance é intencional, mas difere do enunciado original do desafio.

## Estado do desafio

✅ = implementado no código. ❌ = ausente ou ainda não demonstrado. A tabela considera Asaas como o segundo gateway escolhido para este projeto.

| Item | Estado | Evidência ou pendência |
| --- | :---: | --- |
| Pedido com ID, valor em centavos e estado inicial de pagamento pendente | ✅ | `Order` começa em `PENDING_PAYMENT`. |
| Pedido em memória e valor fixo de R$ 10,00 definido no backend | ❌ | A aplicação usa PostgreSQL e recebe `amountInCents` em `POST /orders`; R$ 10,00 é usado nos testes. |
| Porta de cobrança com saída `chargeId`, `pixCopyPaste` e `qrCodeDataUrl` | ✅ | `PaymentService` define o contrato comum. |
| Porta com entrada somente `orderId` e `amountInCents` | ✅ | O ID do cliente Asaas é configuração do adaptador. |
| Erros próprios para entrada inválida, gateway indisponível e resposta inválida | ✅ | Há classes de erro da aplicação e tradução de erros nos adaptadores. |
| `POST /orders/:orderId/pix` consulta o valor do pedido e grava cobrança e provedor | ✅ | `GenerateOrderPixUseCase` usa os repositórios e a porta injetada. |
| Gerar Pix sem marcar o pedido como pago | ✅ | O caso de uso não altera o estado do pedido; o teste verifica `PENDING_PAYMENT`. |
| Fake testa o caso de uso e impede integração para pedido inexistente ou ID vazio | ✅ | Testes unitários verificam que o fake não é chamado nesses casos. |
| Valor inválido falha no caso de uso antes da integração | ❌ | Não há validação nem teste desse cenário no caso de uso de geração. |
| Adaptador AbacatePay para criação de Pix | ✅ | Usa `/v2/transparents/create` e mapeia `id`, `brCode` e `brCodeBase64`. |
| Adaptador Asaas Sandbox para criação de Pix | ✅ | Cria pagamento Pix e consulta o QR Code; converte centavos para reais no adaptador. |
| Troca do gateway pela instância injetada | ✅ | `PaymentsModule` seleciona a implementação; atualmente usa Asaas. |
| Contrato de entrada independente do gateway | ✅ | O controller e o caso de uso recebem apenas o ID do pedido. |
| Mesmo formato de JSON de resposta para os dois gateways | ✅ | Ambos retornam `pixCharge` com os mesmos três campos. |
| Validar PNG e provar que imagem e copia e cola representam a mesma cobrança | ❌ | Os testes só verificam prefixo de imagem e base64 não vazio. |
| Timeout com resultado incerto, sem confirmação ou repetição automática | ❌ | Não há prazo de timeout nem teste desse comportamento. |
| Testes HTTP controlados para sucesso, falha, timeout e JSON inválido em ambos | ❌ | Esses cenários ainda não têm testes controlados. |
| Teste E2E com APIs de desenvolvimento/Sandbox | ✅ | Existe teste E2E para AbacatePay e Asaas; sua execução depende de banco, credenciais e acesso às APIs. |
| ADR com fronteira, alternativa e custo | ❌ | Ainda não há ADR no repositório. |

## Configuração

```bash
pnpm install
cp .env.example .env
```

Configure `DATABASE_URL` e as chaves de desenvolvimento em `.env`. Para usar Asaas, configure também `ASAAS_CUSTOMER_ID` com o ID de um cliente criado no Sandbox. `ASAAS_BASE_URL` aponta por padrão para `https://api-sandbox.asaas.com/v3`. A implementação ativa está em `src/infra/payments/payments.module.ts`; a seleção atual é `AsaasPaymentService`.

```bash
pnpm exec prisma migrate deploy --config prisma7.config.ts
pnpm run start:dev
```

## Teste manual com cliente HTTP

1. Crie um pedido com `POST http://localhost:3000/orders` e corpo `{ "amountInCents": 1000 }`. Guarde o `order.id` da resposta.
2. Gere o Pix com `POST http://localhost:3000/orders/<order.id>/pix` e corpo `{}` com qualquer um dos gateways.
3. Confira `pixCharge.chargeId`, `pixCharge.pixCopyPaste` e `pixCharge.qrCodeDataUrl` na resposta. O pedido permanece `PENDING_PAYMENT`.

## Testes

```bash
pnpm test
pnpm run test:e2e
pnpm build
```

Os testes E2E exigem PostgreSQL, `DATABASE_URL` em `.env.test` (veja `.env.test.example`), chave de desenvolvimento AbacatePay e chave Sandbox Asaas. Eles criam cobranças de teste nas APIs externas.
