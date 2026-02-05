"""
Script chuyển đổi các file PDF trong thư mục CT sang Markdown sử dụng LlamaParse
"""
import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from llama_parse import LlamaParse

# Load environment variables
load_dotenv()

# Cấu hình
CT_FOLDER = Path(__file__).parent.parent / "app" / "services" / "data" / "CT"
OUTPUT_FOLDER = CT_FOLDER  # Lưu markdown cùng thư mục với PDF

async def convert_pdf_to_markdown(pdf_path: Path) -> str:
    """Convert một file PDF sang Markdown sử dụng LlamaParse"""
    
    parser = LlamaParse(
        api_key=os.getenv("LLAMA_CLOUD_API_KEY"),
        result_type="markdown",
        language="vi",  # Tiếng Việt
        verbose=True
    )
    
    print(f"\n{'='*60}")
    print(f"Đang xử lý: {pdf_path.name}")
    print(f"{'='*60}")
    
    # Parse PDF
    documents = await parser.aload_data(str(pdf_path))
    
    # Ghép tất cả các trang thành một chuỗi markdown
    markdown_content = "\n\n".join([doc.text for doc in documents])
    
    return markdown_content

async def main():
    """Hàm chính để convert tất cả các file PDF trong thư mục CT"""
    
    # Kiểm tra API key
    api_key = os.getenv("LLAMA_CLOUD_API_KEY")
    if not api_key:
        print("❌ Lỗi: Không tìm thấy LLAMA_CLOUD_API_KEY trong file .env")
        return
    
    print(f"✅ API Key: {api_key[:10]}...{api_key[-4:]}")
    print(f"📁 Thư mục CT: {CT_FOLDER}")
    
    # Lấy danh sách các file PDF
    pdf_files = list(CT_FOLDER.glob("*.pdf"))
    
    if not pdf_files:
        print("❌ Không tìm thấy file PDF nào trong thư mục CT")
        return
    
    print(f"\n📄 Tìm thấy {len(pdf_files)} file PDF:")
    for pdf in pdf_files:
        print(f"   - {pdf.name}")
    
    # Convert từng file
    for pdf_path in pdf_files:
        try:
            # Convert PDF sang Markdown
            markdown_content = await convert_pdf_to_markdown(pdf_path)
            
            # Tạo tên file output
            output_name = pdf_path.stem + ".md"
            output_path = OUTPUT_FOLDER / output_name
            
            # Lưu file markdown
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(f"# {pdf_path.stem}\n\n")
                f.write(f"*Nguồn: {pdf_path.name}*\n\n")
                f.write("---\n\n")
                f.write(markdown_content)
            
            print(f"✅ Đã lưu: {output_path.name}")
            
        except Exception as e:
            print(f"❌ Lỗi khi xử lý {pdf_path.name}: {e}")
    
    print(f"\n{'='*60}")
    print("🎉 Hoàn thành!")
    print(f"{'='*60}")

if __name__ == "__main__":
    asyncio.run(main())
