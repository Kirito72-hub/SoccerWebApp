/**
 * Data Restore Modal Component
 * UI for restoring league and match data from backup files
 */

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, XCircle, Loader, FileText } from 'lucide-react';
import { dataRestoreService } from '../services/dataRestore';
import type { RestoreValidationResult, RestoreProgress, RestoreResult } from '../types/restore';

interface DataRestoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const DataRestoreModal: React.FC<DataRestoreModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [validation, setValidation] = useState<RestoreValidationResult | null>(null);
    const [progress, setProgress] = useState<RestoreProgress | null>(null);
    const [result, setResult] = useState<RestoreResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setValidation(null);
        setResult(null);
        setProgress(null);

        // Auto-validate
        setIsProcessing(true);
        try {
            const validationResult = await dataRestoreService.validateFile(file);
            setValidation(validationResult);
        } catch (error: any) {
            setValidation({
                valid: false,
                errors: [error.message],
                warnings: [],
                stats: {
                    matchesCount: 0,
                    leaguesCount: 0,
                    uniqueUsers: new Set(),
                    duplicateMatches: [],
                    duplicateLeagues: []
                }
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedFile || !validation?.valid) return;

        setIsProcessing(true);
        setResult(null);

        // Set up progress callback
        dataRestoreService.setProgressCallback(setProgress);

        try {
            const restoreResult = await dataRestoreService.restoreFromFile(selectedFile, {
                skipDuplicates: true,
                validateOnly: false,
                preserveIds: true
            });

            setResult(restoreResult);

            if (restoreResult.success && onSuccess) {
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 2000);
            }
        } catch (error: any) {
            setResult({
                success: false,
                imported: { leagues: 0, matches: 0 },
                skipped: { leagues: 0, matches: 0 },
                errors: [error.message],
                duration: 0
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setValidation(null);
        setProgress(null);
        setResult(null);
        setIsProcessing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Restore Data</h2>
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Backup File
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileSelect}
                                disabled={isProcessing}
                                className="hidden"
                                id="restore-file-input"
                            />
                            <label
                                htmlFor="restore-file-input"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <Upload size={48} className="text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">
                                    {selectedFile ? selectedFile.name : 'Click to select a JSON backup file'}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    Maximum file size: 50MB
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Validation Results */}
                    {validation && (
                        <div className="space-y-4">
                            {/* Status */}
                            <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50' : 'bg-red-50'}`}>
                                <div className="flex items-center gap-2">
                                    {validation.valid ? (
                                        <CheckCircle className="text-green-600" size={20} />
                                    ) : (
                                        <XCircle className="text-red-600" size={20} />
                                    )}
                                    <span className={`font-medium ${validation.valid ? 'text-green-800' : 'text-red-800'}`}>
                                        {validation.valid ? 'File is valid and ready to restore' : 'Validation failed'}
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            {validation.valid && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {validation.stats.leaguesCount}
                                        </div>
                                        <div className="text-sm text-blue-800">Leagues</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {validation.stats.matchesCount}
                                        </div>
                                        <div className="text-sm text-purple-800">Matches</div>
                                    </div>
                                </div>
                            )}

                            {/* Errors */}
                            {validation.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="text-red-600" size={16} />
                                        <span className="font-medium text-red-800">Errors</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                        {validation.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Warnings */}
                            {validation.warnings.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="text-yellow-600" size={16} />
                                        <span className="font-medium text-yellow-800">Warnings</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                                        {validation.warnings.slice(0, 5).map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                        {validation.warnings.length > 5 && (
                                            <li className="text-yellow-600">
                                                ... and {validation.warnings.length - 5} more warnings
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progress */}
                    {progress && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Loader className="animate-spin text-purple-600" size={20} />
                                <span className="font-medium text-gray-800">{progress.message}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                            <div className="text-sm text-gray-600">
                                {progress.current} / {progress.total}
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                {result.success ? (
                                    <CheckCircle className="text-green-600" size={20} />
                                ) : (
                                    <XCircle className="text-red-600" size={20} />
                                )}
                                <span className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.success ? 'Restore completed successfully!' : 'Restore failed'}
                                </span>
                            </div>

                            {result.success && (
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div>✅ Imported {result.imported.leagues} leagues</div>
                                    <div>✅ Imported {result.imported.matches} matches</div>
                                    {result.skipped.leagues > 0 && (
                                        <div>⏭️ Skipped {result.skipped.leagues} duplicate leagues</div>
                                    )}
                                    {result.skipped.matches > 0 && (
                                        <div>⏭️ Skipped {result.skipped.matches} duplicate matches</div>
                                    )}
                                    <div className="text-gray-500">
                                        Completed in {(result.duration / 1000).toFixed(2)}s
                                    </div>
                                </div>
                            )}

                            {result.errors.length > 0 && (
                                <div className="mt-3 space-y-1 text-sm text-red-700">
                                    {result.errors.slice(0, 5).map((error, index) => (
                                        <div key={index}>• {error}</div>
                                    ))}
                                    {result.errors.length > 5 && (
                                        <div className="text-red-600">
                                            ... and {result.errors.length - 5} more errors
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        {result?.success ? 'Close' : 'Cancel'}
                    </button>
                    {validation?.valid && !result && (
                        <button
                            onClick={handleRestore}
                            disabled={isProcessing || !selectedFile}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader className="animate-spin" size={16} />
                                    Restoring...
                                </>
                            ) : (
                                <>
                                    <FileText size={16} />
                                    Start Restore
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
