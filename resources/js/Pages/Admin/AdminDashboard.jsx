import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { router, Head, useForm } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';

// Shared UI & Context
import { ConfirmDialog as SharedConfirmDialog } from '@/Components/Toast';
import { useToast } from '@/Contexts/ToastContext';
import { formatCurrency } from '@/utils/formatters';

// Hooks
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useDashboardModals } from '@/hooks/useDashboardModals';

// Global flag to track greeting across Inertia partial reloads


// Layout Components
import DashboardSidebar from './Components/Layout/DashboardSidebar';
import DashboardHeader from './Components/Layout/DashboardHeader';

// Tab Components
import OverviewTab from './Components/Tabs/OverviewTab';
import CategoryTab from './Components/Tabs/CategoryTab';
import ProductTab from './Components/Tabs/ProductTab';
import CashierTab from './Components/Tabs/CashierTab';
import ReportsTab from './Components/Tabs/ReportsTab';
import SettingsTab from './Components/Tabs/SettingsTab';

// Modal Components
import ProductModal from './Components/Modals/ProductModal';
import CategoryModal from './Components/Modals/CategoryModal';
import CashierModal from './Components/Modals/CashierModal';

export default function AdminDashboard({
  auth,
  performanceMetrics,
  topSellingProducts,
  recentTransactions,
  staticWidgets,
  transactions: serverTransactions,
  transactionsSummary,
  initialFilters,
  products: initialProducts,
  categories: initialCategories,
  cashiers: initialCashiers,
  initialStore,
  supabaseToken,
  flash
}) {
  const user = auth.user;
  const { showToast } = useToast();
  const mainScrollRef = useRef(null);
  const realtimeDebounceRef = useRef(null);
  const categoryDebounceRef = useRef(null);

  // --- TAB & FILTER STATE ---
  const [activeTab, setActiveTab] = useState('overview');
  const [chartFilter, setChartFilter] = useState(initialFilters?.chart || 'daily');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [greetingShown, setGreetingShown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', text: '', confirmLabel: 'Hapus', onConfirm: null });

  // --- DATA STATE ---
  const [metrics, setMetrics] = useState(performanceMetrics || {});
  const [topProducts, setTopProducts] = useState(topSellingProducts || []);
  const [recentTrx, setRecentTrx] = useState(recentTransactions || []);
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [cashiers, setCashiers] = useState(initialCashiers || []);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [searchCategoryQuery, setSearchCategoryQuery] = useState('');
  const [searchCashierQuery, setSearchCashierQuery] = useState('');

  const {
    photoInputRef, fileInputRef,
    showProductModal, isEditProduct, productForm, productPhotoPreview, trackStock, setTrackStock, openAddProduct, openEditProduct, closeProductModal, saveProduct, handleProductPhotoChange, isSavingProduct, initialProductData,
    showCategoryModal, isEditCategory, categoryForm, selectedCategoryId, openAddCategory, openEditCategory, closeCategoryModal, saveCategory,
    showCashierModal, isEditCashier, cashierForm, photoPreview, openAddCashier, openEditCashier, closeCashierModal, saveCashier, handleCashierPhotoChange, isSavingCashier, initialCashierData
  } = useDashboardModals(showToast, categories, setCategories);

  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [isDeletingCashier, setIsDeletingCashier] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  // --- REAL-TIME REFRESH ORCHESTRATOR (Debounced) ---
  const triggerMetricsRefresh = useCallback((type, message, toastType = 'realtime') => {
    if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);

    realtimeDebounceRef.current = setTimeout(() => {
      router.reload({
        only: ['performanceMetrics', 'topSellingProducts', 'recentTransactions', 'staticWidgets'],
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          showToast(message, toastType, 5000);
        }
      });
    }, 100);
  }, [showToast]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
      if (categoryDebounceRef.current) clearTimeout(categoryDebounceRef.current);
    };
  }, []);

  // --- CATEGORY REFRESH ORCHESTRATOR ---
  const triggerCategoriesRefresh = useCallback((message, type = 'realtime') => {
    if (categoryDebounceRef.current) clearTimeout(categoryDebounceRef.current);

    categoryDebounceRef.current = setTimeout(() => {
      router.reload({
        only: ['categories'],
        preserveScroll: true,
        preserveState: true,
        onStart: () => setIsFilterLoading(true),
        onFinish: () => setIsFilterLoading(false),
        onSuccess: () => {
          if (message) showToast(message, type);
        }
      });
    }, 100);
  }, [showToast]);

  const handleRealtimePayload = useCallback((payload) => {
    // CASE: NEW TRANSACTION
    if (payload.eventType === 'INSERT') {
      const amount = parseFloat(payload.new?.total_amount || 0);

      setMetrics(prev => {
        const newTotal = (prev.revenue || 0) + amount;
        const newCount = (prev.transactions || 0) + 1;
        return {
          ...prev,
          revenue: newTotal,
          transactions: newCount,
          avgOrderValue: newCount > 0 ? (newTotal / newCount) : 0
        };
      });

      triggerMetricsRefresh('new', `Transaksi Baru: ${formatCurrency(amount)}`);
    }

    // CASE: VOIDED TRANSACTION
    if (payload.eventType === 'UPDATE' &&
      payload.old?.status === 'success' &&
      payload.new?.status === 'void') {

      const amount = parseFloat(payload.new?.total_amount || 0);

      setMetrics(prev => {
        const newTotal = Math.max(0, (prev.revenue || 0) - amount);
        const newCount = Math.max(0, (prev.transactions || 0) - 1);
        return {
          ...prev,
          revenue: newTotal,
          transactions: newCount,
          avgOrderValue: newCount > 0 ? (newTotal / newCount) : 0
        };
      });

      triggerMetricsRefresh('void', `Transaksi Dibatalkan: -${formatCurrency(amount)}`, 'error');
    }
  }, [triggerMetricsRefresh, formatCurrency]);

  // --- WELCOME GREETING ---
  useEffect(() => {
    if (flash?.welcome && user && !greetingShown) {
      setGreetingShown(true);
      const hours = new Date().getHours();
      let greeting = 'Selamat Pagi';
      let toastType = 'greeting_morning';

      if (hours >= 4 && hours < 10) { greeting = 'Selamat Pagi'; toastType = 'greeting_morning'; }
      else if (hours >= 10 && hours < 15) { greeting = 'Selamat Siang'; toastType = 'greeting_afternoon'; }
      else if (hours >= 15 && hours < 18) { greeting = 'Selamat Sore'; toastType = 'greeting_evening'; }
      else { greeting = 'Selamat Malam'; toastType = 'greeting_night'; }

      showToast(`${greeting}, ${user.name}!`, toastType, 5000);
    }

    if (flash?.success) {
      const msg = typeof flash.success === 'object' ? (flash.success.message || 'Berhasil!') : flash.success;
      const isDelete = msg.toLowerCase().includes('hapus') || msg.toLowerCase().includes('cabut');
      showToast(msg, isDelete ? 'error' : 'success');
    }
    if (flash?.error) {
      const msg = typeof flash.error === 'object' ? (flash.error.message || 'Terjadi kesalahan.') : flash.error;
      showToast(msg, 'error');
    }
  }, [flash, user, showToast]);

  // --- REAL-TIME HOOKS (Stable References to stop Socket Thrashing) ---
  const handleProductPayload = useCallback(() => {
    triggerCategoriesRefresh();
    router.reload({ only: ['products', 'topSellingProducts'] });
  }, [triggerCategoriesRefresh]);

  const handleCategoryPayload = useCallback((payload) => {
    // Silence realtime messages to prevent duplication with Flash messages.
    // The data refresh happens silently to keep UI updated.
    triggerCategoriesRefresh();
  }, [triggerCategoriesRefresh]);

  useSupabaseRealtime(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseToken,
    user?.tenant_id,
    {
      table: 'transactions',
      event: '*',
      onPayload: handleRealtimePayload
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
      onPayload: handleProductPayload
    }
  );

  useSupabaseRealtime(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseToken,
    user?.tenant_id,
    {
      table: 'categories',
      event: '*',
      onPayload: handleCategoryPayload
    }
  );

  // --- SYNC PROPS TO STATE ---
  useEffect(() => { if (performanceMetrics) setMetrics(performanceMetrics); }, [performanceMetrics]);
  useEffect(() => { if (topSellingProducts) setTopProducts(topSellingProducts); }, [topSellingProducts]);
  useEffect(() => { if (recentTransactions) setRecentTrx(recentTransactions); }, [recentTransactions]);
  useEffect(() => { if (initialProducts) setProducts(initialProducts); }, [initialProducts]);
  useEffect(() => { if (initialCategories) setCategories(initialCategories); }, [initialCategories]);
  useEffect(() => { if (initialCashiers) setCashiers(initialCashiers); }, [initialCashiers]);

  // --- NAVIGATION HANDLER ---
  const handleNavigate = useCallback((tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    requestAnimationFrame(() => {
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, []);

  const handleLogout = useCallback(() => {
    router.post('/logout', {}, {
      onStart: () => setIsLoggingOut(true),
      onFinish: () => setIsLoggingOut(false)
    });
  }, []);

  const updateGlobalFilter = useCallback((filter) => {
    setChartFilter(filter);
    setIsFilterLoading(true);
    router.reload({
      data: { chart_filter: filter },
      only: ['performanceMetrics'],
      preserveScroll: true,
      onFinish: () => setIsFilterLoading(false)
    });
  }, []);

  // Handlers migrated to useDashboardModals hook for cleaner entry page logic.

  const handleDeleteCategory = useCallback((category) => {
    const { id, name, products_count } = category;
    const pCount = Number(products_count || 0);

    if (pCount > 0) {
      setConfirmDialog({
        isOpen: true,
        title: 'Kategori Tidak Dapat Dihapus',
        text: `Kategori ${name} masih digunakan oleh ${pCount} produk aktif. Harap kosongkan kategori ini terlebih dahulu.`,
        confirmLabel: null,
        onConfirm: null
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        title: 'Hapus Kategori',
        confirmLabel: 'Hapus',
        processingLabel: '',
        text: `Apakah Anda yakin ingin menghapus kategori ${name}?`,
        onConfirm: () => {
          setIsDeletingCategory(true);
          router.delete(`/admin/categories/${id}`, {
            onSuccess: () => {
              setCategories(prev => prev.filter(cat => cat.id !== id));
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
            onError: (err) => {
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              router.reload({ only: ['categories'] });
              const errorMessage = Object.values(err)[0] || 'Gagal menghapus kategori';
              showToast(errorMessage.includes('product') ? 'Kategori tidak dapat dihapus karena masih berisi produk' : errorMessage, 'error');
            },
            onFinish: () => setIsDeletingCategory(false)
          });
        }
      });
    }
  }, [router, showToast]);

  const filteredProducts = useMemo(() => {
    const q = searchProductQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.toLowerCase().includes(q)));
  }, [products, searchProductQuery]);

  // Product delete handler (top-level, matching category delete pattern)
  const handleDeleteProduct = useCallback((id, name) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Produk',
      confirmLabel: 'Ya, Hapus',
      processingLabel: '',
      text: `Apakah Anda yakin ingin menghapus produk ${name}?`,
      onConfirm: () => {
        setIsDeletingProduct(true);
        router.delete(`/admin/products/${id}`, {
          onSuccess: () => {
            setProducts(prev => prev.filter(p => p.id !== id));
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          },
          onError: (err) => {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            const errorMessage = Object.values(err)[0] || 'Gagal menghapus produk';
            showToast(errorMessage, 'error');
          },
          onFinish: () => setIsDeletingProduct(false)
        });
      }
    });
  }, [router, showToast]);

  // Cashier delete handler (top-level, matching category delete pattern)
  const handleDeleteCashier = useCallback((id, name) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cabut Akses',
      confirmLabel: 'Ya, Cabut',
      processingLabel: '',
      text: `Apakah Anda yakin ingin mencabut akses ${name}?`,
      onConfirm: () => {
        setIsDeletingCashier(true);
        router.delete(`/admin/cashiers/${id}`, {
          onSuccess: () => {
            setCashiers(prev => prev.filter(c => c.id !== id));
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          },
          onError: (err) => {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            const errorMessage = Object.values(err)[0] || 'Gagal mencabut akses kasir';
            showToast(errorMessage, 'error');
          },
          onFinish: () => setIsDeletingCashier(false)
        });
      }
    });
  }, [router, showToast]);

  return (
    <div className="flex h-screen bg-slate-50/50 font-manrope overflow-hidden text-slate-900">
      <Head title="Admin Dashboard | KasirKite" />

      <SharedConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        text={confirmDialog.text}
        confirmLabel={confirmDialog.confirmLabel}
        processingLabel={confirmDialog.processingLabel}
        onConfirm={confirmDialog.onConfirm}
        isProcessing={isDeletingCategory || isDeletingProduct || isDeletingCashier || isLoggingOut}
        onClose={() => !(isDeletingCategory || isDeletingProduct || isDeletingCashier || isLoggingOut) && setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <DashboardSidebar
            isMobile activeTab={activeTab}
            onNavigate={handleNavigate}
            onLogout={() => setConfirmDialog({
              isOpen: true,
              title: 'Keluar Akun',
              confirmLabel: 'Ya, Keluar',
              processingLabel: '',
              text: 'Apakah Anda yakin ingin keluar dari sistem KasirKite?',
              onConfirm: handleLogout
            })}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            storeName={initialStore?.name} userName={user?.name} logo={initialStore?.logo_url}
          />
        )}
      </AnimatePresence>

      <DashboardSidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onLogout={() => setConfirmDialog({
          isOpen: true,
          title: 'Keluar Akun',
          confirmLabel: 'Ya, Keluar',
          processingLabel: '',
          text: 'Apakah Anda yakin ingin keluar dari sistem KasirKite?',
          onConfirm: handleLogout
        })}
        storeName={initialStore?.name} userName={user?.name} logo={initialStore?.logo_url}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          activeTab={activeTab}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          chartFilter={chartFilter}
          onFilterChange={updateGlobalFilter}
        />

        <section ref={mainScrollRef} className="p-4 lg:pt-5 lg:px-6 lg:pb-6 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === 'overview' && (
            <OverviewTab
              metrics={metrics} chartFilter={chartFilter}
              onFilterChange={updateGlobalFilter}
              isLoading={isFilterLoading}
              topProducts={topProducts}
              recentTrx={recentTrx} staticWidgets={staticWidgets}
              onSeeAllTransactions={() => handleNavigate('reports')}
              onSeeAllProducts={() => handleNavigate('products')}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryTab
              categories={categories} products={products}
              isLoading={isFilterLoading}
              searchQuery={searchCategoryQuery} setSearchQuery={setSearchCategoryQuery}
              onAdd={openAddCategory}
              onEdit={openEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}

          {activeTab === 'products' && (
            <ProductTab
              products={filteredProducts} categories={categories}
              isLoading={isFilterLoading}
              searchQuery={searchProductQuery} setSearchQuery={setSearchProductQuery}
              onAdd={openAddProduct}
              onEdit={openEditProduct}
              onDelete={handleDeleteProduct}
              storeLogo={initialStore?.logo_url}
            />
          )}

          {activeTab === 'cashiers' && (
            <CashierTab
              cashiers={cashiers}
              isLoading={isFilterLoading}
              searchQuery={searchCashierQuery} setSearchQuery={setSearchCashierQuery}
              onAdd={openAddCashier}
              onEdit={openEditCashier}
              onDelete={handleDeleteCashier}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              transactions={serverTransactions}
              transactionsSummary={transactionsSummary}
              initialStore={initialStore}
              initialFilters={initialFilters}
            />
          )}

          {activeTab === 'settings' && <SettingsTab initialStore={initialStore} user={user} showToast={showToast} />}
        </section>
      </main>

      {/* MODALS */}
      <ProductModal
        isOpen={showProductModal} isEdit={isEditProduct}
        onClose={closeProductModal}
        form={productForm} onSave={saveProduct}
        categories={categories} photoPreview={productPhotoPreview}
        onPhotoChange={handleProductPhotoChange}
        trackStock={trackStock} setTrackStock={setTrackStock} photoInputRef={photoInputRef}
        isSaving={isSavingProduct}
        initialData={initialProductData}
      />

      <CategoryModal
        key={selectedCategoryId || (isEditCategory ? 'editing' : 'new')}
        isOpen={showCategoryModal} isEdit={isEditCategory}
        onClose={closeCategoryModal}
        form={categoryForm.data}
        initialData={isEditCategory ? categories.find(cat => cat.id === selectedCategoryId) : { name: '', color: '#2563eb' }}
        onSave={saveCategory}
        errors={categoryForm.errors}
        onNameChange={e => categoryForm.setData('name', e.target.value)}
        onColorChange={hex => categoryForm.setData('color', hex)}
        isSaving={categoryForm.processing}
      />

      <CashierModal
        isOpen={showCashierModal} isEdit={isEditCashier}
        onClose={closeCashierModal}
        form={cashierForm}
        onSave={saveCashier} photoPreview={photoPreview}
        onPhotoChange={handleCashierPhotoChange}
        photoInputRef={fileInputRef}
        isSaving={isSavingCashier}
        initialData={initialCashierData}
      />
    </div>
  );
}
