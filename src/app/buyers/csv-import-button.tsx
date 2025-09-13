'use client';

import { useState } from 'react';
import { importBuyersCSV, type CSVImportResult } from '@/lib/actions';

export default function CSVImportButton() {
  const [isImporting, setIsImporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);

  const handleImport = async (formData: FormData) => {
    setIsImporting(true);
    try {
      const result = await importBuyersCSV(formData);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        message: 'Import failed. Please try again.',
        totalRows: 0,
        validRows: 0,
        errors: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'];
    const sampleRows = [
      ['John Doe', 'john@example.com', '9876543210', 'Chandigarh', 'Apartment', 'Two', 'Buy', '5000000', '7000000', 'ThreeToSixMonths', 'Website', 'Looking for 2BHK apartment', 'urgent;verified', 'New'],
      ['Jane Smith', '', '8765432109', 'Mohali', 'Villa', 'Three', 'Buy', '10000000', '15000000', 'Immediate', 'Referral', 'Needs villa with garden', 'premium;family', 'Qualified'],
      ['Bob Wilson', 'bob@example.com', '7654321098', 'Zirakpur', 'Office', '', 'Rent', '50000', '100000', 'MoreThanSixMonths', 'Call', '', 'commercial', 'Contacted'],
      ['Alice Brown', '', '6543210987', 'Panchkula', 'Plot', '', 'Buy', '2000000', '3000000', 'Exploring', 'WalkIn', 'Investment purpose', 'investment', 'New']
    ];
    
    const csvContent = [headers, ...sampleRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'buyers-import-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn btn-outline"
      >
        Import CSV
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Import Buyers from CSV</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {!importResult ? (
              <form action={handleImport} className="space-y-4">
                <div>
                  <label htmlFor="csvFile" className="form-label">
                    Choose CSV file (max 200 rows)
                  </label>
                  <input
                    id="csvFile"
                    name="csvFile"
                    type="file"
                    accept=".csv"
                    required
                    className="form-field"
                  />
                  <p className="text-sm text-muted mt-1">
                    Required fields: fullName, phone, city, propertyType, purpose, budgetMin, budgetMax, timeline, source, status
                    <br />
                    Optional fields: email, bhk (required only for Apartment/Villa), notes, tags
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isImporting}
                    className="btn btn-primary"
                  >
                    {isImporting ? 'Importing...' : 'Import'}
                  </button>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="btn btn-outline"
                  >
                    Download Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded ${importResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
                  {importResult.message}
                </div>

                {importResult.totalRows > 0 && (
                  <div className="text-sm space-y-2">
                    <p><strong>Total rows:</strong> {importResult.totalRows}</p>
                    <p><strong>Successfully imported:</strong> {importResult.validRows}</p>
                    <p><strong>Errors:</strong> {importResult.errors.length}</p>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-600 dark:text-red-400">Import Errors:</h3>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-xs border border-gray-200 dark:border-gray-700">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="p-2 text-left border-b">Row</th>
                            <th className="p-2 text-left border-b">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResult.errors.map((error, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{error.row}</td>
                              <td className="p-2">{error.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setImportResult(null);
                      setShowModal(false);
                    }}
                    className="btn btn-primary"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => setImportResult(null)}
                    className="btn btn-outline"
                  >
                    Import Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
