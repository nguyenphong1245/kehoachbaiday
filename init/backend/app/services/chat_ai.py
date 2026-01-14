"""
Service xử lý chat AI
"""
import os
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


class ChatAIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found")
        
        genai.configure(api_key=api_key)
        
        self.model = genai.GenerativeModel(
            model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
            }
        )
    
    async def generate_response(self, message_history: list) -> str:
        """
        Tạo phản hồi từ AI
        
        Args:
            message_history: Lịch sử hội thoại [{"role": "user/assistant", "content": "..."}]
        
        Returns:
            str: Phản hồi từ AI
        """
        try:
            # Xây dựng context từ lịch sử
            if message_history:
                context = "\n".join([
                    f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
                    for msg in message_history[-10:]  # Lấy 10 tin nhắn gần nhất
                ])
                prompt = f"{context}\nAssistant:"
            else:
                prompt = "Hello"
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            return f"Lỗi khi tạo phản hồi: {str(e)}"
    
    async def generate_conversation_title(self, first_message: str) -> str:
        """
        Tạo tiêu đề cho cuộc hội thoại dựa trên tin nhắn đầu tiên
        
        Args:
            first_message: Tin nhắn đầu tiên của người dùng
        
        Returns:
            str: Tiêu đề ngắn gọn cho cuộc hội thoại
        """
        try:
            prompt = f"Tạo một tiêu đề ngắn gọn (tối đa 50 ký tự) cho cuộc hội thoại bắt đầu bằng câu hỏi: '{first_message}'. Chỉ trả về tiêu đề, không giải thích."
            response = self.model.generate_content(prompt)
            title = response.text.strip()
            # Giới hạn độ dài
            if len(title) > 50:
                title = title[:47] + "..."
            return title
        except Exception as e:
            # Fallback: Lấy 50 ký tự đầu của tin nhắn
            return first_message[:47] + "..." if len(first_message) > 50 else first_message


# Singleton instance
_chat_ai_service: Optional[ChatAIService] = None


def get_chat_ai_service() -> ChatAIService:
    """Get or create singleton instance of ChatAIService"""
    global _chat_ai_service
    if _chat_ai_service is None:
        _chat_ai_service = ChatAIService()
    return _chat_ai_service
