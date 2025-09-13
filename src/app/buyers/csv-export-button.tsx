'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function CSVExportButton() {
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Call the API route instead of the server action
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/export-csv?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const csvContent = await response.text();
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `buyers-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className="btn btn-outline"
    >
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
