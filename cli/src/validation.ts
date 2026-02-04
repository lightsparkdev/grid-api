export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateDate(value: string, fieldName: string): ValidationResult {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return {
      valid: false,
      error: `${fieldName} must be in YYYY-MM-DD format (got: ${value})`,
    };
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: `${fieldName} is not a valid date (got: ${value})`,
    };
  }
  return { valid: true };
}

export function validateAmount(value: string, fieldName: string): ValidationResult {
  const amount = parseInt(value, 10);
  if (isNaN(amount)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid integer (got: ${value})`,
    };
  }
  if (amount < 0) {
    return {
      valid: false,
      error: `${fieldName} must be non-negative (got: ${value})`,
    };
  }
  return { valid: true };
}

export function parseAmount(value: string): number {
  const amount = parseInt(value, 10);
  if (isNaN(amount)) {
    throw new Error(`Invalid amount: ${value}`);
  }
  return amount;
}

const VALID_CURRENCIES = new Set([
  "USD", "EUR", "GBP", "MXN", "BRL", "INR", "NGN", "PHP", "KES",
  "BTC", "SAT", "USDC", "USDT",
]);

export function validateCurrency(value: string, fieldName: string): ValidationResult {
  const upper = value.toUpperCase();
  if (!VALID_CURRENCIES.has(upper)) {
    return {
      valid: false,
      error: `${fieldName} "${value}" is not a recognized currency. Valid: ${Array.from(VALID_CURRENCIES).join(", ")}`,
    };
  }
  return { valid: true };
}

const VALID_CUSTOMER_TYPES = new Set(["INDIVIDUAL", "BUSINESS"]);

export function validateCustomerType(value: string): ValidationResult {
  if (!VALID_CUSTOMER_TYPES.has(value)) {
    return {
      valid: false,
      error: `Customer type must be INDIVIDUAL or BUSINESS (got: ${value})`,
    };
  }
  return { valid: true };
}

const VALID_LOCK_SIDES = new Set(["SENDING", "RECEIVING"]);

export function validateLockSide(value: string): ValidationResult {
  if (!VALID_LOCK_SIDES.has(value)) {
    return {
      valid: false,
      error: `Lock side must be SENDING or RECEIVING (got: ${value})`,
    };
  }
  return { valid: true };
}

export function validateAll(validations: ValidationResult[]): ValidationResult {
  for (const v of validations) {
    if (!v.valid) return v;
  }
  return { valid: true };
}
