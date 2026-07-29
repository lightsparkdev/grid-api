/**
 * Which Grid environment the demo is pointed at. The base URL is the same for
 * both — sandbox vs production is decided by the API key — so it can't be
 * sniffed at runtime and has to be declared.
 *
 * Set `NEXT_PUBLIC_GRID_SANDBOX=true` alongside sandbox keys. It gates demo
 * affordances that must NEVER run against real money: today, the simulated
 * inbound bank deposit on the Add money screen (a real deployment waits for a
 * real wire instead).
 */
export const IS_SANDBOX = process.env.NEXT_PUBLIC_GRID_SANDBOX === 'true';

/** Amount the sandbox pretends arrived by wire, so Add money still completes. */
export const SANDBOX_DEPOSIT_CENTS = 2500;
