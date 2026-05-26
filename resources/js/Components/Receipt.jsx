import React, { useMemo } from 'react';

/**
 * Universal Receipt Component
 * Used for both on-screen previews and physical printing.
 * 
 * @param {Object} data - The transaction and store data.
 */
export const Receipt = React.forwardRef(({ data }, ref) => {
    if (!data) return null;

    const {
        storeName = 'KasirKite',
        storeAddress = '',
        storePhone = '',
        transactionId = 'TRANS-000',
        date = new Date().toLocaleString(),
        cashierName = 'Staff',
        items = [],
        subtotal = 0,
        taxRate = 0,
        taxAmount = 0,
        total = 0,
        paymentMethod = 'cash',
        cash = 0,
        change = 0
    } = data;

    // ── DATA NORMALIZATION ──────────────────────────────────
    // Standardizes item structure across Cashier, History, and Admin modules.
    const normalizedItems = useMemo(() => {
        if (!Array.isArray(items)) return [];
        return items.map(item => {
            if (!item) return null;

            // Extract Name: Priority order to handle all system sources
            const name = item.name ||
                item.product?.name ||
                item.product_name ||
                (typeof item === 'string' ? item : 'Produk');

            // Extract Numbers: Handle strings and database decimals
            const qty = Number(item.quantity || item.qty || 1);
            const price = Number(item.price || item.price_at_sale || 0);
            const itemSubtotal = Number(item.subtotal || (price * qty));

            return { name, qty, price, subtotal: itemSubtotal };
        }).filter(Boolean);
    }, [items]);

    return (
        <div ref={ref} className="receipt-container w-full bg-white p-6 md:p-8 text-slate-900 font-mono">
            {/* Header */}
            <div className="text-center mb-6">
                <h3 className="font-manrope font-black text-2xl uppercase tracking-tighter mb-1 leading-none">{storeName}</h3>
                {storeAddress && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed px-4">{storeAddress}</p>}
                {storePhone && <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5">{storePhone}</p>}
            </div>

            <div className="border-t border-dashed border-slate-300 my-4"></div>

            {/* Info */}
            <div className="space-y-1.5 mb-4 text-[11px] uppercase font-bold text-[#4b5563]">
                <div className="flex justify-between items-center">
                    <span>No. Struk</span>
                    <span className="text-[#111827]">{transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Tanggal</span>
                    <span className="text-[#111827]">{date}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Kasir</span>
                    <span className="text-[#111827]">{cashierName}</span>
                </div>
            </div>

            <div className="border-t border-dashed border-[#d1d5db] my-4"></div>

            {/* Items */}
            <div className="space-y-3 mb-4 min-h-[50px]">
                {normalizedItems.length > 0 ? (
                    normalizedItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5 min-h-[20px]">
                            <span className="text-[12px] font-bold text-[#111827] leading-tight break-words">{item.name}</span>
                            <div className="flex justify-between items-center text-[10px] font-bold text-[#6b7280]">
                                <span>{item.qty} x {item.price.toLocaleString('id-ID')}</span>
                                <span className="text-[#111827]">{item.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-2 text-[10px] text-[#9ca3af] italic">
                        {typeof items === 'string' ? items : 'Tidak ada detail item'}
                    </div>
                )}
            </div>

            <div className="border-t border-dashed border-[#d1d5db] my-4"></div>

            {/* Totals */}
            <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#4b5563] uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span className="text-[#111827]">{Number(subtotal || 0).toLocaleString('id-ID')}</span>
                </div>
                {Number(taxRate || 0) > 0 && (
                    <div className="flex justify-between items-center text-[11px] font-bold text-[#4b5563] uppercase tracking-wider">
                        <span>Pajak ({taxRate}%)</span>
                        <span className="text-[#111827]">+{Number(taxAmount || 0).toLocaleString('id-ID')}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-[11px] font-black text-[#111827] uppercase tracking-widest pt-2 mt-1 border-t border-[#f3f4f6]">
                    <span>Total</span>
                    <span className="text-base text-[#111827]">Rp {Number(total || 0).toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between items-center text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mt-2 border-t border-dashed border-[#f3f4f6] pt-3">
                    <span>Bayar ({String(paymentMethod).toUpperCase()})</span>
                    <span className="text-[#374151]">{Number(paymentMethod === 'cash' ? (cash || total) : total).toLocaleString('id-ID')}</span>
                </div>

                {paymentMethod === 'cash' && Number(change || 0) > 0 && (
                    <div className="flex justify-between items-center text-[11px] font-bold text-[#059669] uppercase tracking-wider pt-1">
                        <span>Kembali</span>
                        <span className="text-[#111827]">{Number(change || 0).toLocaleString('id-ID')}</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center mt-12 pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9ca3af] mb-1">Terima Kasih</p>
                <p className="text-[8px] font-bold text-[#d1d5db] uppercase tracking-[0.2em]">KasirKite - <i>Jualan Seneng, Ati Ge Tenang</i></p>
            </div>

            {/* Internal CSS for printing ONLY */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; background: white; -webkit-print-color-adjust: exact; }
                    .receipt-container { 
                        width: 100% !important; 
                        max-width: 100% !important; 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 10mm !important; 
                    }
                    * { color: black !important; }
                }
            `}} />
        </div>
    );
});

export default Receipt;
