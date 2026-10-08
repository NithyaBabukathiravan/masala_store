"""Small in-memory rate limiter (NFR-4: order / contact forms spam aagama irukka)."""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

_hits: dict[tuple[str, str], deque] = defaultdict(deque)


def rate_limit(max_calls: int, per_seconds: int):
    def dependency(request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        key = (ip, request.url.path)
        now = time.time()
        q = _hits[key]
        while q and q[0] <= now - per_seconds:
            q.popleft()
        if len(q) >= max_calls:
            raise HTTPException(429, "Too many requests. Konjam neram kazhichu try pannunga.")
        q.append(now)

    return dependency
