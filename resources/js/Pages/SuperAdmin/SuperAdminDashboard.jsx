import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
  Activity, Store, LogOut, Plus, Search, XCircle, ShieldCheck,
  Users, Wallet, Receipt, Eye, KeyRound, Edit3, Trash2, RotateCcw, Building, AlertTriangle, Menu, X
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import useMobileNav from '../../hooks/useMobileNav';
import { useToast } from '@/Contexts/ToastContext';

// Global flag for greeting persistence - DEPRECATED: moved to state
export default function SuperAdminDashboard() {
  const { auth, stats: serverStats, tenants: serverTenants } = usePage().props;
  const user = auth?.user;

  const [activeTab, setActiveTab] = useState('overview');
  const [greetingShown, setGreetingShown] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();
  const mobileNav = useMobileNav();

  const logout = () => router.post('/logout');

  // Komponen loading inline
  const InlineSpinner = ({ label, className = '' }) => (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      {label && <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">{label}</p>}
    </div>
  );

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', text: '', actionLabel: '', isDestructive: false, onConfirm: null });

  // DATA STATE (From Server Props)
  const [stats, setStats] = useState(serverStats || { totalTenants: 0, totalUsers: 0, totalTransactions: 0, systemRevenue: 0 });
  const [tenants, setTenants] = useState(serverTenants || []);
  const [searchQuery, setSearchQuery] = useState('');

  // MODAL STATE
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ storeName: '', adminName: '', adminEmail: '', adminPassword: '' });

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsTab, setDetailsTab] = useState('overview');
  const [selectedTenantDetails, setSelectedTenantDetails] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const [editNameModal, setEditNameModal] = useState({ show: false, tenantId: null, currentName: '', newName: '' });
  const [resetPwdModal, setResetPwdModal] = useState({ show: false, userId: null, userName: '', newPassword: '' });

  // --- WELCOME GREETING ---
  useEffect(() => {
    const flash = usePage().props.flash;
    if (flash?.welcome && user && !greetingShown) {
      setGreetingShown(true);
      const hours = new Date().getHours();
      let greeting = 'Selamat Pagi';
      let toastType = 'greeting_morning';
      
      if (hours >= 4 && hours < 10) { greeting = 'Selamat Pagi'; toastType = 'greeting_morning'; }
      else if (hours >= 10 && hours < 15) { greeting = 'Selamat Siang'; toastType = 'greeting_afternoon'; }
      else if (hours >= 15 && hours < 18) { greeting = 'Selamat Sore'; toastType = 'greeting_evening'; }
      else { greeting = 'Selamat Malam'; toastType = 'greeting_night'; }

      showToast(`${greeting}, ${user.name}! Masuk sebagai Super Admin.`, toastType, 5000);
    }
  }, [user, showToast]);

  // Update stat & tenants jika props berubah
  useEffect(() => {
    if (serverStats) setStats(serverStats);
    if (serverTenants) setTenants(serverTenants);
  }, [serverStats, serverTenants]);

  // Flash message sync
  useEffect(() => {
    const flash = usePage().props.flash;
    if (flash?.success) showToast(flash.success, 'success');
    if (flash?.error) showToast(flash.error, 'error');
  }, [usePage().props.flash, showToast]);

  // Inertia router callbacks helpers
  const routerCallbacks = {
    onSuccess: () => {
      showToast('Aksi berhasil dilakukan!', 'success');
      setIsProcessing(false);
    },
    onError: (errors) => {
      showToast(Object.values(errors)[0] || 'Gagal tersimpan, cek form anda.', 'error');
      setIsProcessing(false);
    },
    onFinish: () => setIsProcessing(false)
  };

  const handleCreateTenant = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    router.post('/super-admin/tenants', formData, {
      onSuccess: () => {
        showToast('Toko & Akun Bos berhasil dibuat!');
        setShowCreateModal(false); setFormData({ storeName: '', adminName: '', adminEmail: '', adminPassword: '' });
      },
      ...routerCallbacks
    });
  };

const viewTenantDetails = async (tenant) => {
  try {
    const res = await axiosInstance.get(`/super-admin/tenants/${tenant.id}/details`);
    setSelectedTenantDetails(res.data.data); setShowDetailsModal(true);
  } catch (error) { showToast('Gagal mengambil detail toko', 'error'); }
};

