import React, { useRef, useState, useEffect } from 'react';
import { Store, Camera, Settings as SettingsIcon, Shield, Image as ImageIcon, Percent, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';

const SettingsTab = React.memo(({
  initialStore,
  user,
  showToast
}) => {
  const logoInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(initialStore?.logo_url || null);

  const profileForm = useForm({
    name: initialStore?.name || '',
    phone: initialStore?.phone || '',
    address: initialStore?.address || '',
    logo: null,
  });

  const taxForm = useForm({
    tax_enabled: initialStore?.tax_enabled || false,
    tax_percentage: initialStore?.tax_percentage || 0,
  });

  const securityForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    const freshData = {
      name: initialStore?.name || '',
      phone: initialStore?.phone || '',
      address: initialStore?.address || '',
      logo: null,
    };
    profileForm.setDefaults(freshData);
    profileForm.setData(freshData);
    setLogoPreview(initialStore?.logo_url || null);
  }, [initialStore]);

  useEffect(() => {
    const freshTax = {
      tax_enabled: initialStore?.tax_enabled || false,
      tax_percentage: initialStore?.tax_percentage || 0,
    };
    taxForm.setDefaults(freshTax);
    taxForm.setData(freshTax);
  }, [initialStore]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    profileForm.clearErrors('logo');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      profileForm.setError('logo', 'Format logo harus berupa JPG, JPEG, PNG, atau WEBP.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      profileForm.setError('logo', 'Ukuran logo maksimal adalah 2MB.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    profileForm.setData('logo', file);
    setLogoPreview(URL.createObjectURL(file));
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const saveProfile = (e) => {
    e.preventDefault();
    profileForm.transform((data) => {
      const payload = { ...data };
      if (!(payload.logo instanceof File)) {
        delete payload.logo;
      }
      return payload;
    });

    profileForm.post('/admin/profile', {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: (page) => {
        const updatedStore = page.props.initialStore;
        const freshData = {
          name: updatedStore?.name || '',
          phone: updatedStore?.phone || '',
          address: updatedStore?.address || '',
          logo: null,
        };
        profileForm.setDefaults(freshData);
        profileForm.reset();
      }
    });
  };

  const saveTax = (e) => {
    e.preventDefault();

    // Explicit frontend validation
    if (taxForm.data.tax_enabled) {
      if (taxForm.data.tax_percentage === '' || taxForm.data.tax_percentage === null || taxForm.data.tax_percentage === undefined) {
        taxForm.setError('tax_percentage', 'Persentase pajak tidak boleh kosong saat PPN aktif.');
        return;
      }
      if (parseFloat(taxForm.data.tax_percentage) < 0) {
        taxForm.setError('tax_percentage', 'Pajak tidak boleh kurang dari 0%.');
        return;
      }
    }

    taxForm.clearErrors();
    taxForm.post('/admin/profile', {
      preserveScroll: true,
      onSuccess: (page) => {
        const updatedStore = page.props.initialStore;
        const freshTax = {
          tax_enabled: updatedStore?.tax_enabled || false,
          tax_percentage: updatedStore?.tax_percentage || 0,
        };
        taxForm.setDefaults(freshTax);
        taxForm.reset();
      }
    });
  };

  const saveSecurity = (e) => {
    e.preventDefault();
    securityForm.put('/admin/security/password', {
      preserveScroll: true,
      onSuccess: () => {
        securityForm.reset();
      }
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-[1000px] mx-auto space-y-6 pb-20 px-4 sm:px-0">

      {/* ─── CARD 1: PROFIL TOKO (LOGO + IDENTITY) ─── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/30 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/30">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-500/50 shrink-0">
            <Store size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-black text-slate-800 tracking-tight truncate">Profil Toko</h3>
            <p className="text-[10px] font-black text-slate-500 mt-0.5 uppercase tracking-[0.15em] line-clamp-1">Informasi dan Kontak Toko.</p>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <form onSubmit={saveProfile} className="space-y-3">
            <div className="flex flex-col lg:flex-row gap-5 lg:gap-12">

              {/* Logo Column */}
              <div className="flex flex-col items-center gap-4 shrink-0 lg:pt-2">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center text-slate-400 overflow-hidden cursor-pointer group/logo relative shadow-inner transition-all hover:border-blue-500 hover:text-blue-500"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover transition-transform group-hover/logo:scale-110" />
                  ) : (
                    <ImageIcon size={40} className="transition-transform group-hover/logo:scale-110" />
                  )}

                  {profileForm.progress && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white text-xs font-black">{Math.round(profileForm.progress.percentage)}%</span>
                      <progress value={profileForm.progress.percentage} max="100" className="w-3/4 h-1 mt-2 rounded-full overflow-hidden" />
                    </div>
                  )}

                  {!profileForm.progress && (
                    <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center text-white text-[11px] font-black uppercase text-center p-4 transition-all duration-300 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Camera size={24} />
                        <span>Update Logo</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logo Struk Digital</p>
                  <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/jpeg,image/png,image/webp" className="hidden" />
                  <button type="button" onClick={() => logoInputRef.current?.click()} className="mt-3 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl hover:bg-white hover:border-blue-500 hover:text-blue-600 active:scale-95 transition-all uppercase tracking-wider shadow-sm">
                    Ganti Foto
                  </button>
                  <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1.5">
                    JPG, JPEG, PNG, WEBP (Maks. 2MB)
                  </p>
                  {profileForm.errors.logo && (
                    <p className="text-[10px] font-bold text-red-500 mt-2 animate-in slide-in-from-top-1">{profileForm.errors.logo}</p>
                  )}
                </div>
              </div>

              {/* Fields Column */}
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nama Toko</label>
                    <input
                      value={profileForm.data.name}
                      onChange={e => { profileForm.setData('name', e.target.value); profileForm.clearErrors('name'); }}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold shadow-sm transition-all placeholder:text-slate-400 ${profileForm.errors.name ? 'border-red-400 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-800'}`}
                      placeholder="Contoh: Toko KasirKite Jaya"
                    />
                    {profileForm.errors.name && <p className="text-[10px] font-bold text-red-500 px-1">{profileForm.errors.name}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nomor Telepon</label>
                    <input
                      value={profileForm.data.phone}
                      onChange={e => { profileForm.setData('phone', e.target.value); profileForm.clearErrors('phone'); }}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold shadow-sm transition-all placeholder:text-slate-400 ${profileForm.errors.phone ? 'border-red-400 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-800'}`}
                      placeholder="08123XXX"
                    />
                    {profileForm.errors.phone && <p className="text-[10px] font-bold text-red-500 px-1">{profileForm.errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Alamat Lengkap</label>
                  <textarea
                    value={profileForm.data.address}
                    onChange={e => { profileForm.setData('address', e.target.value); profileForm.clearErrors('address'); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[85px] shadow-sm text-xs font-bold transition-all placeholder:text-slate-400 resize-none ${profileForm.errors.address ? 'border-red-400 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-800'}`}
                    placeholder="Sebutkan alamat detail untuk struk..."
                  ></textarea>
                  {profileForm.errors.address && <p className="text-[10px] font-bold text-red-500 px-1">{profileForm.errors.address}</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-center sm:justify-end">
              <button
                type="submit"
                disabled={!profileForm.isDirty || profileForm.processing}
                className={`relative w-full max-w-xs mx-auto sm:mx-0 sm:w-auto sm:max-w-none sm:px-10 py-3 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest flex justify-center items-center gap-2 ${profileForm.processing
                  ? 'bg-blue-400 cursor-not-allowed text-white shadow-inner'
                  : (profileForm.isDirty
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  )
                  }`}
              >
                <span className={profileForm.processing ? 'opacity-0 invisible' : ''}>
                  Simpan Perubahan Profil
                </span>
                {profileForm.processing && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── CARD 2: PAJAK & BIAYA (PPN) ─── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/30 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/30">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-500/50 shrink-0">
            <Percent size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-black text-slate-800 tracking-tight truncate">Konfigurasi Pajak</h3>
            <p className="text-[10px] font-black text-slate-500 mt-0.5 uppercase tracking-[0.15em] line-clamp-1">Pengaturan PPN Transaksi.</p>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-3">
          <form onSubmit={saveTax} className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 gap-3">
              <div className="flex-1">
                <p className="text-sm font-black text-slate-700 uppercase tracking-wider">Status Aktif PPN</p>
                <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed max-w-md">Aktifkan untuk menambahkan biaya Pajak Pertambahan Nilai (PPN) secara otomatis pada setiap transaksi di kasir.</p>
              </div>
              <button
                type="button"
                onClick={() => taxForm.setData('tax_enabled', !taxForm.data.tax_enabled)}
                className={`relative w-14 h-8 transition-colors duration-300 rounded-full focus:outline-none shrink-0 ${taxForm.data.tax_enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${taxForm.data.tax_enabled ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
              </button>
            </div>

            {taxForm.data.tax_enabled && (
              <div className="p-4 bg-blue-50/50 rounded-[1.5rem] border border-blue-100/50 space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="max-w-xs space-y-1">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest pl-1">Besar Persentase Pajak (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      required={taxForm.data.tax_enabled}
                      value={taxForm.data.tax_percentage}
                      onChange={e => { taxForm.setData('tax_percentage', e.target.value); taxForm.clearErrors('tax_percentage'); }}
                      className={`w-full pl-5 pr-12 py-2.5 bg-white border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-black shadow-sm transition-all ${taxForm.errors.tax_percentage ? 'border-red-400 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-800'}`}
                      placeholder="0"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">%</span>
                  </div>
                  {taxForm.errors.tax_percentage && <p className="text-[10px] font-bold text-red-500 px-1">{taxForm.errors.tax_percentage}</p>}
                </div>
                <p className="text-[10px] font-bold text-blue-600/90 italic leading-relaxed">Persentase ini akan digunakan untuk menghitung nilai nominal pajak dari total harga produk di setiap invoice.</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-center sm:justify-end">
              <button
                type="submit"
                disabled={!taxForm.isDirty || taxForm.processing}
                className={`relative w-full max-w-xs mx-auto sm:mx-0 sm:w-auto sm:max-w-none sm:px-10 py-3 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest flex justify-center items-center gap-2 ${taxForm.processing
                  ? 'bg-emerald-400 cursor-not-allowed text-white shadow-inner'
                  : (taxForm.isDirty
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  )
                  }`}
              >
                <span className={taxForm.processing ? 'opacity-0 invisible' : ''}>
                  Simpan Pengaturan Pajak
                </span>
                {taxForm.processing && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── CARD 3: KEAMANAN AKUN ─── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/30 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/30">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg border border-slate-800 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Keamanan Akun</h3>
            <p className="text-[10px] font-black text-slate-500 mt-0.5 uppercase tracking-[0.1em]">Proteksi autentikasi Super Administrator.</p>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <form onSubmit={saveSecurity} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Toko</label>
              <div className="relative">
                <input
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-500 cursor-not-allowed text-xs"
                  defaultValue={user?.email}
                  disabled
                />
                <SettingsIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 pl-1">Email ini digunakan sebagai kredensial utama dan tidak dapat diubah oleh pemilik tenant demi keamanan struk pembayaran.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Password Saat Ini</label>
              <input
                type="password"
                value={securityForm.data.current_password}
                onChange={e => { securityForm.setData('current_password', e.target.value); securityForm.clearErrors('current_password'); }}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold transition-all placeholder:text-slate-400 shadow-sm ${securityForm.errors.current_password ? 'border-red-400 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-800'}`}
                placeholder="Masukkan password Anda saat ini"
              />
              {securityForm.errors.current_password && <p className="text-[10px] font-bold text-red-500 px-1">{securityForm.errors.current_password}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Password Baru</label>
                <input
                  type="password"
                  value={securityForm.data.password}
                  onChange={e => { securityForm.setData('password', e.target.value); securityForm.clearErrors('password'); }}
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold transition-all placeholder:text-slate-400 shadow-sm ${securityForm.errors.password ? 'border-red-400 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-800'}`}
                  placeholder="Minimal 8 karakter"
                />
                {securityForm.errors.password && <p className="text-[10px] font-bold text-red-500 px-1">{securityForm.errors.password}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Ulangi Password Baru</label>
                <input
                  type="password"
                  value={securityForm.data.password_confirmation}
                  onChange={e => { securityForm.setData('password_confirmation', e.target.value); securityForm.clearErrors('password_confirmation'); }}
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold transition-all placeholder:text-slate-400 shadow-sm ${securityForm.errors.password_confirmation || (securityForm.data.password_confirmation && securityForm.data.password !== securityForm.data.password_confirmation) ? 'border-red-400 text-red-600' : 'border-slate-200 focus:border-blue-500 text-slate-800'}`}
                  placeholder="Ketik ulang password"
                />
                {securityForm.errors.password_confirmation && <p className="text-[10px] font-bold text-red-500 px-1">{securityForm.errors.password_confirmation}</p>}
                {!securityForm.errors.password_confirmation && securityForm.data.password_confirmation && securityForm.data.password !== securityForm.data.password_confirmation && (
                  <p className="text-[10px] font-bold text-red-500 px-1">Password tidak cocok.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-center sm:justify-end">
              <button
                type="submit"
                disabled={securityForm.processing || !securityForm.isDirty || securityForm.data.password !== securityForm.data.password_confirmation}
                className={`relative w-full max-w-xs mx-auto sm:mx-0 sm:w-auto sm:max-w-none sm:px-10 py-3 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest flex justify-center items-center gap-2 ${securityForm.processing
                  ? 'bg-slate-700 cursor-not-allowed text-white shadow-inner'
                  : (!securityForm.processing && securityForm.isDirty && securityForm.data.password === securityForm.data.password_confirmation
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/30 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  )}`}
              >
                <span className={securityForm.processing ? 'opacity-0 invisible' : ''}>
                  Perbarui Keamanan
                </span>
                {securityForm.processing && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );

});

export default SettingsTab;
