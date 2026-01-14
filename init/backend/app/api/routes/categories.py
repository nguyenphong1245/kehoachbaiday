from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import traceback
import asyncio

from app.db.session import get_db
from app.models.category import Category
from app.schemas import CategoryCreate, CategoryRead
from app.api.deps import require_permission

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=list[CategoryRead], dependencies=[Depends(require_permission("categories.list"))])
async def list_categories(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Category))
    return result.scalars().all()


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(payload: CategoryCreate, session: AsyncSession = Depends(get_db)):
    import uuid
    max_retries = 3
    retry_delay = 0.5  # seconds
    
    for attempt in range(max_retries):
        try:
            logger.info(f"=== CREATE CATEGORY START (attempt {attempt + 1}) ===")
            logger.info(f"Payload: name={payload.name}, description={payload.description}")
            
            instance = Category(
                id=str(uuid.uuid4()),
                name=payload.name,
                description=payload.description
            )
            logger.info(f"Created instance with id={instance.id}")
            
            session.add(instance)
            logger.info("Added to session")
            
            await session.commit()
            logger.info("Committed successfully")
            
            await session.refresh(instance)
            logger.info(f"=== CREATE CATEGORY SUCCESS: {instance.name} ===")
            return instance
            
        except Exception as e:
            error_msg = str(e)
            if "database is locked" in error_msg and attempt < max_retries - 1:
                logger.warning(f"Database locked, retrying in {retry_delay}s... (attempt {attempt + 1})")
                await session.rollback()
                await asyncio.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
                continue
            else:
                logger.error(f"=== CREATE CATEGORY ERROR ===")
                logger.error(f"Error type: {type(e).__name__}")
                logger.error(f"Error message: {error_msg}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error: {error_msg}"
                )


@router.get("/{category_id}", response_model=CategoryRead, dependencies=[Depends(require_permission("categories.list"))])
async def get_category(category_id: str, session: AsyncSession = Depends(get_db)):
    instance = await session.get(Category, category_id)
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return instance


@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(category_id: str, payload: CategoryCreate, session: AsyncSession = Depends(get_db)):
    instance = await session.get(Category, category_id)
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    instance.name = payload.name
    instance.description = payload.description
    
    await session.commit()
    await session.refresh(instance)
    return instance


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission("categories.delete"))])
async def delete_category(category_id: str, session: AsyncSession = Depends(get_db)):
    instance = await session.get(Category, category_id)
    if not instance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    await session.delete(instance)
    await session.commit()
