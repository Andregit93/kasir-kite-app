/**
 * Universal Receipt Printing Utility
 * Opens a dedicated window with minimalist styles for thermal printing.
 * 
 * @param {HTMLElement} element - The DOM element containing the Receipt.
 * @param {string} title - The title for the print window.
 */
export const printReceipt = (element, title = 'Cetak Struk') => {
    if (!element) {
        console.error('Target element for printing not found');
        return;
    }

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    
    // Extract styles to ensure the printed version looks correct
    const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
            try {
                return Array.from(styleSheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('');
            } catch (e) {
                // Ignore cross-origin stylesheet errors
                return '';
            }
        })
        .join('');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>${title}</title>
                <style>
                    ${styles}
                    /* Override for Thermal Printing */
                    @media print {
                        @page { margin: 0; size: 80mm auto; }
                        body { margin: 0; padding: 0; background: white; }
                        .receipt-container { 
                            width: 100% !important; 
                            max-width: 100% !important; 
                            box-shadow: none !important; 
                            border: none !important; 
                            padding: 2mm 5mm !important; 
                        }
                    }
                    /* Screen Styling for Debugging */
                    body { font-family: 'Courier New', monospace; background: #f1f1f1; padding: 20px; display: flex; justify-content: center; }
                    .receipt-container { background: white; width: 300px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    ${element.innerHTML}
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                        // window.close(); // Optional: closes the tab after print dialog
                    };
                </script>
            </body>
        </html>
    `);

    printWindow.document.close();
};

export default printReceipt;
