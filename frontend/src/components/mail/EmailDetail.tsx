import { ArrowLeft, CornerUpLeft, Trash2, Printer, MoreVertical, UserCircle } from 'lucide-react';
import { useMailStore } from '../../store/mailStore';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

const EmailDetail = () => {
  const { emails, selectedEmailId, closeEmail, openCompose } = useMailStore();

  const email = emails.find(e => e.id === selectedEmailId);
  if (!email) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-100 p-2 flex items-center gap-4 text-gray-500">
        <button 
          onClick={closeEmail}
          className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
          title="Back to inbox"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-px h-5 bg-gray-200"></div>
        <button className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-normal text-gmail-text">{email.subject}</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Printer className="w-4 h-4" /></button>
          </div>
        </div>
        
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg mt-0.5 shrink-0">
            {email.sender.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-gmail-text mr-2">{email.sender}</span>
                <span className="text-xs text-gmail-textMuted">&lt;{email.senderEmail}&gt;</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gmail-textMuted whitespace-nowrap">
                  {format(new Date(email.date), 'MMM d, yyyy, h:mm a')}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => openCompose({ to: email.senderEmail, subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}` })}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <CornerUpLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="text-xs text-gmail-textMuted mt-0.5">
              to {email.recipient}
            </div>
          </div>
        </div>
        
        <div className="flex-1 pl-12">
          {email.htmlBody ? (
            <div className="text-gmail-text text-sm">
              <div 
                className="email-html-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.htmlBody, {
                  USE_PROFILES: { html: true },
                  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                }) }} 
              />
            </div>
          ) : (
            <div className="text-gmail-text whitespace-pre-wrap text-sm leading-relaxed">
              {email.body}
            </div>
          )}
          
          <div className="mt-8 pt-4">
            <button 
              onClick={() => openCompose({ to: email.senderEmail, subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}` })}
              className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <CornerUpLeft className="w-4 h-4" />
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