// Edit Nama Toko
const openEditNameModal = (tenant) => {
  setEditNameModal({ show: true, tenantId: tenant.id, currentName: tenant.name, newName: tenant.name });
};
const submitEditName = async (e) => {
  e.preventDefault();
  if (!editNameModal.newName || editNameModal.newName === editNameModal.currentName) return setEditNameModal({ ...editNameModal, show: false });
  setIsProcessing(true);
  router.put(`/super-admin/tenants/${editNameModal.tenantId}/name`, { name: editNameModal.newName }, {
    onSuccess: () => {
      showToast('Nama toko berhasil diperbarui!');
      setSelectedTenant({ ...selectedTenant, name: editNameModal.newName });
      setEditNameModal({ show: false, tenantId: null, currentName: '', newName: '' });
    },
    ...routerCallbacks
  });
};

// 2. Reset Password
const openResetPwdModal = (userId, userName) => {
  setResetPwdModal({ show: true, userId, userName, newPassword: '' });
};
const submitResetPwd = async (e) => {
  e.preventDefault();
  if (resetPwdModal.newPassword.length < 6) { showToast('Password minimal 6 karakter!', 'error'); return; }
  setIsProcessing(true);
  router.put(`/super-admin/users/${resetPwdModal.userId}/reset-password`, { newPassword: resetPwdModal.newPassword }, {
    onSuccess: () => {
      showToast(`Password ${resetPwdModal.userName} berhasil direset!`, 'success');
      setResetPwdModal({ show: false, userId: null, userName: '', newPassword: '' });
    },
    ...routerCallbacks
  });
};

// 3. Arsip/Pulihkan Toko
const handleToggleStatus = (tenantId, currentStatus) => {
  const actionText = currentStatus ? 'Mengarsipkan' : 'Memulihkan';
  setConfirmDialog({
    isOpen: true,
    title: `${actionText} Toko`,
    text: `Yakin ingin ${actionText.toLowerCase()} toko ini? ${currentStatus ? 'Admin dan kasir toko ini tidak akan bisa login lagi ke dalam sistem.' : 'Toko berhasil dipulihkan.'}`,
    actionLabel: `Ya, ${actionText}`,
    isDestructive: currentStatus, // Jika mengarsipkan, tombolnya merah. Jika memulihkan, hijau/biru.
    onConfirm: () => {
      router.put(`/super-admin/tenants/${tenantId}/status`, { is_active: !currentStatus }, {
        onSuccess: () => {
          showToast(`Toko berhasil ${!currentStatus ? 'dipulihkan' : 'diarsipkan'}!`);
          setShowDetailsModal(false);
          setConfirmDialog({ isOpen: false });
        },
        ...routerCallbacks
      });
    }
  });
};

const filteredTenants = tenants.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

