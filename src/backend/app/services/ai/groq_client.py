import json
import logging

from groq import AsyncGroq

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: AsyncGroq | None = None

MODEL_PRIMARY = "llama-3.3-70b-versatile"
MODEL_FALLBACK = "llama-3.1-8b-instant"


def get_client() -> AsyncGroq:
    global _client
    if _client is None:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY не задан в .env")
        _client = AsyncGroq(api_key=settings.groq_api_key)
    return _client


async def generate(
    prompt: str,
    system_instruction: str = "",
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> str:
    client = get_client()

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    last_error = None
    for model in [MODEL_PRIMARY, MODEL_FALLBACK]:
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            last_error = e
            logger.warning(f"Модель {model} недоступна: {e}")
            continue

    logger.error(f"Все модели недоступны: {last_error}")
    raise RuntimeError(f"Groq API недоступен: {last_error}")


async def generate_json(
    prompt: str,
    system_instruction: str = "",
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> str:
    client = get_client()

    json_instruction = "Отвечай ТОЛЬКО валидным JSON. Без markdown, без пояснений, без ```."
    system = f"{system_instruction}\n\n{json_instruction}" if system_instruction else json_instruction

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": prompt},
    ]

    last_error = None
    for model in [MODEL_PRIMARY, MODEL_FALLBACK]:
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
            text = response.choices[0].message.content or ""
            json.loads(text)
            return text
        except json.JSONDecodeError:
            return text
        except Exception as e:
            last_error = e
            logger.warning(f"Модель {model} (JSON) недоступна: {e}")
            continue

    logger.error(f"Все модели недоступны (JSON): {last_error}")
    raise RuntimeError(f"Groq API недоступен: {last_error}")
