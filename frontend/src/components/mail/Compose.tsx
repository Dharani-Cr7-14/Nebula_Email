import { X } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

const Compose = () => {
  const { composeOpen, composeDraft, updateComposeDraft, closeCompose, sendEmailAction } = useMailStore();

  if (!composeOpen) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-slate-900 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-slate-700 flex flex-col z-[9999] overflow-hidden" style={{ height: '500px' }}>
      {/* Header */}
      <div className="bg-slate-800 text-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <h3 className="font-semibold text-sm">New Message</h3>
        <button onClick={closeCompose} className="text-slate-400 hover:text-slate-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Form */}
      <div className="flex-1 flex flex-col p-4">
        <div className="border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center">
            <span className="text-slate-400 text-sm font-medium w-16">To</span>
            <input 
              type="email" 
              className="flex-1 focus:outline-none text-sm text-slate-100 bg-transparent"
              value={composeDraft.to}
              onChange={(e) => updateComposeDraft({ to: e.target.value })}
            />
          </div>
        </div>
        
        <div className="border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center">
            <input 
              type="text" 
              className="flex-1 focus:outline-none text-sm font-medium text-slate-100 bg-transparent placeholder-slate-600"
              placeholder="Subject"
              value={composeDraft.subject}
              onChange={(e) => updateComposeDraft({ subject: e.target.value })}
            />
          </div>
        </div>
        
        <textarea 
          className="flex-1 focus:outline-none text-sm text-slate-100 bg-transparent resize-none mt-2"
          value={composeDraft.body}
          onChange={(e) => updateComposeDraft({ body: e.target.value })}
        />
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800 flex items-center gap-3">
        <button 
          onClick={sendEmailAction}
          disabled={!composeDraft.to}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800/50 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-full transition-colors text-sm"
        >
          Send
        </button>
        <button onClick={closeCompose} className="text-slate-400 hover:text-slate-200 font-medium py-2 px-4 transition-colors text-sm ml-auto">
          Discard
        </button>
      </div>
    </div>
  );
};

export default Compose;
