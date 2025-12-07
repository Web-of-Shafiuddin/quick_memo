'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Papa from 'papaparse';

const REQUIRED_COLUMNS = ['Customer Name', 'Mobile', 'Address', 'Product Name', 'Quantity', 'Price'];

export default function BulkMemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleParse = () => {
    if (!file) {
      toast.error('Please select a file to parse');
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setParsedData(results.data);
        const headers = results.meta.fields || [];
        const initialMapping = REQUIRED_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
        setColumnMapping(initialMapping);
      },
    });
  };

  const handleMappingChange = (e: React.ChangeEvent<HTMLSelectElement>, requiredColumn: string) => {
    setColumnMapping(prev => ({ ...prev, [requiredColumn]: e.target.value }));
  };

  const handleGenerateMemos = async () => {
    try {
      const response = await fetch('/api/bulk-memo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: parsedData, mapping: columnMapping }),
      });

      if (response.ok) {
        toast.success('Memos generated successfully');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'memos.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        toast.error('Failed to generate memos');
      }
    } catch (error) {
      toast.error('An error occurred while generating the memos');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bulk Memo Generation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV/Excel File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Upload File</Label>
            <Input id="file" type="file" onChange={handleFileChange} accept=".csv" />
          </div>
          <Button onClick={handleParse}>Parse File</Button>
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {REQUIRED_COLUMNS.map(col => (
              <div key={col} className="flex items-center gap-4">
                <Label className="w-40">{col}</Label>
                <select
                  onChange={(e) => handleMappingChange(e, col)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Column</option>
                  {Object.keys(parsedData[0]).map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
            <Button onClick={handleGenerateMemos}>Generate Memos</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
