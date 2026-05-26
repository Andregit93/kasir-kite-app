import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingCart,
    faClipboardList,
    faHistory,
    faSignOutAlt,
    faCashRegister
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function Sidebar({ onLogout, isOpen, onClose }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [showProfilePopover, setShowProfilePopover] = useState(false);

    const user = auth.user;
    const cashierName = user?.name || user?.email?.split('@')[0] || 'Kasir';
    const cashierPhoto = user?.photo_url || null;

    const isActive = (path) => url.startsWith(path);

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`lg:hidden fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Main Sidebar Drawer */}
            <nav className={`fixed lg:static inset-y-0 left-0 w-[70%] max-w-[280px] lg:w-16 flex flex-col items-center lg:py-6 bg-white shrink-0 z-[160] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>

                {/* Mobile Drawer Header */}
                <div className="lg:hidden w-full p-8 border-b border-slate-50 flex flex-col items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                            {cashierPhoto ? (
                                <img src={cashierPhoto} alt={cashierName} className="w-full h-full object-cover" />
                            ) : (
                                <img src={`https://ui-avatars.com/api/?name=${cashierName}&background=f1f5f9&color=004ac6&bold=true`} alt={cashierName} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-manrope font-black text-xs text-on-surface truncate">{cashierName}</h4>
                            <p className="text-[9px] font-manrope font-black text-slate-400 uppercase tracking-widest">
                                {user?.role === 'store_admin' ? 'Admin Toko' : 'Kasir POS'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top: User Profile Circle (Desktop Only) */}
                <div className="hidden lg:flex mb-10 flex-col items-center">
                    <div className="relative">
                        <button
                            onClick={() => setShowProfilePopover(!showProfilePopover)}
                            className={`w-10 h-10 rounded-xl overflow-hidden hover:ring-2 hover:ring-brand transition-all shadow-lg ${showProfilePopover ? 'ring-2 ring-brand' : ''}`}
                        >
                            {cashierPhoto ? (
                                <img src={cashierPhoto} alt={cashierName} className="w-full h-full object-cover" />
                            ) : (
                                <img src={`https://ui-avatars.com/api/?name=${cashierName}&background=f1f5f9&color=004ac6&bold=true`} alt={cashierName} className="w-full h-full object-cover" />
                            )}
                        </button>

                        {showProfilePopover && (
                            <div className="absolute left-16 top-0 bg-white rounded-3xl py-4 px-6 shadow-2xl z-[100] animate-in slide-in-from-left-4 duration-300 min-w-[12rem]">
                                <div className="overflow-hidden text-center">
                                    <h4 className="font-manrope font-bold text-sm text-on-surface truncate">{cashierName}</h4>
                                    <p className="text-[10px] font-manrope font-black text-slate-500 uppercase tracking-widest">
                                        {user?.role === 'store_admin' ? 'Admin' : 'Kasir'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 lg:gap-6 flex-1 w-full lg:w-auto px-4 lg:px-0">
                    {user?.role === 'cashier' && (
                        <Link
                            href="/pos"
                            className={`group relative flex items-center lg:justify-center gap-4 lg:gap-0 p-2 lg:p-0 rounded-2xl transition-all ${isActive('/pos') && url === '/pos' ? 'bg-brand/5 lg:bg-transparent' : ''}`}
                            onClick={onClose}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive('/pos') && url === '/pos' ? 'text-brand bg-brand/5 lg:bg-brand/5 shadow-sm' : 'text-slate-300 hover:text-brand hover:bg-slate-50'}`}>
                                <FontAwesomeIcon icon={faCashRegister} />
                            </div>
                            <span className={`lg:hidden font-manrope font-bold text-xs transition-colors ${isActive('/pos') && url === '/pos' ? 'text-brand' : 'text-slate-600'}`}>Kasir</span>
                            <span className="hidden lg:block absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-on-surface text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">Kasir</span>
                        </Link>
                    )}

                    <div className="group relative flex items-center lg:justify-center gap-4 lg:gap-0 p-2 lg:p-0 cursor-not-allowed opacity-40">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-200">
                            <FontAwesomeIcon icon={faClipboardList} />
                        </div>
                        <span className="lg:hidden font-manrope font-bold text-xs text-slate-600">Pesanan</span>
                        <span className="hidden lg:block absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-on-surface text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">Pesanan</span>
                    </div>

                    <Link
                        href="/pos/transactions"
                        className={`group relative flex items-center lg:justify-center gap-4 lg:gap-0 p-2 lg:p-0 rounded-2xl transition-all ${isActive('/pos/transactions') ? 'bg-brand/5 lg:bg-transparent' : ''}`}
                        onClick={onClose}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive('/pos/transactions') ? 'text-brand bg-brand/5 lg:bg-brand/5 shadow-sm' : 'text-slate-300 hover:text-brand hover:bg-slate-50'}`}>
                            <FontAwesomeIcon icon={faHistory} />
                        </div>
                        <span className={`lg:hidden font-manrope font-bold text-xs transition-colors ${isActive('/pos/transactions') ? 'text-brand' : 'text-slate-600'}`}>Transaksi</span>
                        <span className="hidden lg:block absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-on-surface text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">Riwayat</span>
                    </Link>
                </div>

                {/* Bottom: Logout Button */}
                <div className="mt-auto flex flex-col items-center w-full p-8 lg:p-0 lg:pb-2">
                    <button
                        onClick={onLogout}
                        className="w-full lg:w-10 h-10 rounded-xl flex items-center justify-center gap-2 lg:gap-0 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                        title="Keluar dari sistem"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} size="sm" />
                        <span className="lg:hidden font-manrope font-bold text-xs">Keluar Akun</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
