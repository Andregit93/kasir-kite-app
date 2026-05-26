import { useState, useCallback, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';

/**
 * useDashboardModals Hook
 * 
 * Centralizes the state and logic for add/edit modals in the Admin Dashboard.
 * Reduces AdminDashboard.jsx complexity and satisfies Single Responsibility Principle.
 */
export const useDashboardModals = (showToast, categories, setCategories) => {
  // --- Refs ---
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Modal Visibility & Edit State ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditProduct, setIsEditProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productPhotoPreview, setProductPhotoPreview] = useState(null);
  const [trackStock, setTrackStock] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [initialProductData, setInitialProductData] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isEditCategory, setIsEditCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [showCashierModal, setShowCashierModal] = useState(false);
  const [isEditCashier, setIsEditCashier] = useState(false);
  const [selectedCashierId, setSelectedCashierId] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSavingCashier, setIsSavingCashier] = useState(false);
  const [initialCashierData, setInitialCashierData] = useState(null);

  // --- Inertia Forms ---
  const productForm = useForm({
    name: '', price: '', stock: '0', barcode: '', image: null, category_id: ''
  });

  const categoryForm = useForm({
    name: '', color: '#2563eb'
  });

  const cashierForm = useForm({
    name: '', email: '', password: '', photo: null
  });

  // --- Modal Handlers ---

  // Product Handlers
  const openAddProduct = useCallback(() => {
    setIsEditProduct(false);
    setSelectedProductId(null);
    productForm.reset();
    productForm.clearErrors();
    setProductPhotoPreview(null);
    setTrackStock(true);
    setInitialProductData(null);
    setShowProductModal(true);
  }, [productForm]);

  const openEditProduct = useCallback((p) => {
    setIsEditProduct(true);
    setSelectedProductId(p.id);
    const isUnlimited = p.stock === -1;
    setTrackStock(!isUnlimited);
    const formattedData = {
      name: p.name,
      price: p.price.toLocaleString('id-ID'),
      stock: isUnlimited ? '0' : p.stock.toString(),
      barcode: p.barcode || '',
      category_id: p.category_id || '',
      trackStock: !isUnlimited
    };
    productForm.setData({
      name: formattedData.name,
      price: formattedData.price,
      stock: formattedData.stock,
      barcode: formattedData.barcode,
      category_id: formattedData.category_id,
      image: null
    });
    productForm.clearErrors();
    setProductPhotoPreview(p.image_url);
    setInitialProductData(formattedData);
    setShowProductModal(true);
  }, [productForm]);

  const closeProductModal = useCallback(() => {
    setShowProductModal(false);
    productForm.reset();
    productForm.clearErrors();
    setProductPhotoPreview(null);
    setInitialProductData(null);
  }, [productForm]);

  // Category Handlers
  const openAddCategory = useCallback(() => {
    setIsEditCategory(false);
    setSelectedCategoryId(null);
    categoryForm.reset();
    categoryForm.setData({ name: '', color: '#2563eb' });
    categoryForm.clearErrors();
    setShowCategoryModal(true);
  }, [categoryForm]);

  const openEditCategory = useCallback((c) => {
    setIsEditCategory(true);
    setSelectedCategoryId(c.id);
    categoryForm.setData({ name: c.name, color: c.color });
    categoryForm.clearErrors();
    setShowCategoryModal(true);
  }, [categoryForm]);

  const closeCategoryModal = useCallback(() => {
    setShowCategoryModal(false);
    categoryForm.reset();
    categoryForm.clearErrors();
  }, [categoryForm]);

  // Cashier Handlers
  const openAddCashier = useCallback(() => {
    setIsEditCashier(false);
    cashierForm.reset();
    cashierForm.clearErrors();
    setPhotoPreview(null);
    setInitialCashierData(null);
    setShowCashierModal(true);
  }, [cashierForm]);

  const openEditCashier = useCallback((c) => {
    setIsEditCashier(true);
    setSelectedCashierId(c.id);
    const formattedData = {
      name: c.name,
      email: c.email
    };
    cashierForm.setData({ name: formattedData.name, email: formattedData.email, password: '', photo: null });
    cashierForm.clearErrors();
    setPhotoPreview(c.photo_url);
    setInitialCashierData(formattedData);
    setShowCashierModal(true);
  }, [cashierForm]);

  const closeCashierModal = useCallback(() => {
    setShowCashierModal(false);
    cashierForm.reset();
    cashierForm.clearErrors();
    setPhotoPreview(null);
    setInitialCashierData(null);
  }, [cashierForm]);

  // --- Save Logic ---

  const saveProduct = useCallback((e) => {
    e.preventDefault();
    const url = isEditProduct ? `/admin/products/${selectedProductId}` : '/admin/products';

    // Strip Indonesian formatting from price (e.g. "1.500.000" → 1500000)
    const rawPrice = parseInt(productForm.data.price.toString().replace(/\D/g, '')) || 0;
    // Set stock to -1 (unlimited) when tracking is off
    const finalStock = trackStock ? (parseInt(productForm.data.stock) || 0) : -1;

    const payload = {
      name: productForm.data.name,
      price: rawPrice,
      stock: finalStock,
      barcode: productForm.data.barcode,
      category_id: productForm.data.category_id || null,
    };

    // Only include image if a new file was selected
    if (productForm.data.image) {
      payload.image = productForm.data.image;
    }

    if (isEditProduct) {
      payload._method = 'PUT';
    }

    setIsSavingProduct(true);
    router.post(url, payload, {
      onSuccess: () => {
        setShowProductModal(false);
        productForm.reset();
        productForm.clearErrors();
        setProductPhotoPreview(null);
      },
      onError: (errors) => {
        // Map server validation errors back to productForm for display in modal
        Object.keys(errors).forEach(key => {
          productForm.setError(key, errors[key]);
        });
      },
      onFinish: () => setIsSavingProduct(false),
      forceFormData: true
    });
  }, [isEditProduct, selectedProductId, productForm, trackStock]);

  const saveCategory = useCallback((e) => {
    e.preventDefault();
    const url = isEditCategory ? `/admin/categories/${selectedCategoryId}` : '/admin/categories';
    const method = isEditCategory ? 'put' : 'post';
    const targetName = categoryForm.data.name;

    categoryForm[method](url, {
      onSuccess: () => {
        setShowCategoryModal(false);
      },
    });
  }, [isEditCategory, selectedCategoryId, categoryForm, showToast]);

  const saveCashier = useCallback((e) => {
    e.preventDefault();
    const url = isEditCashier ? `/admin/cashiers/${selectedCashierId}` : '/admin/cashiers';
    
    // Construct payload manually to avoid sending null/non-File fields that stringify to "null" in FormData
    const payload = {
      name: cashierForm.data.name,
      email: cashierForm.data.email,
    };

    if (cashierForm.data.password) {
      payload.password = cashierForm.data.password;
    }

    if (cashierForm.data.photo instanceof File) {
      payload.photo = cashierForm.data.photo;
    }

    if (isEditCashier) {
      payload._method = 'PUT';
    }

    setIsSavingCashier(true);
    router.post(url, payload, {
      onSuccess: () => {
        setShowCashierModal(false);
        cashierForm.reset();
        cashierForm.clearErrors();
        setPhotoPreview(null);
      },
      onError: (errors) => {
        Object.keys(errors).forEach(key => {
          cashierForm.setError(key, errors[key]);
        });
      },
      onFinish: () => setIsSavingCashier(false),
      forceFormData: true
    });
  }, [isEditCashier, selectedCashierId, cashierForm]);

  const handleProductPhotoChange = useCallback((e) => {
    const f = e.target.files[0];
    if (!f) return;

    productForm.clearErrors('image');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(f.type)) {
      productForm.setError('image', 'Format foto harus berupa JPG, JPEG, PNG, atau WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (f.size > 2 * 1024 * 1024) {
      productForm.setError('image', 'Ukuran foto maksimal adalah 2MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    productForm.setData('image', f);
    setProductPhotoPreview(URL.createObjectURL(f));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [productForm]);

  const handleCashierPhotoChange = useCallback((e) => {
    const f = e.target.files[0];
    if (!f) return;

    cashierForm.clearErrors('photo');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(f.type)) {
      cashierForm.setError('photo', 'Format foto harus berupa JPG, JPEG, PNG, atau WEBP.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }

    if (f.size > 2 * 1024 * 1024) {
      cashierForm.setError('photo', 'Ukuran foto maksimal adalah 2MB.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }

    cashierForm.setData('photo', f);
    setPhotoPreview(URL.createObjectURL(f));
    if (photoInputRef.current) photoInputRef.current.value = '';
  }, [cashierForm]);

  return {
    // Refs
    photoInputRef,
    fileInputRef,

    // Product Modal
    showProductModal,
    isEditProduct,
    productForm,
    productPhotoPreview,
    trackStock,
    setTrackStock,
    openAddProduct,
    openEditProduct,
    closeProductModal,
    saveProduct,
    handleProductPhotoChange,
    isSavingProduct,
    initialProductData,

    // Category Modal
    showCategoryModal,
    isEditCategory,
    categoryForm,
    selectedCategoryId,
    openAddCategory,
    openEditCategory,
    closeCategoryModal,
    saveCategory,

    // Cashier Modal
    showCashierModal,
    isEditCashier,
    cashierForm,
    photoPreview,
    openAddCashier,
    openEditCashier,
    closeCashierModal,
    saveCashier,
    handleCashierPhotoChange,
    isSavingCashier,
    initialCashierData
  };
};
