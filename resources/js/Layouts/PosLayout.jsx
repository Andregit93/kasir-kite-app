import { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '@/Components/Sidebar';
import Header from '@/Components/Header';
import { useToast } from '@/Contexts/ToastContext';
import { ConfirmDialog as SharedConfirmDialog } from '@/Components/Toast';

export default function PosLayout({
    children,
    title,
    searchProps = {},
    extraRight = null
}) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    const [currentTime, setCurrentTime] = useState(new Date());
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [greetingShown, setGreetingShown] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- SESSION GREETING ---
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

            showToast(`${greeting}, ${user.name || 'Kasir'}!`, toastType, 5000);
        }
    }, [flash?.welcome, user, greetingShown, showToast]);

    // --- FLASH MESSAGE SYNC ---
    useEffect(() => {
        if (flash?.success) {
            const msg = typeof flash.success === 'object' ? (flash.success.message || 'Berhasil!') : flash.success;
            showToast(msg, 'success');
        }
        if (flash?.error) {
            const msg = typeof flash.error === 'object' ? (flash.error.message || 'Terjadi kesalahan.') : flash.error;
            showToast(msg, 'error');
        }
    }, [flash?.success, flash?.error, showToast]);

    const handleLogout = () => {
        router.post('/logout', {}, {
            onStart: () => setIsLoggingOut(true),
            onFinish: () => setIsLoggingOut(false),
            onSuccess: () => setShowLogoutModal(false)
        });
    };

    return (
        <>
            <Head title={title ? `${title} - KasirKite` : 'KasirKite'} />

            <div className="flex h-screen bg-surface-base font-manrope text-on-surface overflow-hidden relative">

                {/* Shared Confirmation Dialog */}
                <SharedConfirmDialog
                    isOpen={showLogoutModal}
                    title="Keluar Akun?"
                    text="Apakah Anda yakin ingin keluar dari sistem KasirKite?"
                    confirmLabel="Ya, Keluar"
                    processingLabel=""
                    isProcessing={isLoggingOut}
                    onConfirm={handleLogout}
                    onClose={() => !isLoggingOut && setShowLogoutModal(false)}
                />

                {/* Global Sidebar (Left) */}
                <Sidebar
                    onLogout={() => setShowLogoutModal(true)}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Viewport Container */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Content Area (Center) */}
                    <div className="flex-1 flex flex-col h-full overflow-hidden">

                        {/* Global Header */}
                        <Header
                            currentTime={currentTime}
                            onMenuClick={() => setIsSidebarOpen(true)}
                            {...searchProps}
                        />

                        {/* Page Content */}
                        <main className="flex-1 overflow-hidden flex flex-col pb-6 lg:pb-0">
                            {children}
                        </main>
                    </div>

                    {/* Extra Slot (Right) - e.g. Shopping Cart */}
                    {extraRight && (
                        <div className="hidden lg:block shrink-0 h-full">
                            {extraRight}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
