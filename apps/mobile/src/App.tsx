import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@onexdeal/ui';
import { formatPricePaise } from '@onexdeal/utils';
import { getMobileRuntimeConfig } from './config/mobile-env.js';

export function App(): React.JSX.Element {
  const config = getMobileRuntimeConfig();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>Phase 0 Mobile Shell</Text>
        <Text style={styles.title}>{config.appName}</Text>
        <Text style={styles.subtitle}>
          Pilot: {config.defaultLocalityName}, {config.defaultDistrict}, {config.defaultState} (
          {config.defaultPincode})
        </Text>
        <Text style={styles.meta}>
          Default search radius: {config.defaultSearchRadiusKm} km • Supports priced &amp;{' '}
          {formatPricePaise(0)} listings
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.base,
    padding: spacing[4],
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[5],
  },
  badge: {
    color: colors.brand.primary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.heading1.fontSize,
    lineHeight: typography.heading1.lineHeight,
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing[2],
  },
  meta: {
    color: colors.text.secondary,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
  },
});

export default App;
