import { PayPalGateway } from "./paypal";
import { PhonePeGateway } from "./phonepe";
import type { GatewayId, PaymentGateway } from "./types";

/** Payments stay OFF unless PAYMENTS_ENABLED=true AND the gateway's credentials are present. */
export function paymentsEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.PAYMENTS_ENABLED === "true";
}

export function getGateway(id: GatewayId, env: NodeJS.ProcessEnv = process.env): PaymentGateway | undefined {
  if (!paymentsEnabled(env)) return undefined;
  return (id === "phonepe" ? PhonePeGateway.fromEnv(env) : PayPalGateway.fromEnv(env)) ?? undefined;
}

export function configuredGateways(env: NodeJS.ProcessEnv = process.env): GatewayId[] {
  return (["phonepe", "paypal"] as const).filter((g) => getGateway(g, env));
}
