import { Reply, CheckSquare, MoreHorizontal } from 'lucide-react';
import type { Email } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useMailStore } from '../../store/mailStore';

interface Props {
  email: Email;
  onClick: () => void;
  isSentView?: boolean;
}

const EmailListItem = ({ email, onClick, isSentView }: Props) => {
  const { openCompose, markAsRead } = useMailStore();
  const displayName = isSentView ? `To: ${email.recipient}` : email.sender;
  const initial = (isSentView ? email.recipient : email.sender).charAt(0).toUpperCase();

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCompose({ to: email.senderEmail, subject: `Re: ${email.subject}` });
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (email.isRead) {
      useMailStore.getState().markAsUnread(email.id);
    } else {
      useMailStore.getState().markAsRead(email.id);
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-4 py-3 px-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/40 transition-colors ${!email.isRead ? 'bg-slate-800/20' : 'bg-transparent'}`}
    >
      <div className="w-4 h-4 flex items-center justify-center shrink-0">
        {!email.isRead && (
          <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
        )}
      </div>

      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${!email.isRead ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
        {initial}
      </div>
      
      <div className={`w-40 shrink-0 truncate text-sm ${!email.isRead ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
        {displayName}
      </div>
      
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
          {email.subject}
        </span>
        <span className="text-slate-500 text-sm truncate">- {email.preview}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0 relative w-24 justify-end">
        <div className="group-hover:hidden text-xs text-slate-400 whitespace-nowrap">
          {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
        </div>
        
        <div className="hidden group-hover:flex items-center gap-1">
          <button onClick={handleReply} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300 transition-colors" title="Reply">
            <Reply className="w-4 h-4" />
          </button>
          <button 
            onClick={handleToggleRead} 
            className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300 transition-colors" 
            title={email.isRead ? "Mark as unread" : "Mark as read"}
          >
            {email.isRead ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <CheckSquare className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailListItem;
