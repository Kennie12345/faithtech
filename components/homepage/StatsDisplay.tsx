/**
 * StatsDisplay Component
 *
 * Displays statistics in a responsive grid:
 * - Large numbers with brand yellow color
 * - Small uppercase labels
 * - 2-col mobile, 4-col desktop layout
 * - Center-aligned
 *
 * Following FaithTech Design System (docs/style_guide.md)
 *
 * Server Component
 */

interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

interface StatsDisplayProps {
  stats: Stat[];
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="grid grid-cols-grid-2 gap-space-8 md:grid-cols-grid-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="font-heading text-h2 font-700 text-brand-yellow-200">
            {stat.value.toLocaleString()}
            {stat.suffix && (
              <span className="text-h3">{stat.suffix}</span>
            )}
          </div>
          <div className="mt-space-2 font-heading text-p-14 uppercase tracking-ls-6 text-brand-grey-500">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
