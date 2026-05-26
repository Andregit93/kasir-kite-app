import React from 'react';
import { XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const CategoryModal = ({
  isOpen,
  isEdit,
  onClose,
  form,
  initialData,
  onSave,
  errors = {},
  onNameChange,
  onColorChange,
  isSaving
}) => {
  if (!isOpen) return null;

  const maxLength = 255;
  const currentLength = form.name?.length || 0;

  // Manual dirty check for robustness across Inertia versions
  const isChanged = !isEdit || (
    (form.name || '') !== (initialData?.name || '') ||
    (form.color || '') !== (initialData?.color || '')
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 font-manrope">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-black uppercase text-slate-800 tracking-tight">
              {isEdit ? 'Edit Kategori' : 'Kategori Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            <XCircle size={22} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-5">
          {/* Input Name */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end mb-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Nama Kategori
              </label>
              <span className={`text-[9px] font-bold tabular-nums ${currentLength > maxLength ? 'text-red-500' : 'text-slate-400'}`}>
                {currentLength}/{maxLength}
              </span>
            </div>
            <div className="relative">
              <input
                autoFocus
                value={form.name || ''}
                onChange={onNameChange}
                maxLength={maxLength}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 ${errors.name
                  ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 text-red-900 placeholder:text-red-300'
                  : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700'
                  }`}
              />
            </div>
            {errors.name && (
              <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1 animate-in slide-in-from-top-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Aksen Warna
              </label>
              <div
                className="w-5 h-2 rounded-full transition-all"
                style={{ backgroundColor: form.color || '#2563eb' }}
              />
            </div>
            <div className="flex flex-wrap gap-2.5">
              {['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#475569'].map(hex => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onColorChange(hex)}
                  style={{ backgroundColor: hex }}
                  className={`w-8 h-8 rounded-xl border-4 transition-all hover:scale-110 active:scale-90 ${(form.color || '').toLowerCase() === hex.toLowerCase()
                    ? 'border-white shadow-xl shadow-slate-200 ring-2 ring-slate-800 scale-110'
                    : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving || !isChanged}
            className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group ${isSaving || !isChanged
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
              : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10 active:scale-95'
              }`}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
              </>
            ) : (
              <span>{isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH KATEGORI'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
