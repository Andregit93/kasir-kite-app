import React, { useState, useEffect } from 'react';

const RealTimeClock = React.memo(() => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => { 
    const timer = setInterval(() => setTime(new Date()), 1000); 
    return () => clearInterval(timer); 
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 transition-all border border-slate-100 rounded-xl py-1.5 shadow-sm">
      <div className="flex items-center gap-2 pr-2 border-r border-slate-200 text-slate-500">
        <span className="text-[12px] font-manrope font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
          {time.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-manrope font-black text-blue-600 tracking-tighter tabular-nums flex items-baseline">
          {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
          <span className="text-[12px] text-blue-400 font-bold ml-1 opacity-60">
            {time.toLocaleTimeString('id-ID', { second: '2-digit' })}
          </span>
        </span>
      </div>
    </div>
  );
});

export default RealTimeClock;
