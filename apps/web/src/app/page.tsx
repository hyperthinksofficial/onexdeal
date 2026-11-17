import { DEFAULT_SEARCH_RADIUS_KM, SEARCH_RADIUS_KM_OPTIONS } from '@onexdeal/types';
import { colors, radii, spacing } from '@onexdeal/ui';
import { formatPricePaise, HOSUR_DEFAULT_LOCALITY } from '@onexdeal/utils';

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: `${spacing[8]}px ${spacing[4]}px`,
      }}
    >
      <section
        style={{
          backgroundColor: colors.surface.card,
          border: `1px solid ${colors.border.default}`,
          borderRadius: `${radii.lg}px`,
          padding: `${spacing[6]}px`,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            backgroundColor: colors.brand.primary,
            color: '#FFFFFF',
            borderRadius: `${radii.pill}px`,
            padding: `${spacing[1]}px ${spacing[3]}px`,
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Phase 0 Engineering Baseline
        </span>
        <h1 style={{ marginTop: `${spacing[3]}px`, marginBottom: `${spacing[2]}px` }}>
          OneXDeal — {HOSUR_DEFAULT_LOCALITY.name}, {HOSUR_DEFAULT_LOCALITY.state}
        </h1>
        <p style={{ color: colors.text.secondary, marginTop: 0 }}>
          Pilot locality: {HOSUR_DEFAULT_LOCALITY.name} ({HOSUR_DEFAULT_LOCALITY.pincode}) • Default
          search radius: {DEFAULT_SEARCH_RADIUS_KM} km (options:{' '}
          {SEARCH_RADIUS_KM_OPTIONS.join(', ')} km) • Supports priced &amp; {formatPricePaise(0)}{' '}
          listings.
        </p>
      </section>
    </main>
  );
}
