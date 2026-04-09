from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.core.config import settings, UPLOAD_DIR
from app.models.schemas import UploadResumeResponse
from app.services.resume_parser import parse_resume
from app.services.session_manager import sessions

router = APIRouter(prefix="/api", tags=["upload"])

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_SIZE = settings.max_file_size_mb * 1024 * 1024


@router.post("/upload", response_model=UploadResumeResponse)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(400, "Имя файла отсутствует")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Допустимые форматы: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, f"Файл слишком большой (макс. {settings.max_file_size_mb} МБ)")

    filepath = UPLOAD_DIR / file.filename
    filepath.write_bytes(content)

    try:
        resume_data = parse_resume(filepath)
    except ValueError as e:
        filepath.unlink(missing_ok=True)
        raise HTTPException(422, str(e))
    except Exception:
        filepath.unlink(missing_ok=True)
        raise HTTPException(500, "Ошибка при обработке файла")
    finally:
        filepath.unlink(missing_ok=True)

    session = sessions.create_session(resume_data, file.filename)

    return UploadResumeResponse(
        session_id=session.session_id,
        resume=resume_data,
        filename=file.filename,
    )
