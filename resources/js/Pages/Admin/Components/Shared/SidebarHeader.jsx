import React from 'react';
import { Store } from 'lucide-react';

const SidebarHeader = React.memo(({ storeName, userName, logo }) => (
  <div className="flex items-center gap-3 p-2">
    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md overflow-hidden shrink-0 ring-2 ring-blue-50">
      {logo ? <img src={logo} className="w-full h-full object-cover" /> : <Store size={20} />}
    </div>
    <div className="flex-1 overflow-hidden flex flex-col justify-center">
      <h1 className="text-slate-800 font-manrope font-black text-sm truncate leading-none tracking-tight mb-1" title={storeName}>
        {storeName || 'KasirKite'}
      </h1>
      <p className="text-[8px] text-blue-600 font-manrope font-black uppercase tracking-widest truncate opacity-80">
        {userName}
      </p>
    </div>
  </div>
));

export default SidebarHeader;
