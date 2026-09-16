import { useState, useRef, useEffect } from 'react';
import { Bot, SendHorizonal, Inbox, Sparkles, Search, Edit3, Reply, CheckCircle2, AlertTriangle } from 'lucide-react';
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
    <div className="w-[320px] bg-white flex flex-col h-full shrink-0 shadow-sm z-20">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="font-medium text-gray-800 text-sm">Nebula AI</h2>
        </div>
        <div className="flex items-center">
          {aiStatus === 'ready' ? (
            <div className="w-2 h-2 rounded-full bg-green-500" title="System Online"></div>
          ) : (
            <div title="Temporarily Unavailable">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
        
        {/* Dashboard Content */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-6 mb-2">
            <div className="text-center py-4">
              <h3 className="text-sm font-medium text-gray-800 mb-1">
                How can I help you today?
              </h3>
              <p className="text-xs text-gray-500">
                Ask me to search, draft, or summarize emails.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Suggestions</h4>
              <div className="flex flex-col gap-1">
                <button onClick={() => dispatchPrompt("Find my unread emails.", true)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group">
                  <Inbox className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                  <span className="text-sm text-gray-700">Find Unread Emails</span>
                </button>
                <button onClick={() => dispatchPrompt("Find important emails in my inbox.", true)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group">
                  <AlertTriangle className="w-4 h-4 text-gray-500 group-hover:text-amber-600" />
                  <span className="text-sm text-gray-700">Find Important Emails</span>
                </button>
                <button onClick={() => dispatchPrompt("Help me draft an email.", true)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left group">
                  <Edit3 className="w-4 h-4 text-gray-500 group-hover:text-green-600" />
                  <span className="text-sm text-gray-700">Draft a new email</span>
                </button>
              </div>
            </div>

            {aiActivity.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Activity</h4>
                <div className="flex flex-col gap-1">
                  {aiActivity.map(activity => (
                    <div key={activity.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-100 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-gray-600 flex-1 truncate">{getToolDisplayName(activity.name)}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{formatDistanceToNow(activity.time, { addSuffix: true })}</span>
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
              className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-blue-50 text-blue-900 border-blue-100 rounded-tr-sm' 
                  : 'bg-white text-gray-800 border-gray-200 rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg rounded-tl-sm border border-gray-200 shadow-sm flex items-center gap-2 text-gray-500 text-sm">
              <Sparkles className="w-4 h-4 animate-pulse text-blue-500" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-white shrink-0">
        <form 
          onSubmit={handleSubmit}
          className="relative flex flex-col"
        >
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Nebula AI..." 
              className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white text-gray-800 placeholder-gray-400 disabled:opacity-50 transition-colors shadow-sm"
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="absolute right-1.5 p-1.5 text-blue-600 rounded-full hover:bg-blue-50 transition-colors disabled:text-gray-300 disabled:hover:bg-transparent flex items-center justify-center"
              disabled={isLoading || !inputValue.trim()}
            >
              <SendHorizonal className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssistantPanel;
