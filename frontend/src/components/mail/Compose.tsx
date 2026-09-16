import { X, Minus, Maximize2 } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';

const Compose = () => {
  const { composeOpen, composeDraft, updateComposeDraft, closeCompose, sendEmailAction } = useMailStore();

  if (!composeOpen) return null;

  return (
    <div className="fixed bottom-0 right-16 w-[500px] bg-white rounded-t-xl shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-gray-200 flex flex-col z-[9999] overflow-hidden">
      {/* Header */}
      <div className="bg-[#f2f6fc] text-gray-700 px-4 py-2.5 flex items-center justify-between border-b border-gray-200 rounded-t-xl">
        <h3 className="font-medium text-sm">New Message</h3>
        <div className="flex items-center gap-1">
          <button className="text-gray-500 hover:bg-gray-200 p-1 rounded transition-colors"><Minus className="w-4 h-4" /></button>
          <button className="text-gray-500 hover:bg-gray-200 p-1 rounded transition-colors"><Maximize2 className="w-3.5 h-3.5" /></button>
          <button onClick={closeCompose} className="text-gray-500 hover:bg-gray-200 p-1 rounded transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>
      
      {/* Form */}
      <div className="flex-1 flex flex-col h-[400px]">
        <div className="border-b border-gray-100 px-4 py-2">
          <div className="flex items-center">
            <span className="text-gray-500 text-sm w-12">To</span>
            <input 
              type="email" 
              className="flex-1 focus:outline-none text-sm text-gray-800 bg-transparent"
              value={composeDraft.to}
              onChange={(e) => updateComposeDraft({ to: e.target.value })}
            />
          </div>
        </div>
        
        <div className="border-b border-gray-100 px-4 py-2">
          <div className="flex items-center">
            <input 
              type="text" 
              className="flex-1 focus:outline-none text-sm text-gray-800 bg-transparent placeholder-gray-400"
              placeholder="Subject"
              value={composeDraft.subject}
              onChange={(e) => updateComposeDraft({ subject: e.target.value })}
            />
          </div>
        </div>
        
        <textarea 
          className="flex-1 focus:outline-none text-sm text-gray-800 bg-transparent resize-none p-4 leading-relaxed"
          value={composeDraft.body}
          onChange={(e) => updateComposeDraft({ body: e.target.value })}
        />
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 flex items-center gap-4 border-t border-gray-100">
        <button 
          onClick={sendEmailAction}
          disabled={!composeDraft.to}
          className="bg-[#0b57d0] hover:bg-[#0842a0] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-full transition-all text-sm"
        >
          Send
        </button>
        <button onClick={closeCompose} className="text-gray-600 hover:bg-gray-100 font-medium p-2 transition-colors text-sm ml-auto rounded-full">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

import { Trash2 } from 'lucide-react';

export default Compose;
