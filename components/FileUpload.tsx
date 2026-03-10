'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, AlertCircle, Loader2 } from 'lucide-react';
import { processCSVData } from '../utils/dataProcessors';
import { DashboardData } from '../types';

interface FileUploadProps {
    onDataLoaded: (data: DashboardData) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);

        // 1. Strict Input Validation
        if (!file) return;
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Strict Error: Invalid file format. Only CSV files are accepted.');
            return;
        }

        // 2. Async Processing Trigger
        setIsLoading(true);
        try {
            const parsedData = await processCSVData(file);
            // 3. Hand off to parent component
            onDataLoaded(parsedData);
        } catch (err: any) {
            setError(err.message || 'Data pipeline failure. Ensure the CSV matches the required schema.');
        } finally {
            setIsLoading(false);
            // Reset input so the same file can be uploaded again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-10">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`
                    relative flex flex-col items-center justify-center w-full h-64 p-6 
                    border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                    ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                    ${isLoading ? 'opacity-75 pointer-events-none' : ''}
                `}
            >
                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                />
                
                {isLoading ? (
                    <div className="flex flex-col items-center text-blue-600">
                        <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                        <p className="text-sm font-semibold">Processing Sleep Epochs...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                        <p className="mb-2 text-sm font-semibold text-gray-700">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FileType className="w-3 h-3" /> CSV files only (timestamp, heart_rate, respiration, stage)
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 mt-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}