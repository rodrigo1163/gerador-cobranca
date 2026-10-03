# Gerador de cobrança Pix

Backend Node.js/TypeScript com NestJS para gerar cobranças Pix de pedidos. O caso de uso depende de `PaymentService`; a implementação ativa é escolhida em `src/infra/payments/payments.module.ts`. Este projeto usa **AbacatePay e Asaas**. A escolha do Asaas no lugar de Delfinance é intencional, mas difere do enunciado original do desafio.

## Enunciado original do desafio

**Desafio · Troque o fornecedor de pagamento** — Rodrigo, Kipper Academy, Turma Alpha (16/09 a 08/10/2026).

Crie um backend Node/TypeScript que gera QR Codes Pix para pedidos, usando **AbacatePay e Delfinance** em testes. A meta é trocar só a instância injetada e apontar para o outro gateway, sem alterar controller, regra ou resposta da aplicação.

1. Comece com um pedido em memória: ID, valor em centavos e estado `AGUARDANDO_PAGAMENTO`. Use um valor fixo de teste definido no backend, como R$ 10,00. Nenhuma chamada desta etapa deve marcar o pedido como pago.
2. Defina a porta `GerarCobrancaPix`. Entrada: `orderId` e `amountInCents`. Saída: `chargeId`, `pixCopyPaste` e `qrCodeDataUrl`, com imagem PNG. Defina erros próprios para entrada inválida, indisponibilidade e resposta inválida. Tipos e erros dos SDKs ficam no adaptador.
3. Crie `POST /orders/:id/pix`. Busque o valor do pedido, invoque a porta injetada e devolva o mesmo JSON com qualquer gateway. Guarde o vínculo pedido–cobrança e o provedor usado. Sem frontend: inspecione o retorno com um cliente HTTP.

Antes de conectar os gateways, verifique que um fake da porta permite testar o caso de uso; pedido inexistente ou valor inválido falham antes da integração; imagem e copia e cola representam a mesma cobrança; gerar QR Code não confirma pagamento; e controller e caso de uso não importam SDKs, DTOs ou campos específicos dos gateways.

4. **AbacatePay, Dev mode:** crie uma cobrança Pix pela API v2 (`POST /transparents/create`, `method: PIX`, `data.amount` em centavos). Mapeie `id`, `brCode` e `brCodeBase64` para a porta. Use chave de desenvolvimento.
5. **Delfinance, chaves de teste:** crie uma cobrança imediata no Sandbox com `correlationId` e `amount` em reais. Peça `PAYLOAD_AND_QRCODE` e traduza `transactionId`, `payloadPix` e `qrCodeImageBase64`. Conversão de centavos e autenticação ficam no adaptador.
6. Normalize a imagem como data URL PNG e valide o JSON. Traduza os erros na fronteira. Timeout é resultado incerto: não confirme sucesso nem repita automaticamente.
7. Gere um Pix de teste com AbacatePay. Na montagem da aplicação, troque só a instância injetada por `DelfinanceAdapter`, já configurada. Gere um novo pedido: endpoint, regra, JSON e testes do caso de uso devem continuar iguais.
8. Use os dois gateways para comprovar o fluxo feliz. Em testes com respostas HTTP controladas, rode os mesmos cenários de sucesso, falha, timeout e JSON inválido. Confira valor, vínculo com o pedido, copia e cola e imagem.
9. Mostre o diff da troca e os imports. Não deve haver `if` por provedor no controller ou no caso de uso. IDs e QR Codes mudam; formato e significado da resposta permanecem. Entregue código, testes e ADR com fronteira, alternativa e custo. Explique por que pastas não garantem isolamento. A troca vale para novas cobranças e não migra as anteriores.

**Critério de conclusão do enunciado:** os dois gateways geram Pix de teste para pedidos e retornam o mesmo contrato, com imagem e copia e cola coerentes; só a instância injetada muda; os testes da regra permanecem intactos; testes controlados cobrem falhas sem fingir sucesso. Se faltar acesso a uma API, registre o bloqueio: o fake sozinho não conclui a etapa.

> **Adaptações deste repositório:** usa PostgreSQL em vez de pedidos apenas em memória, recebe o valor em `POST /orders` em vez de fixá-lo no backend, representa o estado inicial como `PENDING_PAYMENT` e implementa Asaas no lugar de Delfinance. A tabela abaixo distingue o que foi implementado do que ainda falta.

## Estado do desafio

✅ = implementado no código. ❌ = ausente ou ainda não demonstrado. A tabela considera Asaas como o segundo gateway escolhido para este projeto.

