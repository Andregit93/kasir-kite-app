import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faBars } from '@fortawesome/free-solid-svg-icons';

export default function Header({
    searchQuery,
    setSearchQuery,
    placeholder = "Cari...",
    currentTime = new Date(),
    showSearch = true,
    onMenuClick
}) {
    return (
        <header className="px-4 md:px-10 py-1 pt-2 md:py-3 lg:pt-6 lg:pb-1 flex flex-col lg:flex-row gap-3 lg:items-center justify-between shrink-0 bg-transparent relative z-20">
            {/* Mobile Top Bar: Hamburger & Brand */}
            <div className="flex items-center justify-between lg:hidden">
                <button
                    onClick={onMenuClick}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-brand active:scale-95 transition-all"
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <h1 className="text-xl font-manrope font-black text-brand tracking-tight flex items-center">
                    Kasir<span className="text-on-surface">Kite</span>
                </h1>
            </div>

            {/* Search Compartment */}
            <div className={`relative w-full lg:max-w-md group ${showSearch ? 'block' : 'hidden'}`}>
                <span className="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400">
                    <FontAwesomeIcon icon={faSearch} size="sm" />
                </span>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-2.5 md:py-3 lg:py-2.5 bg-white border-none rounded-xl md:rounded-full outline-none focus:ring-4 focus:ring-brand/10 focus:bg-white text-xs md:text-sm font-medium transition-all placeholder:text-slate-500 shadow-sm hover:shadow-md"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-6 text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} className="rotate-45" size="xs" />
                    </button>
                )}
            </div>

            <div className="hidden lg:flex items-center gap-6">
                {/* Premium Status Pill: Date & Time */}
                <div className="hidden xl:flex items-center gap-3 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/60 shadow-sm transition-all hover:bg-white/60">
                    <div className="flex items-center gap-2 pr-3 border-r border-slate-300/50 text-slate-500">
                        <span className="text-[9px] font-manrope font-black text-slate-600 uppercase tracking-[0.1em] whitespace-nowrap">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-manrope font-black text-brand tracking-tighter tabular-nums">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-[9px] opacity-40 ml-1">
                                {currentTime.toLocaleTimeString('id-ID', { second: '2-digit' })}
                            </span>
                        </span>
                    </div>
                </div>
                <h1 className="text-xl font-manrope font-black text-brand tracking-tight">Kasir<span>Kite</span></h1>
            </div>
        </header>
    );
}
