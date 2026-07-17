/** The value typed on the auth screen, stashed across the onSignIn → entry-step
 *  handoff (`SkinAuthScreenProps.onSignIn` carries only the method; the flow's
 *  entry step arms one render later). The entry step is invisible in this skin —
 *  the screen auto-submits the stash the moment the flow arms, jumping straight
 *  to the confirm screen. Consumed one-shot so a "Back" from the code step
 *  doesn't re-submit. */
let stashedValue: string | null = null;

export function stashAuthValue(value: string) {
  stashedValue = value;
}

export function takeAuthValue(): string | null {
  const v = stashedValue;
  stashedValue = null;
  return v;
}
