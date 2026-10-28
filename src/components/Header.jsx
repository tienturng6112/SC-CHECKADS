export default function Header({ title }) {
  return (
    <header className="h-16 px-6 md:px-8 border-b border-slate-800/80 bg-[#0d111a]/60 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131824] border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-cyan-400 font-medium">Meta Ads 2026 Engine</span>
        </div>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-500/20">
          HN
        </div>
      </div>
    </header>
  );
}
