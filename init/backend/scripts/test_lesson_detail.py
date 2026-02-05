import sys
sys.path.insert(0, 'D:\\KL\\WEB1\\init\\backend')

from app.services.lesson_plan_builder_service import get_lesson_plan_builder_service

service = get_lesson_plan_builder_service()

# Tim kiem bai hoc truoc
result = service.search_lessons('Kết nối tri thức với cuộc sống', '11', 'CHỦ ĐỀ 6 (CS). KĨ THUẬT LẬP TRÌNH')
print('=== BAI HOC TIM THAY ===')
for lesson in result.lessons[:3]:
    print(f'  ID: {lesson.id}')
    print(f'  Ten: {lesson.name}')
    print()

# Lay chi tiet bai hoc dau tien
if result.lessons:
    lesson_id = result.lessons[0].id
    print(f'=== LAY CHI TIET BAI HOC ID: {lesson_id} ===')
    detail = service.get_lesson_detail(lesson_id)
    if detail:
        print(f'  Ten: {detail.name}')
        print(f'  Grade: {detail.grade}')
        print(f'  Book type: {detail.book_type}')
        print(f'  Topic: {detail.topic}')
        print(f'  Orientation: {detail.orientation}')
        print(f'  Objectives: {detail.objectives}')
        print(f'  Competencies: {detail.competencies}')
        print(f'  Chi muc: {len(detail.chi_muc_list)} items')
        for cm in detail.chi_muc_list:
            print(f'    {cm.order}. {cm.content}')
    else:
        print('Khong lay duoc chi tiet!')
else:
    print('Khong tim thay bai hoc!')
