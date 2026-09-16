import { Star, GripVertical, CheckSquare, Clock } from 'lucide-react';
import type { Email } from '../../types';
import { format } from 'date-fns';
import { useMailStore } from '../../store/mailStore';
import { cn } from '../../utils/cn';

interface Props {
  email: Email;
  onClick: () => void;
  isSentView?: boolean;
}

const EmailListItem = ({ email, onClick, isSentView }: Props) => {
  const { openCompose, markAsRead } = useMailStore();
  const displayName = isSentView ? `To: ${email.recipient}` : email.sender;

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (email.isRead) {
      useMailStore.getState().markAsUnread(email.id);
    } else {
      useMailStore.getState().markAsRead(email.id);
    }
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app we'd toggle a starred state
  };

  // Format date correctly: e.g. "Sep 15" for current year, "15/09/2023" for older
  const formattedDate = format(new Date(email.date), "MMM d");

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex items-center px-1 py-0 cursor-pointer border-b border-gray-100 hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)] transition-shadow",
        !email.isRead ? "bg-white font-bold" : "bg-[#f2f6fc] font-normal"
      )}
    >
      <div className="flex items-center px-3 py-2 gap-3 shrink-0">
        <div className="w-5 flex justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 rounded-sm hover:border-gray-600 transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}></div>
        </div>
        <div className="w-5 flex justify-center text-gray-300 hover:text-gray-500 transition-colors" onClick={handleStar}>
          <Star className="w-4 h-4" />
        </div>
      </div>
      
      <div className={cn(
        "w-48 lg:w-56 shrink-0 truncate text-[14px] px-2",
        !email.isRead ? "text-gmail-text font-bold" : "text-gmail-text font-normal"
      )}>
        {displayName}
      </div>
      
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden px-2 text-[14px]">
        <span className={cn(
          "truncate max-w-full",
          !email.isRead ? "text-gmail-text font-bold" : "text-gmail-text font-normal"
        )}>
          {email.subject}
        </span>
        <span className="text-gmail-textMuted truncate font-normal hidden sm:inline-block">
          <span className="mx-1">-</span>
          {email.preview}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 relative w-24 lg:w-32 justify-end px-4 group-hover:pr-24 transition-all">
        <div className={cn(
          "text-[12px] whitespace-nowrap group-hover:opacity-0 transition-opacity absolute right-4",
          !email.isRead ? "font-bold text-gmail-text" : "font-medium text-gmail-textMuted"
        )}>
          {formattedDate}
        </div>
        
        <div className="hidden group-hover:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bg-white/90 shadow-sm rounded-md px-1 py-1">
          <button 
            onClick={(e) => { e.stopPropagation(); openCompose({ to: email.senderEmail, subject: `Re: ${email.subject}` }); }} 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors" 
            title="Reply"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button 
            onClick={handleToggleRead} 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors" 
            title={email.isRead ? "Mark as unread" : "Mark as read"}
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailListItem;
