# ADR 0002 — Gateways separados por método de pagamento

- **Status:** aceito
- **Data:** 2026-10-06

## Contexto

A aplicação passou a gerar Pix e boleto. Esses métodos têm entradas e respostas diferentes, e podem ser mais vantajosos em provedores distintos. A escolha atual é AbacatePay para Pix e Asaas para boleto.

## Decisão

A camada de aplicação expõe duas portas abstratas: `PixGateway` e `BoletoGateway`. `PaymentsModule` associa cada porta a uma implementação concreta com `provide` e `useClass`:

- `PixGateway` usa `AbacatePayPixGateway`;
- `BoletoGateway` usa `AsaasBoletoGateway`.

Os casos de uso dependem somente da porta do método que executam. Controllers, regras de pedido e contratos HTTP não importam clientes nem DTOs dos provedores. Os clientes `AsaasClient` e `AbacatePayClient` são criados por factory providers e injetados nos adaptadores.

O vínculo de cobrança persiste `method` e `provider`. A chave composta `orderId + method` permite, no máximo, uma cobrança de cada método por pedido.

## Consequências

- A escolha de provedor é independente para cada método e ocorre na inicialização da aplicação.
- Trocar o provedor de Pix ou boleto exige alterar apenas o `useClass` correspondente e reiniciar a aplicação.
- Uma escolha dinâmica por pedido exigiria um resolver adicional; esse roteamento não faz parte desta decisão.
- Como um pedido pode ter um Pix e um boleto abertos ao mesmo tempo, a confirmação de pagamento deverá cancelar ou invalidar as demais cobranças para evitar pagamento duplicado.
- Falhas de rede continuam sendo resultados incertos. Não há repetição automática porque o provedor pode ter criado a cobrança antes da perda da resposta.

## Referências no código

- `src/domain/orders/application/gateways/pix-gateway.ts`
- `src/domain/orders/application/gateways/boleto-gateway.ts`
- `src/domain/orders/application/use-cases/generate-order-pix.use-case.ts`
- `src/domain/orders/application/use-cases/generate-order-boleto.use-case.ts`
- `src/infra/payments/payments.module.ts`
- `src/infra/payments/abacate-pay/abacate-pay-pix.gateway.ts`
- `src/infra/payments/asaas/asaas-boleto.gateway.ts`
- `src/infra/database/prisma/schema.prisma`
