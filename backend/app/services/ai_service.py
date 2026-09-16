import json
import logging
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)

TOOLS = [{"function_declarations": [
    {
        "name": "open_compose",
        "description": "Open the compose window",
        "parameters": {
            "type": "OBJECT",
            "properties": {}
        }
    },
    {
        "name": "fill_compose",
        "description": "Fill the currently open compose window with the supplied values",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "to": {"type": "STRING"},
                "subject": {"type": "STRING"},
                "body": {"type": "STRING"}
            }
        }
    },
    {
        "name": "send_email",
        "description": "Send an actual email using the existing Gmail send functionality",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "to": {"type": "STRING"},
                "subject": {"type": "STRING"},
                "body": {"type": "STRING"}
            },
            "required": ["to", "subject", "body"]
        }
    },
    {
        "name": "search_emails",
        "description": "Search Gmail for emails using Gmail search syntax. Operators: from:email, to:email, subject:\"text\", is:unread, after:date. CRITICAL RULES: (1) If this tool returns emails, the returned 'id' fields are the real Gmail message IDs — use them IMMEDIATELY in the next action without modification. (2) Do NOT tell the user no email was found if this tool returned a non-empty list. (3) If count is 0, stop and inform the user. (4) Never retry with a different query.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "query": {"type": "STRING"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "filter_emails",
        "description": "Apply email filters through application state",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "unread": {"type": "BOOLEAN"},
                "after": {"type": "STRING"},
                "before": {"type": "STRING"},
                "sender": {"type": "STRING"}
            }
        }
    },
    {
        "name": "open_email",
        "description": "Open the specified email in the main content area",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "email_id": {"type": "STRING"}
            },
            "required": ["email_id"]
        }
    },
    {
        "name": "navigate_to_inbox",
        "description": "Navigate to Inbox",
        "parameters": {
            "type": "OBJECT",
            "properties": {}
        }
    },
    {
        "name": "navigate_to_sent",
        "description": "Navigate to Sent",
        "parameters": {
            "type": "OBJECT",
            "properties": {}
        }
    },
    {
        "name": "start_reply",
        "description": "Start a reply to the specified email. If email_id is omitted, use the currently opened email.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "email_id": {"type": "STRING"}
            }
        }
    },
    {
        "name": "load_more_emails",
        "description": "Load the next page of emails for the current view (Inbox, Sent, or Search). This APPENDS new emails to the existing list without replacing them. Use this when the user says 'load more', 'show more emails', or 'get more emails'. Do NOT use search_emails or navigate_to_inbox to load more — always use this tool.",
        "parameters": {
            "type": "OBJECT",
            "properties": {}
        }
    }
]}]

def get_assistant_response(message: str, context: dict):
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured on the backend.")
        
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    context_str = json.dumps(context, indent=2)
    prompt = (
        "System: You are NEBULAMAIL AI, an intelligent email assistant that controls the email application via tools.\n"
        "Important rules:\n"
        "- When search_emails returns results, the 'id' in each email object is the REAL Gmail message ID. Use it immediately in open_email.\n"
        "- Never tell the user an email was not found if search_emails returned count > 0.\n"
        "- After open_email, use start_reply (not open_compose) to begin a reply.\n"
        "- After start_reply, use fill_compose to set the reply body, then send_email with to/subject/body.\n"
        "- Do not fabricate message IDs — only use IDs returned by search_emails or present in the context.\n"
        f"\nCurrent user context:\n{context_str}\n\nUser request: {message}"
    )
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=TOOLS,
                temperature=0.0
            )
        )
        
        assistant_text = ""
        tool_calls = []
        
        if response.text:
            assistant_text = response.text
            
        if response.function_calls:
            for fc in response.function_calls:
                args = fc.args if hasattr(fc, 'args') else {}
                parsed_args = dict(args) if hasattr(args, "items") else {}

                tool_calls.append({
                    "name": fc.name,
                    "parameters": parsed_args
                })
        
        if not assistant_text and tool_calls:
            assistant_text = "I'm performing that action for you now."
            
        return {
            "text": assistant_text,
            "tool_calls": tool_calls
        }
    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        raise e
