import React from 'react';
import { XCircle, Camera, Loader2 } from 'lucide-react';

const CashierModal = ({
  isOpen,
  isEdit,
  onClose,
  form,
  onSave,
  photoPreview,
  onPhotoChange,
  photoInputRef,
  isSaving,
  initialData
}) => {
  if (!isOpen) return null;

  const isChanged = !isEdit || (
    (form.data.name || '') !== (initialData?.name || '') ||
    (form.data.email || '') !== (initialData?.email || '') ||
    (form.data.password || '') !== '' ||
    form.data.photo !== null
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm p-5 animate-in zoom-in-95 font-manrope">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-base font-black uppercase text-slate-800 tracking-tight">
              {isEdit ? 'Edit Kasir' : 'Kasir Baru'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-3">
          {/* Foto Profil Kasir */}
          <div className="flex flex-col items-center gap-1 mb-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Foto Profil
            </label>
            <div
              onClick={() => !isSaving && photoInputRef.current?.click()}
              className={`w-14 h-14 rounded-full bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all duration-300 ${
                form.errors.photo
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-slate-200 hover:border-blue-500 hover:bg-slate-100/50'
              }`}
            >
              {photoPreview ? (
                <div className="w-full h-full relative">
                  <img src={photoPreview} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" size={16} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-0.5 text-slate-400 group-hover:text-blue-500 transition-colors">
                  <Camera size={16} />
                  <span className="text-[8px] font-black uppercase tracking-wider">Upload</span>
                </div>
              )}
              {form.progress && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                  <Loader2 size={14} className="animate-spin text-white mb-0.5" />
                  <span className="text-white text-[8px] font-bold">{Math.round(form.progress.percentage)}%</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={photoInputRef}
              onChange={onPhotoChange}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSaving}
            />
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              JPG, JPEG, PNG, WEBP (Maks. 2MB)
            </p>
            {form.errors.photo && (
              <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                {form.errors.photo}
              </p>
            )}
          </div>

          {/* Nama Lengkap */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Nama Lengkap
            </label>
            <input
              required
              disabled={isSaving}
              placeholder="E.g. Budi Santoso"
              value={form.data.name}
              onChange={e => { form.setData('name', e.target.value); form.clearErrors('name'); }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-4 ${
                form.errors.name
                  ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 text-red-900 placeholder:text-red-300'
                  : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700'
              }`}
            />
            {form.errors.name && (
              <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                {form.errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Email
            </label>
            <input
              required
              type="email"
              disabled={isSaving || isEdit}
              placeholder="budi@email.com"
              value={form.data.email}
              onChange={e => { form.setData('email', e.target.value); form.clearErrors('email'); }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-4 ${
                isEdit ? 'opacity-50 cursor-not-allowed border-slate-200 text-slate-500' :
                form.errors.email
                  ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 text-red-900 placeholder:text-red-300'
                  : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700'
              }`}
            />
            {form.errors.email && (
              <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                {form.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              disabled={isSaving}
              placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
              value={form.data.password}
              onChange={e => { form.setData('password', e.target.value); form.clearErrors('password'); }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-4 ${
                form.errors.password
                  ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 text-red-900 placeholder:text-red-300'
                  : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700'
              }`}
            />
            {form.errors.password && (
              <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                {form.errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving || !isChanged}
            className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group ${
              isSaving || !isChanged
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
                : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10 active:scale-95'
            }`}
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <span>{isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH KASIR'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CashierModal;
