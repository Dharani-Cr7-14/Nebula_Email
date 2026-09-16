from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import base64
import re
import logging
from html.parser import HTMLParser
from email.message import EmailMessage

logger = logging.getLogger(__name__)

class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = []
        self.ignore = False

    def handle_starttag(self, tag, attrs):
        if tag in ['script', 'style', 'head', 'title', 'meta']:
            self.ignore = True
        elif tag in ['br', 'p', 'div', 'tr', 'li']:
            self.text.append('\n')

    def handle_endtag(self, tag):
        if tag in ['script', 'style', 'head', 'title', 'meta']:
            self.ignore = False
        elif tag in ['p', 'div', 'tr', 'li']:
            self.text.append('\n')

    def handle_data(self, d):
        if not self.ignore:
            self.text.append(d)

    def get_data(self):
        text = ''.join(self.text)
        text = re.sub(r'\n\s*\n+', '\n\n', text)
        return text.strip()

class GmailService:
    def __init__(self, credentials_dict: dict):
        self.creds = Credentials(**credentials_dict)
        self.service = build('gmail', 'v1', credentials=self.creds)

    def _parse_headers(self, headers, target_names):
        parsed = {name: "" for name in target_names}
        for header in headers:
            name = header['name'].lower()
            if name in target_names:
                parsed[name] = header['value']
        return parsed

    def _extract_parts(self, payload):
        """Recursively extract plain text and html text from parts."""
        plain_text = ""
        html_text = ""
        
        mime_type = payload.get("mimeType")
        if mime_type == "text/plain":
            data = payload.get("body", {}).get("data")
            if data:
                try:
                    plain_text += base64.urlsafe_b64decode(data).decode("utf-8")
                except Exception:
                    pass
        elif mime_type == "text/html":
            data = payload.get("body", {}).get("data")
            if data:
                try:
                    html_text += base64.urlsafe_b64decode(data).decode("utf-8")
                except Exception:
                    pass
        elif "parts" in payload:
            for part in payload["parts"]:
                p_text, h_text = self._extract_parts(part)
                plain_text += p_text
                html_text += h_text
                
        return plain_text, html_text

    def _get_body(self, payload):
        plain_text, html_text = self._extract_parts(payload)
        
        final_plain = ""
        final_html = ""
        
        if plain_text.strip():
            final_plain = plain_text.strip()
        elif html_text.strip():
            s = MLStripper()
            try:
                s.feed(html_text)
                final_plain = s.get_data()
            except Exception:
                final_plain = html_text
                
        if html_text.strip():
            final_html = html_text.strip()
            
        return final_plain, final_html

    def _map_to_email(self, msg_detail, folder: str) -> dict:
        payload = msg_detail.get('payload', {})
        headers = payload.get('headers', [])
        
        parsed_headers = self._parse_headers(headers, ['from', 'to', 'subject', 'date'])
        
        # Simple parsing for sender/email
        sender_raw = parsed_headers['from']
        sender_email = sender_raw
        sender_name = sender_raw
        if '<' in sender_raw and '>' in sender_raw:
            parts = sender_raw.split('<')
            sender_name = parts[0].strip(' "')
            sender_email = parts[1].strip('>')

        body, html_body = self._get_body(payload)
        snippet = msg_detail.get('snippet', '')
        
        label_ids = msg_detail.get('labelIds', [])
        is_read = 'UNREAD' not in label_ids

        return {
            "id": msg_detail['id'],
            "threadId": msg_detail.get('threadId'),
            "sender": sender_name,
            "senderEmail": sender_email,
            "recipient": parsed_headers['to'],
            "subject": parsed_headers['subject'] or '(No Subject)',
            "preview": snippet,
            "body": body,
            "htmlBody": html_body,
            "date": parsed_headers['date'],
            "timestamp": int(msg_detail.get('internalDate', 0)),
            "isRead": is_read,
            "folder": folder
        }

    def get_messages(self, query: str = '', folder: str = 'inbox', max_results: int = 15, page_token: str = None) -> dict:
        actual_query = query
        if folder == 'inbox':
            actual_query = f"in:inbox {query}".strip()
        elif folder == 'sent':
            actual_query = f"in:sent {query}".strip()

        logger.info(f"[Gmail Search] folder={folder!r} | raw_query={query!r} | final_query_to_gmail={actual_query!r}")

        kwargs = {'userId': 'me', 'q': actual_query, 'maxResults': max_results}
        if page_token:
            kwargs['pageToken'] = page_token

        results = self.service.users().messages().list(**kwargs).execute()
        logger.info(f"[Gmail Search] result_count={len(results.get('messages', []))} | hasNextPage={'nextPageToken' in results}")
        
        messages = results.get('messages', [])
        next_page_token = results.get('nextPageToken')
        emails = []
        
        for msg in messages:
            msg_detail = self.service.users().messages().get(
                userId='me', id=msg['id'], format='metadata', metadataHeaders=['From', 'To', 'Subject', 'Date']
            ).execute()
            emails.append(self._map_to_email(msg_detail, folder))
            
        return {"emails": emails, "nextPageToken": next_page_token}

    def get_message(self, message_id: str) -> dict:
        msg_detail = self.service.users().messages().get(
            userId='me', id=message_id, format='full'
        ).execute()
        
        folder = 'inbox'
        if 'SENT' in msg_detail.get('labelIds', []):
            folder = 'sent'
            
        return self._map_to_email(msg_detail, folder)

    def send_message(self, to: str, subject: str, body: str):
        message = EmailMessage()
        message.set_content(body)
        message['To'] = to
        message['Subject'] = subject
        
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {'raw': encoded_message}
        
        send_message = (self.service.users().messages().send(userId="me", body=create_message).execute())
        return send_message

    def modify_message(self, message_id: str, add_labels: list = None, remove_labels: list = None) -> dict:
        body = {}
        if add_labels:
            body['addLabelIds'] = add_labels
        if remove_labels:
            body['removeLabelIds'] = remove_labels
            
        return self.service.users().messages().modify(userId="me", id=message_id, body=body).execute()
