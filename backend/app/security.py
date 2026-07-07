from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlparse

from fastapi import HTTPException

# RFC 6598 shared address space — not covered by is_private in all Python versions
_EXTRA_BLOCKED: list[ipaddress.IPv4Network | ipaddress.IPv6Network] = [
    ipaddress.ip_network("100.64.0.0/10"),
]


def _is_blocked_ip(addr: str) -> bool:
    try:
        ip = ipaddress.ip_address(addr)
    except ValueError:
        return True
    # An IPv4-mapped IPv6 address (::ffff:a.b.c.d) smuggles an IPv4 target inside an
    # IPv6 wrapper. The _EXTRA_BLOCKED membership test never matches it — an IPv6
    # address is never "in" the IPv4 100.64.0.0/10 network — so ::ffff:100.64.0.1
    # slips past the RFC 6598 block. Unwrap to the embedded IPv4 before every check.
    mapped = getattr(ip, "ipv4_mapped", None)
    if mapped is not None:
        ip = mapped
    if ip.is_loopback or ip.is_link_local or ip.is_private or ip.is_reserved or ip.is_multicast:
        return True
    return any(ip in net for net in _EXTRA_BLOCKED)


def assert_safe_url(url: str) -> None:
    """Raise HTTP 400 if *url* targets a private, loopback, or reserved address (SSRF guard)."""
    if not url:
        raise HTTPException(status_code=400, detail="Target URL must not be empty")

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only http and https target URLs are permitted")

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Target URL is missing a hostname")

    try:
        results = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise HTTPException(status_code=400, detail=f"Cannot resolve target hostname: {exc}") from exc

    for *_, sockaddr in results:
        if _is_blocked_ip(sockaddr[0]):
            raise HTTPException(
                status_code=400,
                detail="Target URL resolves to a private or reserved address",
            )
