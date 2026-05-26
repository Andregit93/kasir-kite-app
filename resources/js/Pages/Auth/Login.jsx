import { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faEnvelope, faLock, faStore, faCheckCircle, faArrowRight, faChevronLeft, faEye, faEyeSlash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ──────────────────────────────────────
// SHARED UI COMPONENTS
// ──────────────────────────────────────

const BrandingHeader = ({ compact = false }) => (
    <div className={`text-center ${compact ? 'mb-2' : 'mb-3 lg:mb-2'}`}>
        <span className={`${compact ? 'text-3xl' : 'text-4xl md:text-[64px] lg:text-[60px]'} font-[900] tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}>
            <span className="text-white">Kasir</span>
            <span className="text-white leading-none">Kite</span>
        </span>
    </div>
);

const FeatureList = ({ compact = false }) => (
    <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-4 md:gap-6 lg:gap-6'} mt-6 lg:mt-6 w-full max-w-sm lg:max-w-xs`}>
        {[
            { title: "Data Jualan Aman", desc: "Data jualan Anda tersimpan otomatis dan aman di internet." },
            { title: "Cek Stok Gampang", desc: "Tahu barang apa yang habis tanpa harus pusing hitung manual." },
            { title: "Pantau Untung dari HP", desc: "Bisa cek berapa duit yang masuk hari ini lewat HP kapan saja." }
        ].map((feature, i) => (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                key={i}
                className="flex items-start gap-6 group cursor-default"
            >
                <div className="mt-1 flex items-center justify-center shrink-0">
                    <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12 lg:w-11 lg:h-11'} bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-lg`}>
                        <FontAwesomeIcon icon={faCheckCircle} className={`${compact ? 'text-lg' : 'text-2xl lg:text-xl'} text-cyan-300`} />
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <p className={`font-black ${compact ? 'text-base' : 'text-base md:text-lg lg:text-base'} text-white tracking-tight leading-none mb-1 md:mb-2 lg:mb-1 uppercase`}>
                        {feature.title}
                    </p>
                    <p className={`${compact ? 'hidden' : 'text-[13px] md:text-sm lg:text-[13px]'} font-bold text-white/90 leading-relaxed`}>
                        {feature.desc}
                    </p>
                </div>
            </motion.div>
        ))}
    </div>
);

const LoginErrorAlert = ({ message, isMobile }) => (
    <AnimatePresence>
        {message && (
            <motion.div
                key="error-toast-pill"
                initial={{ opacity: 0, y: -20, x: '-50%', scale: 0.9 }}
                animate={{
                    opacity: 1,
                    y: -25,
                    x: '-50%',
                    scale: 1,
                    transition: { type: 'spring', damping: 15, stiffness: 300 }
                }}
                exit={{
                    opacity: 0,
                    y: -20,
                    x: '-50%',
                    scale: 0.9,
                    transition: { duration: 0.2, ease: 'easeInOut' }
                }}
                className={`absolute -top-10 left-1/2 -translate-x-1/2 z-[500] ${isMobile ? 'px-4 py-1.5 min-w-[240px]' : 'px-6 py-2 min-w-[280px]'} bg-red-600/95 backdrop-blur-md border border-red-500/50 rounded-full flex items-center gap-3 shadow-[0_10px_30px_rgba(220,38,38,0.3)] justify-center`}
                role="alert"
                aria-live="assertive"
            >
                <div className={`flex items-center justify-center shrink-0 bg-white/20 rounded-full ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-[10px]" aria-hidden="true" />
                </div>
                <div className="flex-1 whitespace-nowrap">
                    <p className={`${isMobile ? 'text-[11px]' : 'text-[12px]'} font-black text-white tracking-tight uppercase`}>{message}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ──────────────────────────────────────
// UNIFIED LOGIN FORM COMPONENT (DRY & a11y)
// ──────────────────────────────────────

const LoginForm = ({
    data,
    setData,
    errors,
    processing,
    handleSubmit,
    showPassword,
    setShowPassword,
    isMobile = false
}) => {
    // Detect general authentication error for password border highlight
    const hasAuthError = errors.email && (
        errors.email.includes('salah') ||
        errors.email.includes('records') ||
        errors.email.includes('match')
    );

    return (
        <form onSubmit={handleSubmit} className={isMobile ? "space-y-6" : "space-y-6 md:space-y-8 lg:space-y-3"}>
            {/* Email Field */}
            <div className="space-y-1 md:space-y-2.5">
                <label
                    htmlFor="email"
                    className={`${isMobile ? 'text-xs' : 'text-sm lg:text-[10px]'} font-black uppercase tracking-widest text-slate-900 ml-1`}
                >
                    Email
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 group-focus-within:text-[#004ac6] transition-colors pointer-events-none">
                        <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" />
                    </div>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={`w-full pl-14 pr-6 ${isMobile ? 'py-4' : 'py-3'} bg-slate-50 border ${errors.email ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200'} rounded-xl text-slate-900 font-bold lg:text-[13px] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#004ac6] focus:bg-white transition-all`}
                        placeholder="nama@bisnisanda.com"
                        required
                    />
                </div>
                <div id="email-error" aria-live="polite">
                    {errors.email && !hasAuthError && (
                        <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.email}</p>
                    )}
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1 md:space-y-2.5">
                <label
                    htmlFor="password"
                    className={`${isMobile ? 'text-xs' : 'text-sm lg:text-[10px]'} font-black uppercase tracking-widest text-slate-900 ml-1`}
                >
                    Kata Sandi
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 group-focus-within:text-[#004ac6] transition-colors pointer-events-none">
                        <FontAwesomeIcon icon={faLock} aria-hidden="true" />
                    </div>
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        aria-invalid={!!errors.password || hasAuthError}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        className={`w-full pl-14 pr-14 ${isMobile ? 'py-4' : 'py-3'} bg-slate-50 border ${errors.password || hasAuthError ? 'border-red-300 ring-4 ring-red-500/5' : 'border-slate-200'} rounded-xl text-slate-900 font-bold lg:text-[13px] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#004ac6] focus:bg-white transition-all`}
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                        className="absolute inset-y-0 right-0 flex items-center pr-5 text-slate-400 hover:text-[#004ac6] transition-colors"
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
                    </button>
                </div>
                <div id="password-error" aria-live="polite">
                    {errors.password && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.password}</p>}
                </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between px-1 py-2">
                <label className="flex items-center gap-2 cursor-pointer group" htmlFor="remember">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="w-3 h-3 border-2 border-slate-300 rounded-lg checked:bg-[#004ac6] transition-all cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-bold text-slate-500 group-hover:text-slate-900 transition-colors`}>
                        Ingat saya
                    </span>
                </label>
                <a href="#" className={`${isMobile ? 'text-sm' : 'text-xs'} font-black text-[#004ac6] hover:text-blue-700 transition-colors`}>
                    Lupa Sandi?
                </a>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                onClick={handleSubmit}
                disabled={processing}
                className={`w-full py-2.5 rounded-xl font-black ${isMobile ? 'text-base' : 'md:text-lg lg:text-xs'} uppercase tracking-widest text-white transition-all shadow-2xl flex items-center justify-center gap-3 border-b-4 border-black/10 active:border-b-0 hover:brightness-110 active:scale-[0.98] relative z-50 ${processing ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#004ac6]'}`}
            >
                {processing ? (
                    <Loader2 className="animate-spin" size={24} />
                ) : (
                    <span>Masuk</span>
                )}
            </button>

            {/* Register Link */}
            <div className="text-center">
                <p className="text-sm md:text-xs font-bold text-slate-500 md:pt-2">
                    Belum punya akun? <a href="#" className="underline text-[#004ac6] hover:text-blue-700 transition-colors">Daftar Sekarang</a>
                </p>
            </div>
        </form>
    );
};

// ──────────────────────────────────────
// MAIN LOGIN PAGE
// ──────────────────────────────────────

export default function Login() {
    const [view, setView] = useState('intro'); // 'intro' | 'login'
    const [isPortrait, setIsPortrait] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
    const [showPassword, setShowPassword] = useState(false);
    const [visibleError, setVisibleError] = useState(null);
    const isMobile = isPortrait;

    useEffect(() => {
        const handleResize = () => {
            setIsPortrait(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Auto-hide error alert logic
    useEffect(() => {
        if (errors.email) {
            setVisibleError(errors.email);
            const timer = setTimeout(() => {
                setVisibleError(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        post('/login');
    };

    // Shared error detection logic for the Alert Banner
    const hasAuthError = errors.email && (
        errors.email.includes('salah') ||
        errors.email.includes('records') ||
        errors.email.includes('match')
    );

    return (
        <main className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white font-manrope selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
            <Head title="Masuk ke Akun" />

            {isPortrait ? (
                /* PORTRAIT MODE: STEP-BASED UI */
                <div className="w-full flex-1 relative min-h-screen overflow-hidden" key="portrait-container">
                    <AnimatePresence>
                        {view === 'intro' ? (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ x: '-100%', opacity: 0 }}
                                transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
                                className="absolute inset-0 bg-[#004ac6] flex flex-col items-center justify-center px-8 py-12 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent" />
                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", damping: 15 }}
                                    >
                                        <BrandingHeader />
                                    </motion.div>
                                    <motion.h1
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-xl font-bold text-white italic mb-4 drop-shadow-md"
                                    >
                                        "Jualan Seneng, Ati Ge Tenang"
                                    </motion.h1>
                                    <FeatureList />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        animate={{
                                            boxShadow: ["0 20px 50px rgba(0,0,0,0.3)", "0 20px 70px rgba(59,130,246,0.3)", "0 20px 50px rgba(0,0,0,0.3)"]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        onClick={() => setView('login')}
                                        className="mt-14 w-full max-w-sm py-4 bg-white text-[#004ac6] rounded-2xl font-black text-lg lg:text-xl uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center gap-5 border-b-8 border-slate-200 active:border-b-0 transition-all font-manrope"
                                    >
                                        <span>Mulai Sekarang</span>
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                                        </motion.div>
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="login"
                                initial={{ x: '100%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: '100%', opacity: 0 }}
                                transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
                                className="absolute inset-0 bg-white flex flex-col min-h-screen overflow-hidden"
                            >
                                <div className="flex-1 flex items-center justify-center p-8">
                                    <div className="w-full max-w-md">
                                        <div className="mb-5 text-center relative">
                                            <LoginErrorAlert message={visibleError} isMobile={isMobile} />
                                            <h2 className="text-3xl font-[900] text-slate-900 tracking-tighter leading-none mb-2">Selamat Datang</h2>
                                            <p className="text-slate-500 font-medium pb-2 text-sm leading-none">Masukkan email dan kata sandi Anda.</p>
                                        </div>
                                        <LoginForm
                                            data={data} setData={setData} errors={errors}
                                            processing={processing} handleSubmit={handleSubmit}
                                            showPassword={showPassword} setShowPassword={setShowPassword}
                                            isMobile={true}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                /* DESKTOP & LANDSCAPE MODE: SIDE-BY-SIDE UI */
                <div className="w-full lg:h-full flex" key="landscape">
                    {/* LEFT PANEL */}
                    <div className="lg:w-1/2 bg-[#004ac6] relative flex justify-center items-center lg:justify-center px-6 py-6 md:p-16 lg:p-12 shrink-0 overflow-hidden">
                        <div className="relative z-10 max-w-sm lg:max-w-md w-full flex flex-col items-center anim-fade-in-up">
                            <BrandingHeader />
                            <h1 className="text-lg md:text-[24px] lg:text-[24px] font-bold text-white leading-tight tracking-tight mb-4 lg:mb-6 text-center md:whitespace-nowrap italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                                "Jualan Seneng, Ati Ge Tenang"
                            </h1>
                            <FeatureList />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
                    </div>

                    <div className="lg:w-1/2 lg:h-full flex justify-center items-center p-8 md:p-16 lg:p-12 bg-white relative">
                        <div className="w-full max-w-sm md:max-w-[340px] lg:max-w-[280px] anim-fade-in-right">
                            <div className="mb-4 lg:mb-3 text-center relative">
                                <LoginErrorAlert message={visibleError} isMobile={false} />
                                <h2 className="text-3xl md:text-[34px] lg:text-[30px] font-[900] text-slate-900 tracking-tighter mb-2 lg:mb-1.5 leading-none">Selamat Datang</h2>
                                <p className="text-slate-500 font-medium text-sm md:text-base lg:text-[11px] pb-3 lg:pb-2 leading-none">Masukkan email dan kata sandi Anda.</p>
                            </div>
                            <LoginForm
                                data={data} setData={setData} errors={errors}
                                processing={processing} handleSubmit={handleSubmit}
                                showPassword={showPassword} setShowPassword={setShowPassword}
                                isMobile={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                .anim-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .anim-fade-in-right { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}} />
        </main>
    );
}
