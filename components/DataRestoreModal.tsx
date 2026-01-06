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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="glass rounded-3xl border border-white/5 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="sticky top-0 glass border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-xl">
                    <h2 className="text-2xl font-black text-white">RESTORE DATA</h2>
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                            Select Backup File
                        </label>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all glass">
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
                                <Upload size={48} className="text-gray-500 mb-2" />
                                <span className="text-sm text-gray-300 font-medium">
                                    {selectedFile ? selectedFile.name : 'Click to select a JSON backup file'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Maximum file size: 50MB
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Validation Results */}
                    {validation && (
                        <div className="space-y-4">
                            {/* Status */}
                            <div className={`p-4 rounded-xl glass border ${validation.valid ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                <div className="flex items-center gap-2">
                                    {validation.valid ? (
                                        <CheckCircle className="text-green-400" size={20} />
                                    ) : (
                                        <XCircle className="text-red-400" size={20} />
                                    )}
                                    <span className={`font-bold ${validation.valid ? 'text-green-400' : 'text-red-400'}`}>
                                        {validation.valid ? 'File is valid and ready to restore' : 'Validation failed'}
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            {validation.valid && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass border border-blue-500/20 p-4 rounded-xl">
                                        <div className="text-2xl font-black text-blue-400">
                                            {validation.stats.leaguesCount}
                                        </div>
                                        <div className="text-sm text-gray-400">Leagues</div>
                                    </div>
                                    <div className="glass border border-purple-500/20 p-4 rounded-xl">
                                        <div className="text-2xl font-black text-purple-400">
                                            {validation.stats.matchesCount}
                                        </div>
                                        <div className="text-sm text-gray-400">Matches</div>
                                    </div>
                                </div>
                            )}

                            {/* Errors */}
                            {validation.errors.length > 0 && (
                                <div className="glass border border-red-500/30 bg-red-500/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="text-red-400" size={16} />
                                        <span className="font-bold text-red-400">Errors</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                        {validation.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Warnings */}
                            {validation.warnings.length > 0 && (
                                <div className="glass border border-yellow-500/30 bg-yellow-500/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="text-yellow-400" size={16} />
                                        <span className="font-bold text-yellow-400">Warnings</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                        {validation.warnings.slice(0, 5).map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                        {validation.warnings.length > 5 && (
                                            <li className="text-yellow-500">
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
                                <Loader className="animate-spin text-purple-400" size={20} />
                                <span className="font-bold text-white">{progress.message}</span>
                            </div>
                            <div className="w-full glass rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                            <div className="text-sm text-gray-400">
                                {progress.current} / {progress.total}
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className={`p-4 rounded-xl glass border ${result.success ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                {result.success ? (
                                    <CheckCircle className="text-green-400" size={20} />
                                ) : (
                                    <XCircle className="text-red-400" size={20} />
                                )}
                                <span className={`font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {result.success ? 'Restore completed successfully!' : 'Restore failed'}
                                </span>
                            </div>

                            {result.success && (
                                <div className="space-y-2 text-sm text-gray-300">
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
                                <div className="mt-3 space-y-1 text-sm text-red-300">
                                    {result.errors.slice(0, 5).map((error, index) => (
                                        <div key={index}>• {error}</div>
                                    ))}
                                    {result.errors.length > 5 && (
                                        <div className="text-red-400">
                                            ... and {result.errors.length - 5} more errors
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 glass border-t border-white/5 px-6 py-4 flex justify-end gap-3 backdrop-blur-xl">
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="px-4 py-2 glass border border-white/10 rounded-xl font-bold text-sm hover:bg-white/5 disabled:opacity-50 transition-all"
                    >
                        {result?.success ? 'Close' : 'Cancel'}
                    </button>
                    {validation?.valid && !result && (
                        <button
                            onClick={handleRestore}
                            disabled={isProcessing || !selectedFile}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
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