return (
  <div className="flex h-screen bg-slate-50 font-manrope overflow-hidden text-slate-900 relative">

    {/* ALERTS & GLOBAL CONFIRM DIALOG - Managed by ToastProvider */}


    {confirmDialog.isOpen && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmDialog.isDestructive ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">{confirmDialog.title}</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">{confirmDialog.text}</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDialog({ isOpen: false })} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Batal</button>
            <button onClick={confirmDialog.onConfirm} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${confirmDialog.isDestructive ? 'bg-red-600 shadow-red-200 hover:bg-red-700' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}>
              {confirmDialog.actionLabel}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* SIDEBAR — Desktop: fixed, Mobile: sliding drawer */}
    <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col shrink-0 z-10">
      <div className="p-6 flex items-center gap-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-200 overflow-hidden">
          KK
        </div>
        <div className="flex-1 overflow-hidden">
          <h1 className="text-slate-800 font-black text-lg tracking-tight truncate">KasirKite</h1>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest truncate">Super Admin</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={20} />} label="Dashboard Utama" />
        <NavItem active={activeTab === 'tenants'} onClick={() => setActiveTab('tenants')} icon={<Building size={20} />} label="Manajemen Klien" />
      </nav>
      <div className="p-4 border-t border-slate-100 text-center">
        <div className="mb-4 px-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Login Sebagai:</p><p className="text-sm font-bold text-slate-700 truncate">{user?.email}</p></div>
        <button onClick={() => { logout(); }} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 rounded-xl transition-all font-bold text-sm"><LogOut size={18} /> Keluar</button>
      </div>
    </aside>

    {/* MOBILE SIDEBAR OVERLAY */}
    {mobileNav.isOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={mobileNav.close} />
        <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg">KK</div>
              <h1 className="text-slate-800 font-black text-lg">KasirKite</h1>
            </div>
            <button onClick={mobileNav.close} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
          </div>
          <nav className="flex-1 p-4 space-y-2 mt-2">
            <NavItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); mobileNav.close(); }} icon={<Activity size={20} />} label="Dashboard Utama" />
            <NavItem active={activeTab === 'tenants'} onClick={() => { setActiveTab('tenants'); mobileNav.close(); }} icon={<Building size={20} />} label="Manajemen Klien" />
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button onClick={() => { logout(); }} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm"><LogOut size={18} />Keluar</button>
          </div>
        </aside>
      </div>
    )}

    {/* MAIN CONTENT */}
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={mobileNav.toggle} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><Menu size={22} /></button>
          <h2 className="text-lg lg:text-2xl font-black text-slate-800 tracking-tight capitalize">{activeTab === 'overview' ? 'Radar Ekosistem Global' : 'Manajemen Klien (Toko)'}</h2>
        </div>
      </header>

      <section className="p-4 lg:p-8 overflow-y-auto flex-1 custom-scrollbar">
        {/* TAB 1: OVERVIEW */}
        <div className={activeTab === 'overview' ? 'block space-y-6 max-w-6xl mx-auto' : 'hidden'}>
          <div className="bg-blue-600 p-8 rounded-3xl shadow-lg shadow-blue-200 text-white mb-8">
            <h2 className="text-3xl font-black tracking-tight mb-2">Selamat Datang!</h2>
            <p className="text-blue-100 font-medium">Pantau dan kelola seluruh Toko yang menggunakan KasirKite di sini.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingData ? (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-7"><InlineSpinner className="py-4" /></div>
                <div className="bg-white rounded-2xl border border-slate-200 p-7"><InlineSpinner className="py-4" /></div>
                <div className="bg-white rounded-2xl border border-slate-200 p-7"><InlineSpinner className="py-4" /></div>
                <div className="bg-white rounded-2xl border border-slate-200 p-7"><InlineSpinner className="py-4" /></div>
              </>
            ) : (
              <>
                <StatCard icon={<Building size={28} />} color="blue" label="Toko Aktif" value={`${stats.totalTenants} Toko`} />
                <StatCard icon={<Users size={28} />} color="emerald" label="Pengguna Aktif" value={`${stats.totalUsers} Orang`} />
                <StatCard icon={<Receipt size={28} />} color="blue" label="Transaksi" value={`${stats.totalTransactions} Nota`} />
                <StatCard icon={<Wallet size={28} />} color="emerald" label="Total Transaksi" value={`Rp ${stats.systemRevenue?.toLocaleString('id-ID')}`} />
              </>
            )}
          </div>
        </div>

        {/* TAB 2: TENANTS */}
        <div className={activeTab === 'tenants' ? 'block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden max-w-6xl mx-auto' : 'hidden'}>
          <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
            <div className="relative w-full md:w-80"><Search className="absolute left-4 top-3.5 text-slate-400" size={18} /><input placeholder="Cari toko..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-blue-500 transition-all" /></div>
            <button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all"><Plus size={20} /> TAMBAH TOKO</button>
          </div>
          {loadingData ? (
            <InlineSpinner label="Memuat data toko..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase font-black tracking-widest border-b">
                  <tr><th className="px-6 py-4">Informasi Toko</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Jumlah Akun</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                </thead>
                <tbody className="divide-y text-sm font-medium text-slate-700 bg-white">
                  {filteredTenants.length === 0 ? (<tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-bold">Belum ada toko terdaftar.</td></tr>) : (
                    filteredTenants.map(t => (
                      <tr key={t.id} className={`transition-colors ${t.is_active ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60'}`}>
                        <td className="px-6 py-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">{t.logo_url ? <img src={t.logo_url} alt="Logo" className="w-full h-full object-cover grayscale" /> : <Store size={20} className="text-slate-400" />}</div>
                          <div><p className={`font-bold text-base ${t.is_active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{t.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.phone || 'Telp blm diatur'}</p></div>
                        </td>
                        <td className="px-6 py-4">{t.is_active ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Aktif</span> : <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Diarsipkan</span>}</td>
                        <td className="px-6 py-4 font-black text-blue-600">{t.users?.length || 0} Akun</td>
                        <td className="px-6 py-4 flex justify-center">
                          <button onClick={() => viewTenantDetails(t)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all"><Eye size={16} /> Kelola</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>

    {/* MODAL 1: DAFTAR KLIEN BARU */}
    {showCreateModal && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
          <div className="p-6 border-b border-slate-100 bg-blue-600 text-white flex justify-between items-center"><h3 className="text-lg font-black tracking-tight uppercase">Tambah Toko Baru</h3><button onClick={() => setShowCreateModal(false)} className="text-blue-200 hover:text-white hover:bg-blue-500 p-1.5 rounded-full transition-all"><XCircle size={20} /></button></div>
          <form onSubmit={handleCreateTenant} className="p-6 space-y-5">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Toko</label><input required value={formData.storeName} onChange={e => setFormData({ ...formData, storeName: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 ring-blue-500 outline-none font-bold text-sm" placeholder='Sembako Kite' /></div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 pb-2 border-b border-slate-200">Akun Pemilik Toko (Store Admin)</p>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</label><input required value={formData.adminName} onChange={e => setFormData({ ...formData, adminName: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 ring-blue-500 outline-none font-bold text-sm" placeholder="Doni Jaya" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label><input required type="email" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 ring-blue-500 outline-none font-bold text-sm" placeholder="toko@email.com" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label><input required type="password" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 ring-blue-500 outline-none font-bold text-sm" placeholder="••••••••" /></div>
            </div>
            <button disabled={isProcessing} className={`w-full py-3.5 rounded-xl font-black text-sm shadow-lg transition-all uppercase text-white ${isProcessing ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}>{isProcessing ? 'Memproses...' : 'Tambah & Buat Akun'}</button>
          </form>
        </div>
      </div>
    )}

    {/* MODAL 2: DETAIL TOKO & MANAJEMEN PEGAWAI (MULTI-TAB) */}
    {showDetailsModal && selectedTenantDetails && selectedTenant && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">

          {/* HEADER MODAL */}
          <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">{selectedTenant.name}</h3>
                <button onClick={() => openEditNameModal(selectedTenant)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Nama Toko"><Edit3 size={16} /></button>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal dibuat: {new Date(selectedTenant.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            {/* <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-all"><XCircle size={24}/></button> */}
          </div>

          {/* TAB NAVIGASI */}
          <div className="flex px-6 border-b border-slate-200 shrink-0">
            <button onClick={() => setDetailsTab('overview')} className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${detailsTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Riwayat Toko</button>
            <button onClick={() => setDetailsTab('employees')} className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${detailsTab === 'employees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Data Akun</button>
          </div>

          {/* KONTEN TAB OVERVIEW (KINERJA) */}
          {detailsTab === 'overview' && (
            <div className="p-6 bg-slate-50 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center"><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Produk</p><p className="text-xl font-black text-blue-600">{selectedTenantDetails.totalProducts} Produk</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center"><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Transaksi</p><p className="text-xl font-black text-emerald-600">{selectedTenantDetails.totalTransactions} Nota</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center"><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Pendapatan</p><p className="text-xl font-black text-slate-800">Rp {selectedTenantDetails.totalRevenue.toLocaleString('id-ID')}</p></div>
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Transaksi Terakhir</h4>
              <div className="bg-white rounded-xl border border-slate-200 max-h-48 overflow-y-auto custom-scrollbar">
                {selectedTenantDetails.recentTransactions.length === 0 ? (<p className="p-4 text-center text-sm font-bold text-slate-400">Belum ada transaksi.</p>) : (
                  <table className="w-full text-left text-sm"><tbody className="divide-y text-slate-700 font-medium">
                    {selectedTenantDetails.recentTransactions.map((trx, idx) => (<tr key={idx} className="hover:bg-slate-50"><td className="p-3 pl-4 text-xs font-bold text-slate-500">{new Date(trx.created_at).toLocaleString('id-ID')}</td><td className="p-3 pr-4 text-right font-black text-emerald-600">Rp {trx.total_amount.toLocaleString('id-ID')}</td></tr>))}
                  </tbody></table>
                )}
              </div>
            </div>
          )}

          {/* KONTEN TAB PEGAWAI */}
          {detailsTab === 'employees' && (
            <div className="p-6 bg-slate-50 overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                <p className="text-xs font-bold text-blue-800 flex items-start gap-2"><KeyRound size={16} className="shrink-0 mt-0.5" /> <span><strong>Note:</strong> Klik tombol kunci untuk mereset password akun Pemilik Toko atau Kasir.</span></p>
              </div>
              <div className="space-y-3">
                {selectedTenantDetails.employees.map(emp => (
                  <div key={emp.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800">{emp.name}</h4>
                        {emp.role === 'store_admin' ? <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Pemilik Toko</span> : <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Kasir</span>}
                      </div>
                      <p className="text-xs font-bold text-slate-400">{emp.email}</p>
                    </div>
                    <button onClick={() => openResetPwdModal(emp.id, emp.name)} className="bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all"><KeyRound size={14} /> Reset password</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER MODAL */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
            <button onClick={() => handleToggleStatus(selectedTenant.id, selectedTenant.is_active)} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${selectedTenant.is_active ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}>
              {selectedTenant.is_active ? <><Trash2 size={16} /> Arsipkan Toko</> : <><RotateCcw size={16} /> Pulihkan Toko</>}
            </button>
            <button onClick={() => setShowDetailsModal(false)} className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition uppercase text-xs tracking-widest">Tutup</button>
          </div>
        </div>
      </div>
    )}

    {/* =========================================================
          MODAL CUSTOM UNTUK MENGGANTIKAN PROMPT BROWSER 
          ========================================================= */}

    {/* MODAL EDIT NAMA TOKO */}
    {editNameModal.show && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <h3 className="text-base font-black tracking-tight text-slate-800">Edit Nama Toko</h3>
            <button onClick={() => setEditNameModal({ ...editNameModal, show: false })} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition-all"><XCircle size={18} /></button>
          </div>
          <form onSubmit={submitEditName} className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Baru</label>
              <input autoFocus required value={editNameModal.newName} onChange={e => setEditNameModal({ ...editNameModal, newName: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 ring-blue-500 outline-none font-bold text-sm" placeholder="Nama Toko" />
            </div>
            <button disabled={isProcessing} className={`w-full py-3 rounded-xl font-black text-sm transition-all uppercase text-white ${isProcessing ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}>Simpan Perubahan</button>
          </form>
        </div>
      </div>
    )}

    {/* MODAL RESET PASSWORD */}
    {resetPwdModal.show && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
          <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <h3 className="text-base font-black tracking-tight text-slate-800">Reset Password</h3>
            <button onClick={() => setResetPwdModal({ ...resetPwdModal, show: false })} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition-all"><XCircle size={18} /></button>
          </div>
          <form onSubmit={submitResetPwd} className="p-5 space-y-4">
            <p className="text-xs font-bold text-slate-500">Buat password baru untuk <span className="text-blue-600">{resetPwdModal.userName}</span>.</p>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password Baru</label>
              <input autoFocus required type="password" minLength={6} value={resetPwdModal.newPassword} onChange={e => setResetPwdModal({ ...resetPwdModal, newPassword: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 ring-blue-500 outline-none font-bold text-sm" placeholder="Minimal 6 Karakter" />
            </div>
            <button disabled={isProcessing} className={`w-full py-3 rounded-xl font-black text-sm transition-all uppercase text-white ${isProcessing ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}>Simpan Password</button>
          </form>
        </div>
      </div>
    )}

  </div>
);
}

// ... Sub-komponen (NavItem & StatCard) tidak berubah ...
function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = { blue: 'text-indigo-600 border-indigo-100 bg-white', emerald: 'text-emerald-500 border-emerald-100 bg-white' };
  return (
    <div className={`p-6 md:p-8 rounded-3xl border shadow-sm flex flex-col justify-between h-full bg-white card-hover`}>
      <div className="flex items-center justify-between mb-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border bg-slate-50 ${colors[color]}`}>{icon}</div></div>
      <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p><h3 className="text-2xl font-black text-slate-800 tracking-tighter truncate">{value}</h3></div>
    </div>
  );
}