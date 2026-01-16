'use client';

import { useState } from 'react';
import { YellowButton } from '@/components/design-system';
import { DownloadIcon, Loader2Icon } from 'lucide-react';
import { exportSubscribersCSV } from '@/features/newsletter/actions';

interface ExportButtonProps {
  disabled?: boolean;
}

export function ExportButton({ disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportSubscribersCSV();

      if (result.error) {
        alert(result.error);
        return;
      }

      if (!result.csv) {
        alert('No data to export');
        return;
      }

      // Create and download the CSV file
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export subscribers');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <YellowButton onClick={handleExport} disabled={disabled || isExporting}>
      {isExporting ? (
        <Loader2Icon className="mr-space-2 h-4 w-4 animate-spin" />
      ) : (
        <DownloadIcon className="mr-space-2 h-4 w-4" />
      )}
      Export CSV
    </YellowButton>
  );
}
