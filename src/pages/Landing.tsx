import { Zap, ArrowRight } from 'lucide-react';

interface LandingProps {
  onLaunch: () => void;
}

export default function Landing({ onLaunch }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Zap size={64} className="text-yellow-400" />
          <h1 className="text-6xl font-bold text-white">THUNDER</h1>
        </div>

        <h2 className="text-5xl font-bold text-white mb-4">ACCOUNTANT</h2>

        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          AI-powered double-entry bookkeeping. Transform your transactions into journals, ledgers,
          trial balance, and P&L statements instantly.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-12 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Automated Journal Entries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Real-time Ledgers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Trial Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>P&L Reports</span>
          </div>
        </div>

        <button
          onClick={onLaunch}
          className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
        >
          Launch Dashboard
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-blue-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">
              Generate complete accounting reports in seconds with AI-powered automation.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-green-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">100% Accurate</h3>
            <p className="text-gray-400 text-sm">
              Double-entry bookkeeping ensures balanced accounts every time.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-yellow-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Export Ready</h3>
            <p className="text-gray-400 text-sm">
              Download your reports instantly for record-keeping or audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
