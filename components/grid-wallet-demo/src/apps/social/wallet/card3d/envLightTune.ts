/**
 * DEV-ONLY tuning channel for the resolved card's lighting. The EnvTuner panel
 * writes offsets here and RevealCard's useFrame reads them every frame —
 * a mutable module value, so dragging a slider never re-renders the scene.
 * X slides the env reflections vertically across the card, Y horizontally.
 */
export const envLightTune = { x: 0, y: 0 };
