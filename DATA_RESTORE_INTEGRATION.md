# Data Restore System - Integration Guide

## ✅ System Created Successfully!

The following files have been created:

1. **`types/restore.ts`** - TypeScript type definitions
2. **`services/dataRestore.ts`** - Core restore service (500+ lines)
3. **`components/DataRestoreModal.tsx`** - UI modal component
4. **`docs/DATA_RESTORE_GUIDE.md`** - User documentation

---

## 🔧 Integration Steps

### Step 1: Add Import to Settings Page

Add this to the imports section of `pages/Settings.tsx` (around line 2-21):

```typescript
import { DataRestoreModal } from '../components/DataRestoreModal';
import { Database } from 'lucide-react'; // Add to existing lucide imports
```

### Step 2: Add State for Modal

Add this state variable around line 43 (with other state variables):

```typescript
const [showRestoreModal, setShowRestoreModal] = useState(false);
```

### Step 3: Add Restore Button

Find where you want to add the restore button (likely in a "Data Management" or "Database" section).
Add this button:

```tsx
<button
    onClick={() => setShowRestoreModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
>
    <Database size={20} />
    Restore Data
</button>
```

### Step 4: Add Modal Component

Add this at the end of the return statement (before the closing `</div>`):

```tsx
{/* Data Restore Modal */}
<DataRestoreModal
    isOpen={showRestoreModal}
    onClose={() => setShowRestoreModal(false)}
    onSuccess={() => {
        // Refresh data after successful restore
        window.location.reload();
    }}
/>
```

---

## 🎯 Quick Integration (Copy-Paste Ready)

If you want a standalone page instead of integrating into Settings, create a new file:

**`pages/DataRestore.tsx`:**

```typescript
import React, { useState } from 'react';
import { DataRestoreModal } from '../components/DataRestoreModal';
import { Database, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DataRestore: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Settings
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Data Restore</h1>
                    <p className="text-gray-600 mt-2">
                        Restore league and match data from backup files
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">How it Works</h2>
                    <ol className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-purple-600">1.</span>
                            <span>Select your backup JSON file</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-purple-600">2.</span>
                            <span>System validates the file automatically</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-purple-600">3.</span>
                            <span>Review validation results and warnings</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-purple-600">4.</span>
                            <span>Click "Start Restore" to begin</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-purple-600">5.</span>
                            <span>Monitor progress and review results</span>
                        </li>
                    </ol>
                </div>

                {/* Action Button */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
                    >
                        <Database size={24} />
                        Start Data Restore
                    </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-green-600 font-semibold mb-2">✓ Safe</div>
                        <div className="text-sm text-gray-600">
                            Validates data before import
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-blue-600 font-semibold mb-2">✓ Smart</div>
                        <div className="text-sm text-gray-600">
                            Automatically skips duplicates
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-purple-600 font-semibold mb-2">✓ Fast</div>
                        <div className="text-sm text-gray-600">
                            Batch processing for efficiency
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <DataRestoreModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    setShowModal(false);
                    navigate('/leagues');
                }}
            />
        </div>
    );
};

export default DataRestore;
```

Then add route in `App.tsx`:

```typescript
import DataRestore from './pages/DataRestore';

// In your routes:
<Route path="/restore" element={<DataRestore />} />
```

---

## 📝 Testing the System

### Test File
Use your existing `leagues-final-import.json` file.

### Test Steps
1. Open the restore modal
2. Select `leagues-final-import.json`
3. Wait for validation (should show ~48 leagues, ~830 matches)
4. Review any warnings
5. Click "Start Restore"
6. Monitor progress
7. Verify results

### Expected Results
- ✅ All leagues imported (or skipped if duplicates)
- ✅ All matches imported (or skipped if duplicates)
- ✅ No critical errors
- ⚠️ Warnings about duplicates are normal

---

## 🐛 Troubleshooting

### If validation fails:
1. Check file format (must be valid JSON)
2. Verify required fields exist
3. Check file size (< 50MB)

### If restore is slow:
- Normal for large files (830 matches = ~40 seconds)
- Don't close the window
- Progress bar shows current status

### If errors occur:
- Check browser console for details
- Review error messages in the modal
- Verify user IDs exist in database

---

## 🎨 Customization

### Change Colors
Edit `components/DataRestoreModal.tsx`:
- Purple → Your brand color
- Update `bg-purple-600`, `text-purple-600`, etc.

### Change Batch Sizes
Edit `services/dataRestore.ts`:
- Line ~370: `const batchSize = 10;` (leagues)
- Line ~410: `const batchSize = 50;` (matches)

### Add More Validation
Edit `services/dataRestore.ts`:
- Add custom rules in `validateFile()` method
- Check for specific data requirements

---

## 📊 System Architecture

```
User Interface (DataRestoreModal.tsx)
           ↓
    File Selection & Upload
           ↓
   Validation (dataRestore.ts)
           ↓
    Progress Tracking
           ↓
  Batch Processing (Leagues → Matches)
           ↓
    Database Insert (Supabase)
           ↓
      Results Display
```

---

## ✅ Checklist

- [x] Type definitions created
- [x] Core service implemented
- [x] UI modal component created
- [x] Documentation written
- [ ] Integrated into Settings page (manual step)
- [ ] Tested with real data
- [ ] Deployed to production

---

## 🚀 Next Steps

1. **Integrate** the restore button into your Settings page (or create standalone page)
2. **Test** with your `leagues-final-import.json` file
3. **Verify** data appears correctly in the app
4. **Deploy** to production
5. **Document** for your users

---

**Created:** 2026-01-06  
**Version:** 1.0.0  
**Status:** Ready for Integration ✅
