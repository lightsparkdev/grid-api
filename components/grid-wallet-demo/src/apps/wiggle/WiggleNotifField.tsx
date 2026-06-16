import { BrandHeader } from '@/apps/skinned/blocks/BrandHeader';
import { WIGGLE_CONFIG } from './config';

/** Screen-aligned copy of Wiggle's auth top (purple wash + brand header) that the
 *  OTP notification refracts through its lens. Mirrors WiggleAuthScreen's header
 *  placement (padding 72/24) + colors — keep them in sync. AuthSheet positions
 *  this at the real screen origin, so the bent header lands where it actually is. */
export function WiggleNotifField() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#9147ff', color: '#efeff1' }}>
      <div style={{ paddingTop: 72, paddingLeft: 24, paddingRight: 24 }}>
        <BrandHeader
          logoSrc={WIGGLE_CONFIG.brand.logoSrc}
          name={WIGGLE_CONFIG.auth.headline}
          tagline={WIGGLE_CONFIG.auth.subhead}
        />
      </div>
    </div>
  );
}
