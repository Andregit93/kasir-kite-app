import React from 'react';
import { XCircle, Camera, Loader2 } from 'lucide-react';

const ProductModal = ({
  isOpen,
  isEdit,
  onClose,
  form,
  onSave,
  categories,
  photoPreview,
  onPhotoChange,
  trackStock,
  setTrackStock,
  photoInputRef,
  isSaving,
  initialData
}) => {
  if (!isOpen) return null;

  const isChanged = !isEdit || (
    (form.data.name || '') !== (initialData?.name || '') ||
    String(form.data.category_id || '') !== String(initialData?.category_id || '') ||
    (form.data.price || '') !== (initialData?.price || '') ||
    (form.data.barcode || '') !== (initialData?.barcode || '') ||
    form.data.image !== null ||
    trackStock !== (initialData?.trackStock ?? true) ||
    (trackStock && (form.data.stock || '') !== (initialData?.stock || ''))
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-5 animate-in zoom-in-95 font-manrope">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-base font-black uppercase text-slate-800 tracking-tight">
              {isEdit ? 'Edit Produk' : 'Produk Baru'}
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
          {/* Foto Produk */}
          <div className="flex flex-col items-center gap-1 mb-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Foto Produk
            </label>
            <div
              onClick={() => !isSaving && photoInputRef.current?.click()}
              className={`w-14 h-14 rounded-xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all duration-300 ${
                form.errors.image
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
            {form.errors.image && (
              <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                {form.errors.image}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Nama Produk */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Nama Produk
              </label>
              <input
                required
                disabled={isSaving}
                placeholder="E.g. Kopi Susu"
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

            {/* Kategori */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Kategori
              </label>
              <select
                disabled={isSaving}
                value={form.data.category_id}
                onChange={e => { form.setData('category_id', e.target.value); form.clearErrors('category_id'); }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-4 ${
                  form.errors.category_id
                    ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 text-red-900'
                    : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700'
                }`}
              >
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {form.errors.category_id && (
                <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                  {form.errors.category_id}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Harga */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Harga Jual
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
                <input
                  required
                  disabled={isSaving}
                  placeholder="0"
                  value={form.data.price}
                  onChange={e => {
                    form.setData('price', e.target.value.replace(/\D/g, "") ? parseInt(e.target.value.replace(/\D/g, "")).toLocaleString("id-ID") : "");
                    form.clearErrors('price');
                  }}
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-4 ${
                    form.errors.price
                      ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 text-red-900 placeholder:text-red-300'
                      : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700'
                  }`}
                />
              </div>
              {form.errors.price && (
                <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                  {form.errors.price}
                </p>
              )}
            </div>

            {/* Barcode */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Kode Barcode
              </label>
              <input
                disabled={isSaving}
                placeholder="E.g. 899..."
                value={form.data.barcode}
                onChange={e => { form.setData('barcode', e.target.value); form.clearErrors('barcode'); }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-4 ${
                  form.errors.barcode
                    ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 text-red-900 placeholder:text-red-300'
                    : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700'
                }`}
              />
              {form.errors.barcode && (
                <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                  {form.errors.barcode}
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 tracking-widest">
              <span>Lacak Stok</span>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setTrackStock(!trackStock)}
                className={`w-9 h-[22px] rounded-full transition-colors relative focus:outline-none ${
                  trackStock ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all ${
                  trackStock ? 'left-4' : 'left-0.5'
                }`} />
              </button>
            </div>
            {trackStock && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Jumlah Stok
                </label>
                <input
                  type="number"
                  disabled={isSaving}
                  min="0"
                  value={form.data.stock}
                  onChange={e => { form.setData('stock', e.target.value); form.clearErrors('stock'); }}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-4 ${
                    form.errors.stock
                      ? 'border-red-300 bg-red-50/30 focus:ring-red-500/10 text-red-900'
                      : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700'
                  }`}
                />
                {form.errors.stock && (
                  <p className="text-[9px] text-red-500 font-bold mt-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                    {form.errors.stock}
                  </p>
                )}
              </div>
            )}
          </div>

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
              <span>{isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH PRODUK'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
