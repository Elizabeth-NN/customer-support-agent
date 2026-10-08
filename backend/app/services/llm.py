import httpx
from collections.abc import Iterator

from google import genai
from google.genai import types

from app.services.gemini_tools import (
    execute_gemini_tool,
    get_gemini_tools,
)

from app.core.config import get_settings


settings = get_settings()


def generate_embedding(text: str) -> list[float]:
    """Generate embeddings using the local Ollama embedding model."""

    response = httpx.post(
        f"{settings.llm_base_url}/api/embed",
        json={
            "model": settings.llm_embedding_model,
            "input": text,
        },
        timeout=settings.llm_timeout,
    )

    response.raise_for_status()

    return response.json()["embeddings"][0]


def generate_text(prompt: str) -> str:
    """Generate text using the configured chat provider."""

    if settings.llm_provider == "gemini":
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        client = genai.Client(api_key=settings.gemini_api_key)

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )

        if not response.text:
            raise ValueError("Gemini returned an empty response.")

        return response.text.strip()

    if settings.llm_provider == "ollama":
        response = httpx.post(
            f"{settings.llm_base_url}/api/generate",
            json={
                "model": settings.llm_chat_model,
                "prompt": prompt,
                "stream": False,
                "think": settings.llm_thinking,
            },
            timeout=settings.llm_timeout,
        )

        response.raise_for_status()

        return response.json()["response"].strip()

    raise ValueError(
        f"Unsupported LLM provider: {settings.llm_provider}. "
        "Supported providers: gemini, ollama"
    )
def generate_text_with_tools(
    prompt: str,
    business_id,
) -> str:
    """Generate a Gemini answer while allowing secure business tool calls."""

    if settings.llm_provider != "gemini":
        return generate_text(prompt)

    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    client = genai.Client(api_key=settings.gemini_api_key)

    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=get_gemini_tools(),
        ),
    )

    if not response.candidates:
        raise ValueError("Gemini returned no candidates.")

    candidate = response.candidates[0]

    if not candidate.content:
        raise ValueError("Gemini returned no content.")

    parts = candidate.content.parts or []

    tool_calls = [
        part.function_call
        for part in parts
        if part.function_call is not None
    ]

    if not tool_calls:
        if response.text:
            return response.text.strip()

        raise ValueError("Gemini returned an empty response.")

    tool_responses = []

    for function_call in tool_calls:
        if not function_call.name:
            continue

        arguments = dict(function_call.args or {})

        result = execute_gemini_tool(
            name=function_call.name,
            arguments=arguments,
            business_id=business_id,
        )

        tool_responses.append(
            types.Part.from_function_response(
                name=function_call.name,
                response=result,
            )
        )

    follow_up = client.models.generate_content(
        model=settings.gemini_model,
        contents=[
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
            candidate.content,
            types.Content(
                role="tool",
                parts=tool_responses,
            ),
        ],
        config=types.GenerateContentConfig(
            tools=get_gemini_tools(),
        ),
    )

    if not follow_up.text:
        raise ValueError("Gemini returned an empty tool response.")

    return follow_up.text.strip()

def generate_text_stream(prompt: str) -> Iterator[str]:
    """Stream generated text from the configured chat provider."""

    if settings.llm_provider == "gemini":
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        client = genai.Client(api_key=settings.gemini_api_key)

        response = client.models.generate_content_stream(
            model=settings.gemini_model,
            contents=prompt,
        )

        for chunk in response:
            if chunk.text:
                yield chunk.text

        return

    if settings.llm_provider == "ollama":
        response = httpx.post(
            f"{settings.llm_base_url}/api/generate",
            json={
                "model": settings.llm_chat_model,
                "prompt": prompt,
                "stream": True,
                "think": settings.llm_thinking,
            },
            timeout=settings.llm_timeout,
        )

        response.raise_for_status()

        for line in response.iter_lines():
            if not line:
                continue

            import json

            data = json.loads(line)

            chunk = data.get("response", "")

            if chunk:
                yield chunk

            if data.get("done"):
                break

        return

    raise ValueError(
        f"Unsupported LLM provider: {settings.llm_provider}. "
        "Supported providers: gemini, ollama"
    )