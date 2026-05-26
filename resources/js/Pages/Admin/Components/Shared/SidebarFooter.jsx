import React from 'react';
import { LogOut } from 'lucide-react';

const SidebarFooter = React.memo(({ onLogout }) => (
  <button 
    onClick={onLogout} 
    className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm shadow-red-100/50 active:scale-[0.98] group"
  >
    <LogOut size={14} className="transition-transform group-hover:-translate-x-0.5" />
    Keluar Akun
  </button>
));

export default SidebarFooter;
