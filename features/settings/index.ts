/**
 * Settings Feature
 *
 * City configuration and feature toggles for admins.
 *
 * Features:
 * - City profile editing (name, logo, hero image, accent color)
 * - Feature toggles (events, blog, projects, newsletter)
 *
 * @see docs/4-admin-ui/admin-design-guide.md
 */

// Types
export type {
  CityFeature,
  CityProfile,
  UpdateCityProfileInput,
  ActionResult,
  FeatureSlug,
  FeatureConfig,
} from './types';

// Constants
export { ACCENT_COLORS, FEATURE_CONFIGS } from './types';

// Actions
export {
  // City profile
  getCityProfile,
  updateCityProfile,
  // Feature toggles
  getFeatureToggles,
  toggleFeature,
  isFeatureEnabled,
  getEnabledFeatures,
} from './actions';
