import { useState, useEffect } from 'react';
import { ArrowLeft, CornerUpLeft, Trash2 } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

const EmailDetail = () => {
  const { emails, selectedEmailId, closeEmail, openCompose } = useMailStore();

  const email = emails.find(e => e.id === selectedEmailId);
  if (!email) return null;



  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="border-b border-slate-800 p-2 flex items-center gap-2 text-slate-400">
        <button 
          onClick={closeEmail}
          className="p-2 hover:bg-slate-800 hover:text-slate-200 rounded-full transition-colors"
          title="Back to list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => openCompose({ to: email.senderEmail, subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}` })}
          className="p-2 hover:bg-slate-800 hover:text-slate-200 rounded-full transition-colors ml-4"
          title="Reply"
        >
          <CornerUpLeft className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-slate-800 hover:text-slate-200 rounded-full transition-colors" title="Delete">
          <Trash2 className="w-5 h-5" />
        </button>
        
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6">{email.subject}</h2>
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-900/50 text-violet-400 rounded-full flex items-center justify-center font-bold text-lg uppercase">
              {email.sender.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-slate-100">
                {email.sender} <span className="text-sm font-normal text-slate-500 ml-1">&lt;{email.senderEmail}&gt;</span>
              </div>
              <div className="text-sm text-slate-400">to {email.recipient}</div>
            </div>
          </div>
          <div className="text-sm text-slate-500 whitespace-nowrap">
            {format(new Date(email.date), 'MMM d, yyyy, h:mm a')}
          </div>
        </div>


        
        <div className="flex-1">
          {email.htmlBody ? (
            <div className="bg-slate-200 p-4 rounded-lg overflow-x-auto text-black mb-8 shadow-inner">
              <div 
                className="email-html-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.htmlBody, {
                  USE_PROFILES: { html: true },
                  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                }) }} 
              />
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed mb-8">
              {email.body}
            </div>
          )}
        </div>



      </div>
    </div>
  );
};

export default EmailDetail;
