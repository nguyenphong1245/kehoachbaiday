from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.db.session import get_db
from app.models.document import Document
from app.schemas import DocumentCreate, DocumentRead
from app.api.deps import require_permission


router = APIRouter()


@router.get("", response_model=list[DocumentRead])
async def list_documents(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Document))
    return result.scalars().all()


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def create_document(payload: DocumentCreate, session: AsyncSession = Depends(get_db)):
    # Ensure document id
    doc_id = payload.id or str(uuid.uuid4())
    
    instance = Document(
        id=doc_id,
        title=payload.title,
        content=payload.content,
        category_id=payload.category_id,
        embedding=None  # Không dùng embedding nữa
    )
    session.add(instance)
    await session.commit()
    await session.refresh(instance)
    return instance


@router.get("/{document_id}", response_model=DocumentRead)
async def get_document(document_id: str, session: AsyncSession = Depends(get_db)):
    instance = await session.get(Document, document_id)
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return instance


@router.put("/{document_id}", response_model=DocumentRead)
async def update_document(document_id: str, payload: DocumentCreate, session: AsyncSession = Depends(get_db)):
    instance = await session.get(Document, document_id)
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(instance, field, value)
    
    # Không cần tạo embedding nữa
    instance.embedding = None
    
    await session.commit()
    await session.refresh(instance)
    return instance


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, session: AsyncSession = Depends(get_db)):
    instance = await session.get(Document, document_id)
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    await session.delete(instance)
    await session.commit()
