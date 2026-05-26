import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faMinus, faTrash, faBoxOpen, faPrint,
    faCheckCircle, faMoneyBillWave, faUser, faHistory,
    faSearch, faSignOutAlt, faShoppingCart, faExclamationCircle, faInfoCircle,
    faClipboardList, faQrcode, faUniversity, faCoins
} from '@fortawesome/free-solid-svg-icons';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import PosLayout from '@/Layouts/PosLayout';
import { useToast } from '@/Contexts/ToastContext';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import Receipt from '@/Components/Receipt';
import { printReceipt } from '@/utils/receiptPrinter';

/**
 * Memoized Product Card Component.
 * Optimized to prevent grid-wide re-renders when cart changes.
 */
const ProductCard = React.memo(({ product, onAddToCart, storeLogo, cartCount = 0 }) => {
    const isOutOfStock = product.stock !== -1 && product.stock <= 0;
    const isLowStock = product.stock !== -1 && product.stock > 0 && product.stock <= 5;

    return (
        <div
            onClick={() => !isOutOfStock && onAddToCart(product)}
            className={`group relative bg-white rounded-2xl p-2.5 lg:p-3.5 transition-all duration-500 border border-slate-100/60 hover:border-brand/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] active:scale-[0.96] cursor-pointer flex flex-col [@container] ${isOutOfStock ? 'opacity-70 grayscale-[0.5]' : ''}`}
        >
            {/* Image Area */}
            <div className="w-full aspect-square relative overflow-hidden bg-slate-50 rounded-xl mb-1.5 lg:mb-3">
                <img
                    src={product.image_url || storeLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f1f5f9&color=64748b&bold=true`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* In-Cart Badge Overlay (Elite Feature) */}
                {cartCount > 0 && (
                    <div className="absolute top-2 left-2 animate-in zoom-in duration-300">
                        <div className="bg-brand text-white text-[10px] font-manrope font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-white/20">
                            <FontAwesomeIcon icon={faShoppingCart} className="text-[8px]" />
                            <span>{cartCount}</span>
                        </div>
                    </div>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-on-surface/20 backdrop-blur-[4px] z-10">
                        <span className="bg-white/80 backdrop-blur-md text-on-surface font-manrope font-black text-[10px] tracking-[0.2em] px-6 py-2.5 border border-white/60 rounded-full shadow-lg">
                            HABIS
                        </span>
                    </div>
                )}

                {/* Status Dot for Stock (Smart Indicator) */}
                {product.stock !== -1 && (
                    <div className="absolute top-2 right-2 z-20">
                        <div className={`w-2 h-2 rounded-full border border-white shadow-sm ${isOutOfStock ? 'bg-red-800' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                    </div>
                )}

                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Content Area */}
            <div className="px-1 flex flex-col flex-1">
                <span className="text-[8px] lg:text-[9px] font-manrope font-black text-slate-500 uppercase tracking-[0.1em] mb-1 truncate">
                    {product.category?.name || 'Umum'}
                </span>

                <h3 className="text-[12px] lg:text-[13px] font-manrope font-bold text-on-surface leading-tight mb-1 line-clamp-2 h-[2.5rem]">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-end justify-between gap-1 overflow-hidden">
                    <div className="flex-1 min-w-0 overflow-hidden leading-none">
                        <span className={`font-manrope font-black text-brand tracking-tight whitespace-nowrap transition-all ${
                            product.price_formatted.length > 14 ? 'text-[10px]' : 
                            product.price_formatted.length > 11 ? 'text-[12px]' : 
                            'text-sm lg:text-[14px]'
                        }`}>
                            {product.price_formatted}
                        </span>
                    </div>
                    {product.stock !== -1 && (
                        <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-[10px] font-manrope font-black ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-600' : 'text-slate-500'}`}>
                                {product.stock}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

ProductCard.displayName = 'ProductCard';

export default function CashierIndex({ products: serverProductsResponse, categories, store }) {
    // ── DATA ALIGNMENT ──
    // Laravel API Resource wraps data in a 'data' key
    const serverProducts = serverProductsResponse.data || [];

    // ── AUTH & DASHBOARD DATA ──
    const { auth, supabaseToken } = usePage().props;
    const user = auth.user;

    // ── CUSTOM HOOKS ──
    const {
        cart, totalItems, totalPrice,
        addToCart, removeFromCart, clearCart
    } = useCart(user?.id);

    const { data: formData, setData: setFormData, post, errors, processing: isCheckoutLoading } = useForm({
        items: [],
        paymentMethod: 'cash',
    });

    // ── LOCAL UI STATE ──
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showMobileCart, setShowMobileCart] = useState(false);
    const [cashGiven, setCashGiven] = useState('');
    const [receiptData, setReceiptData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Unified Toast System from PosLayout
    const { showToast } = useToast();

    const receiptRef = useRef();
    const realtimeDebounceRef = useRef(null);

    // ── DERIVED & MEMOIZED VALUES ──
    const cashierName = user?.name || user?.email?.split('@')[0] || 'Kasir';
    const storeName = store?.name || 'KasirKite';

    const filteredProducts = useMemo(() => {
        return serverProducts
            .filter(p => {
                const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.barcode?.includes(searchQuery);
                const matchCategory = selectedCategory ? p.category_id === selectedCategory : true;
                return matchSearch && matchCategory;
            })
            .sort((a, b) => {
                // 1. Availability Priority (Available items first)
                const aAvailable = a.stock !== 0;
                const bAvailable = b.stock !== 0;

                if (aAvailable !== bAvailable) {
                    return aAvailable ? -1 : 1;
                }

                // 2. Secondary Sort: Alphabetical A-Z
                return a.name.localeCompare(b.name);
            });
    }, [serverProducts, searchQuery, selectedCategory]);

    const taxRate = store?.tax_enabled ? store.tax_percentage : 0;
    const taxAmount = Math.round(totalPrice * taxRate / 100);
    const grandTotal = totalPrice + taxAmount;

    const changeAmount = parseInt(cashGiven || 0) - grandTotal;
    const isCashSufficient = formData.paymentMethod !== 'cash' || parseInt(cashGiven || 0) >= grandTotal;

    // ── EFFECTS ──
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const triggerInventoryRefresh = useCallback(() => {
        if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
        realtimeDebounceRef.current = setTimeout(() => {
            router.reload({ only: ['products'], preserveScroll: true, preserveState: true });
        }, 100);
    }, []);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
        };
    }, []);

    // ── REAL-TIME INVENTORY (Supabase) ──
    useSupabaseRealtime(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        supabaseToken,
        user?.tenant_id,
        {
            table: 'transactions',
            event: '*',
            onPayload: triggerInventoryRefresh
        }
    );

    useSupabaseRealtime(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        supabaseToken,
        user?.tenant_id,
        {
            table: 'products',
            event: '*',
            onPayload: triggerInventoryRefresh
        }
    );

    // Sync cart to formData
    useEffect(() => {
        setFormData('items', cart.map(item => ({ productId: item.id, quantity: item.quantity })));
    }, [cart, setFormData]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2' && cart.length > 0 && !showPaymentModal && !showReceiptModal) {
                e.preventDefault();
                setCashGiven('');
                setFormData('paymentMethod', 'cash');
                setShowPaymentModal(true);
            }
            if (e.key === 'Escape') {
                setShowPaymentModal(false);
                setShowReceiptModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart.length, showPaymentModal, showReceiptModal, setFormData]);

    // ── HANDLERS (useCallback for child components) ──
    const notify = useCallback((message, type = 'info') => {
        showToast(message, type);
    }, [showToast]);

    const handleAddToCart = useCallback((product) => {
        addToCart(product, (msg) => notify(msg, 'error'));
    }, [addToCart, notify]);

    const handleRemoveFromCart = useCallback((productId) => {
        removeFromCart(productId);
    }, [removeFromCart]);

    const handleCashInput = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setCashGiven(rawValue);
    };

    const setDenomination = (amount) => {
        setCashGiven(amount.toString());
        setFormData('paymentMethod', 'cash');
    };

    const processCheckout = () => {
        if (!isCashSufficient || cart.length === 0) return;

        // Base receipt info (Temporary ID until confirmed by server)
        const receiptInfo = {
            transactionId: 'POS-TMP-' + Math.random().toString(36).substring(7).toUpperCase(),
            date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            })),
            subtotal: totalPrice,
            taxRate,
            taxAmount,
            total: grandTotal,
            cash: Number(cashGiven) || grandTotal,
            change: changeAmount > 0 ? changeAmount : 0,
            paymentMethod: formData.paymentMethod,
            cashierName,
            storeName: store?.name || 'KasirKite',
            storeAddress: store?.address || '-',
            storePhone: store?.phone || '-',
            storeLogo: store?.logo_url,
        };

        post('/pos/checkout', {
            preserveScroll: true,
            onSuccess: (page) => {
                // EXCLUSIVE SUCCESS LOGIC
                const successData = page.props.flash?.success;

                // Update with authoritative ID from backend
                if (successData && successData.transactionId) {
                    receiptInfo.transactionId = 'TRX-' + successData.transactionId.substring(0, 6).toUpperCase();
                }

                setReceiptData(receiptInfo);
                setShowPaymentModal(false);
                setShowReceiptModal(true);

                // ONLY CLEAR CART ON ABSOLUTE SUCCESS
                clearCart();
                setCashGiven('');
            },
            onError: (err) => {
                // FAIL-SAFE ERROR HANDLING
                // We do NOT clear the cart here, allowing the cashier to fix 
                // stock issues manually after seeing the notification.
                const errorMsg = err.items || Object.values(err)[0] || 'Gagal memproses transaksi.';
                notify(errorMsg, 'error');
            }
        });
    };

    const handlePrint = () => {
        printReceipt(receiptRef.current, `Struk ${receiptData?.transactionId || 'KASIRKITE'}`);
    };

    // ── SUB-COMPONENTS ──
    const CartSidebar = (
        <aside className="h-full w-full lg:w-[320px] bg-white border-l border-slate-100 flex flex-col shadow-[[-20px_0_60px_rgba(0,0,0,0.02)]] z-10 transition-all duration-500">
            <div className="px-6 pt-6 pb-5 shrink-0 flex items-center justify-between border-b border-slate-50/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center text-brand">
                        <FontAwesomeIcon icon={faShoppingCart} size="sm" />
                    </div>
                    <h2 className="text-lg font-manrope font-black text-on-surface tracking-tight">Pesanan</h2>
                </div>
                <div className="flex items-center gap-2">
                    {cart.length > 0 && (
                        <button
                            onClick={() => clearCart()}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm active:scale-90"
                        >
                            <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => setShowMobileCart(false)}
                        className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 shadow-sm transition-all"
                    >
                        <FontAwesomeIcon icon={faPlus} className="rotate-45" size="sm" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar bg-slate-50/30">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                            <FontAwesomeIcon icon={faShoppingCart} size="xl" />
                        </div>
                        <p className="font-manrope font-bold uppercase tracking-widest text-[8px] text-center px-8">Belum ada pesanan</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 lg:p-2.5 rounded-2xl bg-white transition-all group hover:shadow-lg hover:shadow-slate-200/50 border border-slate-100/50">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100/50">
                                <img
                                    src={item.image_url || store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=f1f5f9&color=64748b&bold=true`}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-manrope font-bold text-[11px] text-on-surface truncate mb-0.5">{item.name}</h4>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-brand font-manrope font-black text-[10px]">
                                        {item.price_formatted}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100/50">
                                <button
                                    onClick={() => handleRemoveFromCart(item.id)}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all active:scale-90 ${item.quantity === 1 ? 'text-red-400 hover:bg-red-500 hover:text-white' : 'text-slate-400 hover:bg-white'}`}
                                >
                                    <FontAwesomeIcon icon={item.quantity === 1 ? faTrash : faMinus} className="text-[7px]" />
                                </button>
                                <span className="text-[9px] font-manrope font-black text-on-surface w-3 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:bg-white hover:text-brand transition-all active:scale-90"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="text-[7px]" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-100">
                <div className="space-y-1 mb-3">
                    <div className="flex justify-between items-center text-slate-500 font-manrope font-bold text-[9px] uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    {taxRate > 0 && (
                        <div className="flex justify-between items-center text-slate-500 font-manrope font-bold text-[9px] uppercase tracking-widest">
                            <span>PPN ({taxRate}%)</span>
                            <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    <div className="pt-2 flex justify-between items-center border-t border-slate-100 mt-1">
                        <span className="text-brand font-manrope font-black text-[10px] uppercase tracking-widest leading-none">Total Tagihan</span>
                        <span className="text-xl font-manrope font-black text-on-surface tracking-tighter leading-none">
                            Rp {grandTotal.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
                <button
                    disabled={cart.length === 0 || isCheckoutLoading}
                    onClick={() => { setCashGiven(''); setFormData('paymentMethod', 'cash'); setShowPaymentModal(true); }}
                    className={`w-full py-3.5 rounded-xl font-manrope font-black transition-all flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-brand text-white hover:bg-brand-container shadow-xl shadow-brand/25 active:scale-[0.98]'}`}
                >
                    <FontAwesomeIcon icon={faMoneyBillWave} size="sm" />
                    <span className="text-sm uppercase tracking-widest">Bayar Sekarang</span>
                </button>
            </div>
        </aside>
    );

    return (
        <PosLayout
            title="Kasir POS"
            searchProps={{
                searchQuery,
                setSearchQuery,
                placeholder: "Cari menu atau kode produk..."
            }}
            extraRight={CartSidebar}
        >
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/30 transition-all duration-700">
                {/* Categories */}
                {categories.length > 0 && (
                    <div className="px-4 md:px-8 pt-2 pb-2 md:py-3 lg:py-3 flex flex-nowrap gap-2 md:gap-3 overflow-x-auto no-scrollbar shrink-0">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-5 md:px-8 py-2 md:py-3 lg:py-2 rounded-lg md:rounded-xl text-[10px] md:text-[10px] font-manrope font-black uppercase tracking-widest whitespace-nowrap shrink-0 transition-all ${!selectedCategory ? 'bg-brand text-white shadow-md shadow-brand/10' : 'bg-white text-slate-500 border border-slate-100 hover:text-on-surface hover:border-slate-200'}`}
                        >
                            Semua
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 md:px-8 py-2 md:py-3 lg:py-2 rounded-lg md:rounded-xl text-[10px] md:text-[10px] font-manrope font-black uppercase tracking-widest whitespace-nowrap shrink-0 transition-all ${selectedCategory === cat.id ? 'bg-brand text-white shadow-md shadow-brand/10' : 'bg-white text-slate-500 border border-slate-100 hover:text-on-surface hover:border-slate-200'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-28 lg:pb-12 pt-1 custom-scrollbar">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <FontAwesomeIcon icon={faBoxOpen} size="6x" className="mb-6" />
                            <p className="font-manrope font-bold text-xl uppercase tracking-widest text-slate-400">Produk tidak ada</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 lg:gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    storeLogo={store?.logo_url}
                                    onAddToCart={handleAddToCart}
                                    cartCount={cart.find(c => c.id === product.id)?.quantity || 0}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile FAB */}
            {totalItems > 0 && (
                <button
                    onClick={() => setShowMobileCart(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-brand text-white rounded-full shadow-2xl flex items-center justify-center lg:hidden z-40 active:scale-90 transition-all animate-in zoom-in"
                >
                    <div className="relative">
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span className="absolute -top-4 -right-2.5 w-5 h-5 bg-red-500 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{totalItems}</span>
                    </div>
                </button>
            )}

            {showMobileCart && (
                <div className="lg:hidden fixed inset-0 z-[200]">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setShowMobileCart(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {CartSidebar}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-on-surface/60 backdrop-blur-md flex items-center justify-center z-[300] p-4 md:p-10 animate-in fade-in duration-500 font-manrope">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-fit max-h-[85vh] flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95">
                        {/* Mobile Header (Title + Total + Close) */}
                        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-50 bg-white sticky top-0 z-20">
                            <div className="flex flex-col">
                                <h2 className="text-[10px] font-manrope font-black uppercase tracking-[0.2em] text-slate-500 leading-none mb-1">Pembayaran</h2>
                                <span className="text-lg font-manrope font-black text-brand tracking-tighter">Rp {grandTotal.toLocaleString('id-ID')}</span>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center transition-all active:scale-90"><FontAwesomeIcon icon={faPlus} className="rotate-45" /></button>
                        </div>

                        <div className="flex flex-col-reverse lg:flex-row flex-1 overflow-hidden">
                            {/* Summary Column */}
                            <div className="w-full lg:w-5/12 bg-slate-50/80 p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col overflow-hidden">
                                <div className="hidden lg:flex items-center mb-3 gap-1">
                                    <FontAwesomeIcon icon={faClipboardList} size="base" className="text-brand mr-2" />
                                    <div>
                                        <h2 className="text-base font-manrope font-black tracking-tight text-on-surface">Detail Pesanan</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total {totalItems} Produk</p>
                                    </div>
                                </div>
                                <div className="hidden lg:block space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center group">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="font-manrope font-bold text-[13px] text-on-surface truncate">{item.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-brand font-black bg-brand/5 px-2 py-0.5 rounded-md">{item.quantity}x</span>
                                                    <span className="text-[9px] text-slate-500 font-bold">{item.price_formatted}</span>
                                                </div>
                                            </div>
                                            <span className="font-manrope font-black text-[13px] text-on-surface">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-0 lg:mt-4 pt-0 lg:pt-4 border-t-0 lg:border-t lg:border-dashed lg:border-slate-200">
                                    {/* Cost Breakdown */}
                                    <div className="mb-3 space-y-1.5 px-1">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                            <span>Subtotal</span>
                                            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                                        </div>
                                        {taxRate > 0 && (
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                <span>PPN ({taxRate}%)</span>
                                                <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="hidden lg:flex justify-between items-center bg-brand text-white p-5 h-[65px] rounded-2xl shadow-xl shadow-brand/10">
                                        <span className="font-manrope font-black text-[9px] uppercase tracking-widest opacity-80 leading-tight">Total <br /> Tagihan</span>
                                        <span className="text-2xl font-manrope font-black tracking-tighter tabular-nums">
                                            Rp {grandTotal.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="lg:hidden flex justify-between items-center py-2 px-1">
                                        <span className="text-[10px] font-manrope font-black uppercase tracking-widest text-slate-400">Ringkasan Pesanan</span>
                                        <span className="text-[10px] font-bold text-slate-400">{totalItems} Item</span>
                                    </div>
                                </div>
                            </div>

                            {/* Controls Column */}
                            <div className="w-full lg:w-7/12 p-4 md:p-6 flex flex-col bg-white overflow-hidden pointer-events-auto flex-1">
                                <div className="hidden lg:flex mb-3 items-center justify-between border-b border-slate-50 pb-3">
                                    <h2 className="text-base font-manrope font-black tracking-tight text-on-surface">Pembayaran</h2>
                                    <button onClick={() => setShowPaymentModal(false)} className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100"><FontAwesomeIcon icon={faPlus} className="rotate-45" size="sm" /></button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[
                                        { id: 'cash', label: 'Tunai', icon: faMoneyBillWave },
                                        { id: 'qris', label: 'QRIS', icon: faQrcode },
                                        { id: 'transfer', label: 'Transfer', icon: faUniversity }
                                    ].map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setFormData('paymentMethod', p.id); if (p.id !== 'cash') setCashGiven(''); }}
                                            className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${formData.paymentMethod === p.id ? 'border-brand bg-brand/5' : 'border-slate-50 bg-white'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.paymentMethod === p.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'}`}><FontAwesomeIcon icon={p.icon} className="text-xs" /></div>
                                            <span className={`font-manrope font-black text-[10px] uppercase tracking-widest ${formData.paymentMethod === p.id ? 'text-brand' : 'text-slate-500'}`}>{p.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    {formData.paymentMethod === 'cash' ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-2">
                                            <div className="mb-3 p-4 bg-slate-900 rounded-2xl shadow-xl border border-slate-800">
                                                <label className="text-[9px] font-manrope font-black text-slate-500 uppercase tracking-widest mb-1 block">Uang Diterima</label>
                                                <div className="flex items-center">
                                                    <span className="text-base font-manrope font-black text-slate-500 mr-2">Rp</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={cashGiven ? parseInt(cashGiven).toLocaleString('id-ID') : ''}
                                                        onChange={handleCashInput}
                                                        placeholder="0"
                                                        className="w-full bg-transparent border-none outline-none ring-0 text-xl font-manrope font-black p-0 text-white placeholder:text-slate-700"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                {[5000, 10000, 20000, 50000, 100000].map(val => (
                                                    <button key={val} onClick={() => setDenomination(val)} className="py-3 bg-white border border-slate-100 rounded-xl text-xs font-manrope font-black text-slate-500 hover:border-brand hover:text-brand transition-all shadow-sm">{val.toLocaleString('id-ID')}</button>
                                                ))}
                                                <button onClick={() => setDenomination(grandTotal)} className="py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-manrope font-black text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">Uang Pas</button>
                                            </div>
                                            {cashGiven && (
                                                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between mb-3 border border-slate-100">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{isCashSufficient ? 'Kembalian' : 'Kekurangan'}</p>
                                                        <h3 className={`text-xl font-manrope font-black tracking-tight ${isCashSufficient ? 'text-emerald-500' : 'text-red-500'}`}>Rp {Math.abs(changeAmount).toLocaleString('id-ID')}</h3>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCashSufficient ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}><FontAwesomeIcon icon={isCashSufficient ? faCheckCircle : faExclamationCircle} className="text-xs" /></div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 animate-in fade-in">
                                            <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 mb-3 text-xl">
                                                <FontAwesomeIcon icon={formData.paymentMethod === 'qris' ? faQrcode : faUniversity} />
                                            </div>
                                            <p className="text-[9px] font-manrope font-black text-slate-400 uppercase tracking-widest text-center px-6 leading-relaxed">
                                                Lanjutkan Ke <span className="text-brand">{formData.paymentMethod.toUpperCase()}</span> <br /> Sebesar <span className="text-on-surface">Rp {grandTotal.toLocaleString('id-ID')}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    disabled={isCheckoutLoading || (formData.paymentMethod === 'cash' && (!cashGiven || !isCashSufficient))}
                                    onClick={processCheckout}
                                    className={`w-full h-[60px] lg:h-[65px] font-manrope font-black text-white rounded-xl lg:rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isCheckoutLoading || (formData.paymentMethod === 'cash' && (!cashGiven || !isCashSufficient)) ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-brand shadow-brand/20'}`}
                                >
                                    {isCheckoutLoading ? <Loader2 size={24} className="animate-spin h-full" /> : (
                                        <div className="flex items-center gap-3">
                                            <span className="text-base lg:text-lg uppercase tracking-widest">Konfirmasi</span>
                                            <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && receiptData && (
                <div className="fixed inset-0 bg-on-surface/60 backdrop-blur-md flex items-center justify-center z-[400] p-4 animate-in fade-in duration-300 font-manrope">
                    <div className="bg-slate-100 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3),0_0_40px_rgba(16,185,129,0.1)] w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 border border-white/20">
                        <div className="pt-6 pb-2 flex flex-col items-center justify-center relative">
                            {/* Refined Success Icon with Ripple Effect */}
                            <div className="relative mb-2 mt-2">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping duration-[2000ms]" />
                                <div className="relative w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10">
                                    <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                                </div>
                            </div>
                            <h2 className="text-lg font-manrope font-black text-on-surface tracking-tight">Transaksi Berhasil</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center custom-scrollbar">
                            <div className="w-full bg-white shadow-sm rounded-xl border border-[#e5e7eb]">
                                <Receipt ref={receiptRef} data={receiptData} />
                            </div>
                        </div>
                        <div className="p-6 bg-white flex flex-col gap-3 border-t border-slate-100">
                            <button onClick={handlePrint} className="w-full py-4 bg-emerald-500 text-white font-manrope font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest hover:bg-emerald-600"><FontAwesomeIcon icon={faPrint} /> CETAK STRUK</button>
                            <button onClick={() => { setShowReceiptModal(false); setShowMobileCart(false); }} className="w-full py-3.5 bg-white border border-slate-200 text-slate-500 font-manrope font-black rounded-xl transition-all hover:bg-slate-50 text-[10px] uppercase tracking-[0.3em]">SELESAI</button>
                        </div>
                    </div>
                </div>
            )}

        </PosLayout>
    );
}
