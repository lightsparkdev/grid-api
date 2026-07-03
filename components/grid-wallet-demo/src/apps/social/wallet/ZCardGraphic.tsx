import styles from './ZCardGraphic.module.scss';

/**
 * The "Z Card" tile graphic — a pre-baked render of the actual 3D metal card
 * (captured from the resolved card scene; see card3d/), peeking up tilted from
 * the tile's bottom-right. A static image on purpose: a live WebGL context is
 * wasted at thumbnail size — the real card stays special in the card flow.
 */
export function ZCardGraphic() {
  return (
    <div className={styles.graphic} aria-hidden>
      <img className={styles.card} src="/assets/social/z-card.webp" alt="" />
    </div>
  );
}
