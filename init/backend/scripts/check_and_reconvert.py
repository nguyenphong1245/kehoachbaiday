"""
Script kiểm tra và chuyển đổi lại các file PDF bị thiếu.
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


def find_missing_files():
    """Tìm các file PDF chưa được chuyển đổi sang Markdown."""
    folders = ["10_CD", "10_KNTT", "11_CD", "11_KNTT", "12_CD", "12_KNTT"]
    missing_files = []
    
    for folder in folders:
        source_folder = SGK_DIR / folder
        target_folder = OUTPUT_DIR / folder
        
        if not source_folder.exists():
            continue
        
        # Lấy danh sách file PDF
        pdf_files = list(source_folder.glob("*.pdf"))
        
        for pdf_file in pdf_files:
            md_filename = pdf_file.stem + ".md"
            output_path = target_folder / md_filename
            
            # Kiểm tra file markdown có tồn tại và có nội dung không
            if not output_path.exists():
                missing_files.append((pdf_file, output_path))
            elif output_path.stat().st_size == 0:
                # File tồn tại nhưng rỗng
                missing_files.append((pdf_file, output_path))
    
    return missing_files


async def convert_pdf_to_markdown(pdf_path: Path, output_path: Path, parser: LlamaParse) -> bool:
    """Chuyển đổi một file PDF sang Markdown."""
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


async def main():
    """Hàm chính."""
    print("=" * 60)
    print("🔍 KIỂM TRA CÁC FILE BỊ THIẾU")
    print("=" * 60)
    
    missing_files = find_missing_files()
    
    if not missing_files:
        print("✅ Tất cả các file đã được chuyển đổi thành công!")
        return
    
    print(f"\n❌ Tìm thấy {len(missing_files)} file bị thiếu hoặc rỗng:")
    for pdf_file, md_file in missing_files:
        print(f"   - {pdf_file.parent.name}/{pdf_file.name}")
    
    print("\n" + "=" * 60)
    print("🔄 CHUYỂN ĐỔI LẠI CÁC FILE BỊ THIẾU")
    print("=" * 60)
    
    # Khởi tạo LlamaParse
    parser = LlamaParse(
        api_key=LLAMA_CLOUD_API_KEY,
        result_type="markdown",
        language="vi",
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
    
    success_count = 0
    fail_count = 0
    
    for pdf_file, output_path in missing_files:
        if await convert_pdf_to_markdown(pdf_file, output_path, parser):
            success_count += 1
        else:
            fail_count += 1
        await asyncio.sleep(0.5)
    
    print("\n" + "=" * 60)
    print("📊 TỔNG KẾT")
    print("=" * 60)
    print(f"✅ Thành công: {success_count} files")
    print(f"❌ Thất bại: {fail_count} files")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