| Item | Estado | Evidência ou pendência |
| --- | :---: | --- |
| Pedido com ID, valor em centavos e estado inicial de pagamento pendente | ✅ | `Order` começa em `PENDING_PAYMENT`. |
| Persistência dos pedidos e definição do valor (adaptação do desafio) | ✅ | A aplicação usa PostgreSQL, com repositórios em memória nos testes. O valor é recebido em `amountInCents` no `POST /orders`; R$ 10,00 é usado nos testes. |
| Porta de cobrança com saída `chargeId`, `pixCopyPaste` e `qrCodeDataUrl` | ✅ | `PaymentService` define o contrato comum. |
| Porta com entrada somente `orderId` e `amountInCents` | ✅ | O cliente exigido pelo Asaas é criado dentro do adaptador. |
| Erros próprios para entrada inválida, gateway indisponível e resposta inválida | ✅ | Há classes de erro da aplicação e tradução de erros nos adaptadores. |
| `POST /orders/:orderId/pix` consulta o valor do pedido e grava cobrança e provedor | ✅ | `GenerateOrderPixUseCase` usa os repositórios e a porta injetada. |
| Gerar Pix sem marcar o pedido como pago | ✅ | O caso de uso não altera o estado do pedido; o teste verifica `PENDING_PAYMENT`. |
| Fake testa o caso de uso e impede integração para pedido inexistente ou ID vazio | ✅ | Testes unitários verificam que o fake não é chamado nesses casos. |
| Valor inválido falha no caso de uso antes da integração | ✅ | Um pedido de 99 centavos retorna `InvalidChargeAmountError`; o teste confirma que o fake não é chamado e nenhum vínculo é criado. |
| Adaptador AbacatePay para criação de Pix | ✅ | Usa `/v2/transparents/create` e mapeia `id`, `brCode` e `brCodeBase64`. |
| Adaptador Asaas Sandbox para criação de Pix | ✅ | Cria pagamento Pix e consulta o QR Code; converte centavos para reais no adaptador. |
| Troca do gateway pela instância injetada | ✅ | `PaymentsModule` seleciona a implementação; atualmente usa Asaas. |
| Contrato de entrada independente do gateway | ✅ | O controller e o caso de uso recebem apenas o ID do pedido. |
| Mesmo formato de JSON de resposta para os dois gateways | ✅ | Ambos retornam `pixCharge` com os mesmos três campos. |
| Validar PNG e provar que imagem e copia e cola representam a mesma cobrança | ✅ | O E2E lê o PNG com verificação de CRC, decodifica o QR Code e compara seu conteúdo com `pixCopyPaste` nos dois gateways. |
| Timeout com resultado incerto, sem confirmação ou repetição automática | ❌ | Não há prazo de timeout nem teste desse comportamento. |
| Testes HTTP controlados para sucesso, falha, timeout e JSON inválido em ambos | ❌ | Esses cenários ainda não têm testes controlados. |
| Teste E2E com APIs de desenvolvimento/Sandbox | ✅ | Existe teste E2E para AbacatePay e Asaas; sua execução depende de banco, credenciais e acesso às APIs. |
| ADR com fronteira, alternativa e custo | ✅ | [ADR 0001](docs/adr/0001-fronteira-da-integracao-pix.md) registra a porta, as alternativas e os custos da integração. |

## Configuração

Pré-requisitos: Node.js, pnpm e PostgreSQL acessível. O `docker-compose.yml` fornece um PostgreSQL local se Docker Compose estiver instalado.

1. Instale as dependências e, se for usar o banco local do projeto, inicie o container:

```bash
pnpm install
docker compose up -d postgres
cp .env.example .env
```

Se usar um PostgreSQL próprio, dispense o comando `docker compose` e aponte `DATABASE_URL` para esse banco.

2. Edite `.env`. Para o container do projeto, use `DATABASE_URL=postgresql://docker:docker@localhost:5432/gerador_cobranca`. Configure `ASAAS_API_KEY` com a chave de **Sandbox** para o gateway ativo e `ABACATEPAY_API_KEY` com a chave de **Dev mode** para usar o outro adaptador ou executar o E2E. `ASAAS_BASE_URL` deve apontar para `https://api-sandbox.asaas.com/v3`. O adaptador Asaas cria seu cliente de teste; `ASAAS_CUSTOMER_ID` não é necessário.

3. Gere o Prisma Client, aplique as migrações e inicie a API:

```bash
pnpm exec prisma generate --config prisma7.config.ts
pnpm exec prisma migrate deploy --config prisma7.config.ts
pnpm run start:dev
```

A API atende em `http://localhost:3000` por padrão; `PORT` pode alterar a porta. A implementação ativa é `AsaasPaymentService` em `src/infra/payments/payments.module.ts`. Para usar AbacatePay, troque somente a classe associada a `PaymentService` nesse módulo e reinicie a API; controller, caso de uso e JSON não precisam mudar.

## Teste manual com cliente HTTP

1. Crie um pedido de R$ 10,00 com `POST http://localhost:3000/orders` e corpo `{ "amountInCents": 1000 }`. Guarde o `order.id` da resposta.
2. Gere o Pix com `POST http://localhost:3000/orders/<order.id>/pix` e corpo `{}`. O gateway usado é o selecionado em `PaymentsModule`.
3. Confira `pixCharge.chargeId`, `pixCharge.pixCopyPaste` e `pixCharge.qrCodeDataUrl` na resposta. O pedido permanece `PENDING_PAYMENT`.

Exemplo com `curl` (substitua o UUID pelo `order.id` retornado na primeira chamada):

```bash
curl -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{"amountInCents":1000}'

curl -X POST http://localhost:3000/orders/SEU_ORDER_ID/pix \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## Testes

Os testes unitários usam fakes e não precisam das APIs externas. Para o E2E, crie `.env.test` a partir do exemplo e confira sua `DATABASE_URL`; mantenha as duas chaves de teste em `.env`. O E2E cria um schema temporário, aplica as migrações e chama os dois gateways reais; ele precisa de acesso às APIs e gera cobranças de teste.

```bash
pnpm test
cp .env.test.example .env.test
pnpm run test:e2e
pnpm build
```
