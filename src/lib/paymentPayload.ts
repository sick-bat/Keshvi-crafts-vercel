const SENSITIVE_PAYMENT_KEYS = new Set([
  "address1",
  "address2",
  "authenticaticationMethod",
  "card_no",
  "card_token",
  "cardToken",
  "email",
  "field1",
  "field3",
  "field4",
  "field6",
  "firstname",
  "hash",
  "key",
  "lastname",
  "phone",
  "psp_name",
  "surl",
  "curl",
  "furl",
]);

export function redactPaymentPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      SENSITIVE_PAYMENT_KEYS.has(key) ? "[redacted]" : value,
    ])
  );
}

export function serializeRedactedPaymentPayload(payload: Record<string, unknown>) {
  return JSON.stringify(redactPaymentPayload(payload));
}
