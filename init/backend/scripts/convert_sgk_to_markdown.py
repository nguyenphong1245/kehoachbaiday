"""
Script sử dụng LlamaParse để chuyển đổi toàn bộ file PDF trong thư mục SGK sang Markdown.
Lưu giữ đúng tên file và cấu trúc thư mục trong DATA_SGK.
"""

import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from llama_parse import LlamaParse

# Load environment variables
load_dotenv(Path(__file__).parent.parent / ".env")

# Đường dẫn gốc
BASE_DIR = Path(__file__).parent.parent / "app" / "services" / "data"
SGK_DIR = BASE_DIR / "SGK"
OUTPUT_DIR = BASE_DIR / "DATA_SGK"

# Lấy API key từ environment
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

if not LLAMA_CLOUD_API_KEY:
    raise ValueError("LLAMA_CLOUD_API_KEY không được cấu hình trong file .env")


async def convert_pdf_to_markdown(pdf_path: Path, output_path: Path, parser: LlamaParse) -> bool:
    """
    Chuyển đổi một file PDF sang Markdown.
    
    Args:
        pdf_path: Đường dẫn file PDF nguồn
        output_path: Đường dẫn file Markdown đích
        parser: Instance của LlamaParse
        
    Returns:
        True nếu thành công, False nếu thất bại
    """
    try:
        print(f"  Đang xử lý: {pdf_path.name}")
        
        # Parse PDF
        documents = await parser.aload_data(str(pdf_path))
        
        if not documents:
            print(f"  ⚠️ Không có nội dung: {pdf_path.name}")
            return False
        
        # Gộp tất cả nội dung từ các trang
        markdown_content = "\n\n".join([doc.text for doc in documents])
        
        # Tạo thư mục đích nếu chưa có
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Ghi file markdown
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)
        
        print(f"  ✅ Hoàn thành: {output_path.name}")
        return True
        
    except Exception as e:
        print(f"  ❌ Lỗi khi xử lý {pdf_path.name}: {str(e)}")
        return False


async def process_folder(folder_name: str, parser: LlamaParse) -> tuple[int, int]:
    """
    Xử lý tất cả file PDF trong một thư mục con.
    
    Args:
        folder_name: Tên thư mục con (ví dụ: "10_CD", "11_KNTT")
        parser: Instance của LlamaParse
        
    Returns:
        Tuple (số file thành công, số file thất bại)
    """
    source_folder = SGK_DIR / folder_name
    target_folder = OUTPUT_DIR / folder_name
    
    if not source_folder.exists():
        print(f"⚠️ Thư mục không tồn tại: {source_folder}")
        return 0, 0
    
    # Lấy danh sách file PDF
    pdf_files = list(source_folder.glob("*.pdf"))
    
    if not pdf_files:
        print(f"⚠️ Không có file PDF trong: {folder_name}")
        return 0, 0
    
    print(f"\n📁 Đang xử lý thư mục: {folder_name} ({len(pdf_files)} files)")
    print("-" * 50)
    
    success_count = 0
    fail_count = 0
    
    for pdf_file in pdf_files:
        # Tạo đường dẫn file markdown đích (đổi đuôi .pdf thành .md)
        md_filename = pdf_file.stem + ".md"
        output_path = target_folder / md_filename
        
        # Bỏ qua nếu file đã tồn tại
        if output_path.exists():
            print(f"  ⏭️ Đã tồn tại, bỏ qua: {md_filename}")
            success_count += 1
            continue
        
        # Chuyển đổi
        if await convert_pdf_to_markdown(pdf_file, output_path, parser):
            success_count += 1
        else:
            fail_count += 1
        
        # Delay nhỏ để tránh rate limit
        await asyncio.sleep(0.5)
    
    return success_count, fail_count


async def main():
    """Hàm chính để chạy quá trình chuyển đổi."""
    
    print("=" * 60)
    print("🚀 BẮT ĐẦU CHUYỂN ĐỔI SGK PDF SANG MARKDOWN")
    print("=" * 60)
    print(f"📂 Thư mục nguồn: {SGK_DIR}")
    print(f"📂 Thư mục đích: {OUTPUT_DIR}")
    print("=" * 60)
    
    # Khởi tạo LlamaParse
    parser = LlamaParse(
        api_key=LLAMA_CLOUD_API_KEY,
        result_type="markdown",
        language="vi",  # Tiếng Việt
        system_prompt="""
        Đây là sách giáo khoa Tin học của Việt Nam.
        Hãy trích xuất toàn bộ nội dung bao gồm:
        - Tiêu đề bài học
        - Nội dung lý thuyết
        - Ví dụ minh họa
        - Bài tập và câu hỏi
        - Hình ảnh mô tả (ghi chú về hình ảnh)
        - Bảng biểu
        Giữ nguyên cấu trúc và định dạng gốc của văn bản.
        """
    )
    
    # Tạo thư mục đích nếu chưa có
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Danh sách các thư mục con cần xử lý
    folders = ["10_CD", "10_KNTT", "11_CD", "11_KNTT", "12_CD", "12_KNTT"]
    
    total_success = 0
    total_fail = 0
    
    for folder in folders:
        success, fail = await process_folder(folder, parser)
        total_success += success
        total_fail += fail
    
    # Tổng kết
    print("\n" + "=" * 60)
    print("📊 TỔNG KẾT")
    print("=" * 60)
    print(f"✅ Thành công: {total_success} files")
    print(f"❌ Thất bại: {total_fail} files")
    print(f"📁 Thư mục đầu ra: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
