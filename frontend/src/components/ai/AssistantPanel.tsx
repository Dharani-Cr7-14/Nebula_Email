import { useState, useRef, useEffect } from 'react';
import { Bot, SendHorizonal, MailPlus, Inbox, Send, Loader2, Sparkles, Search, Edit3, Reply, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { executeAIAction, getAIContext } from '../../services/aiActionService';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isAction?: boolean;
}

interface AiActivity {
  id: string;
  name: string;
  time: number;
}

const AssistantPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<'ready'|'unavailable'>('ready');
  const [aiActivity, setAiActivity] = useState<AiActivity[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, aiActivity]);

  const processPrompt = async (textToSubmit: string) => {
    if (!textToSubmit.trim() || isLoading) return;
    
    setInputValue("");
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSubmit
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    
    try {
      let iterationCount = 0;
      let currentMessage = textToSubmit;
      let isDone = false;
      let allToolResults: any[] = [];
      let lastToolCallSignature = "";
      
      while (!isDone && iterationCount < 10) {
        iterationCount++;
        const context = getAIContext();
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: currentMessage,
            context: context
          })
        });
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Gemini AI quota has been reached for now. Please try again later.");
          }
          throw new Error("AI service is temporarily unavailable. Please try again later.");
        }
        
        setAiStatus('ready');
        const data = await response.json();
        
        if (data.text && (data.text !== "I'm performing that action for you now." || !data.tool_calls?.length)) {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random(),
            role: 'assistant',
            content: data.text
          }]);
        }
        
        if (data.tool_calls && data.tool_calls.length > 0) {
          const currentSignature = JSON.stringify(data.tool_calls);
          if (currentSignature === lastToolCallSignature) {
            // AI is repeating the exact same tool calls without new information.
            // Break the loop to prevent infinite repetition.
            isDone = true;
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: "I couldn't complete that request. Please try again."
            }]);
            break;
          }
          lastToolCallSignature = currentSignature;

          let iterationResults = [];
          
          for (const tool of data.tool_calls) {
            const result = await executeAIAction(tool.name, tool.parameters);
            const toolSummary = { name: tool.name, result };
            iterationResults.push(toolSummary);
            allToolResults.push(toolSummary);
            
            if (result.success) {
              setAiActivity(prev => {
                const newActivity = [{ id: Date.now().toString() + Math.random(), name: tool.name, time: Date.now() }, ...prev];
                return newActivity.slice(0, 5);
              });
            }
          }
          
          currentMessage = `Original user request: "${textToSubmit}"\n\nTool execution history so far:\n${JSON.stringify(allToolResults, null, 2)}\n\nIMPORTANT: If search_emails returned emails with 'id' fields, those are the real Gmail message IDs. Use them immediately in open_email — do not guess or modify them. If the user's request is fully complete, provide a brief final response. Otherwise, call the next required tool.`;
        } else {
          isDone = true;
        }
      }
      
      if (iterationCount >= 10 && !isDone) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I couldn't complete that request. Please try again."
        }]);
      }
      
    } catch (error: any) {
      console.error(error);
      setAiStatus('unavailable');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: error.message || "Sorry, I couldn't complete that request."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleQuickPrompt = (e: CustomEvent) => {
      if (e.detail) {
        if (typeof e.detail === 'string') {
          setInputValue(e.detail);
        } else if (typeof e.detail === 'object') {
          const { prompt, autoSubmit } = e.detail;
          if (prompt) {
            if (autoSubmit && !isLoading) {
              processPrompt(prompt);
            } else {
              setInputValue(prompt);
            }
          }
        }
      }
    };
    
    const handleAiActivityLog = (e: CustomEvent) => {
      if (e.detail && typeof e.detail === 'string') {
        setAiActivity(prev => {
          const newActivity = [{ id: Date.now().toString() + Math.random(), name: e.detail, time: Date.now() }, ...prev];
          return newActivity.slice(0, 5);
        });
      }
    };
    
    window.addEventListener('ai-quick-prompt', handleQuickPrompt as EventListener);
    window.addEventListener('ai-activity-log', handleAiActivityLog as EventListener);
    return () => {
      window.removeEventListener('ai-quick-prompt', handleQuickPrompt as EventListener);
      window.removeEventListener('ai-activity-log', handleAiActivityLog as EventListener);
    };
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processPrompt(inputValue);
  };

  const getToolDisplayName = (name: string) => {
    const map: Record<string, string> = {
      'search_emails': 'Email search completed',
      'open_compose': 'Compose opened',
      'fill_compose': 'Draft updated',
      'send_email': 'Email sent',
      'start_reply': 'Reply prepared',
      'navigate_to_inbox': 'Navigated to Inbox',
      'navigate_to_sent': 'Navigated to Sent',
      'open_email': 'Email opened'
    };
    return map[name] || name;
  };

  const dispatchPrompt = (prompt: string, autoSubmit: boolean = false) => {
    window.dispatchEvent(new CustomEvent('ai-quick-prompt', { detail: { prompt, autoSubmit } }));
  };

  return (
    <div className="w-[340px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col gap-1 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" />
            <h2 className="font-semibold text-slate-100 leading-none">AI COMMAND CENTER</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1 ml-7">
          {aiStatus === 'ready' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Gemini Ready</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">Gemini Temporarily Unavailable</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-900/50">
        
        {/* Dashboard Content */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" /> Your email copilot
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search, compose, and manage your mailbox using natural language.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => dispatchPrompt("Find my unread emails.", true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-violet-500/30 transition-all text-left">
                  <Inbox className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-slate-300">Find Unread</span>
                </button>
                <button onClick={() => dispatchPrompt("Find important emails in my inbox.", true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-violet-500/30 transition-all text-left">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-slate-300">Find Important</span>
                </button>
                <button onClick={() => dispatchPrompt("Help me draft an email.", true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-violet-500/30 transition-all text-left">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-300">Draft Email</span>
                </button>
                <button onClick={() => dispatchPrompt("Help me search my emails.", true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-violet-500/30 transition-all text-left">
                  <Search className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs font-medium text-slate-300">Search Emails</span>
                </button>
                <button onClick={() => dispatchPrompt("Reply to the currently open email.", true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-violet-500/30 transition-all text-left">
                  <Reply className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-medium text-slate-300">Reply</span>
                </button>
              </div>
            </div>

            {aiActivity.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Recent AI Activity</h4>
                <div className="flex flex-col gap-2">
                  {aiActivity.map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-300 flex-1 truncate">{getToolDisplayName(activity.name)}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">{formatDistanceToNow(activity.time, { addSuffix: true })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        {messages.filter(msg => !msg.isAction).map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-violet-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none border border-slate-700 shadow-sm flex items-center gap-2 text-slate-200 text-sm">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span>Working on it...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
        
        {/* Developer Test Actions (hidden behind details toggle) */}
        {messages.length > 0 && (
          <details className="mt-auto border-t border-slate-800/50 pt-4">
            <summary className="text-[10px] text-center text-slate-600 font-medium mb-3 cursor-pointer hover:text-slate-400 uppercase tracking-wider select-none">
              Developer Test Actions
            </summary>
            <div className="flex flex-col gap-2">
              <button onClick={() => executeAIAction("open_compose", {})} className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
                <MailPlus className="w-3.5 h-3.5" /> Open Compose
              </button>
              <button onClick={() => executeAIAction("navigate_to_inbox", {})} className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
                <Inbox className="w-3.5 h-3.5" /> Go to Inbox
              </button>
              <button onClick={() => executeAIAction("navigate_to_sent", {})} className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors">
                <Send className="w-3.5 h-3.5" /> Go to Sent
              </button>
            </div>
          </details>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
        <form 
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-2"
        >
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask NebulaMail AI anything..." 
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-slate-900 text-slate-200 placeholder-slate-500 disabled:bg-slate-800 disabled:text-slate-500 transition-colors shadow-inner"
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="absolute right-1.5 p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
              disabled={isLoading || !inputValue.trim()}
            >
              <SendHorizonal className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-[9px] text-slate-500 font-medium tracking-wide">Enter to send</span>
            <span className="text-[9px] text-slate-600 font-medium tracking-wide">Ctrl+K to focus</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssistantPanel;
