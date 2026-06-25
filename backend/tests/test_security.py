import pytest
from fastapi import HTTPException

from app.security import _is_blocked_ip, assert_safe_url


@pytest.mark.parametrize(
    "addr",
    [
        "127.0.0.1",
        "10.0.0.5",
        "192.168.1.1",
        "172.16.0.1",
        "169.254.169.254",
        "100.64.0.1",
        "::1",
        "fe80::1",
        "224.0.0.1",
        "not-an-ip",
    ],
)
def test_blocked_ips(addr):
    assert _is_blocked_ip(addr) is True


@pytest.mark.parametrize("addr", ["8.8.8.8", "1.1.1.1", "93.184.216.34", "2606:2800:220:1:248:1893:25c8:1946"])
def test_allowed_ips(addr):
    assert _is_blocked_ip(addr) is False


def test_empty_url_rejected():
    with pytest.raises(HTTPException) as exc:
        assert_safe_url("")
    assert exc.value.status_code == 400


@pytest.mark.parametrize("url", ["ftp://example.com", "file:///etc/passwd", "gopher://example.com"])
def test_non_http_scheme_rejected(url):
    with pytest.raises(HTTPException) as exc:
        assert_safe_url(url)
    assert exc.value.status_code == 400


def test_missing_hostname_rejected():
    with pytest.raises(HTTPException):
        assert_safe_url("http://")


def test_unresolvable_host_rejected(monkeypatch):
    import socket

    def boom(*args, **kwargs):
        raise socket.gaierror("nope")

    monkeypatch.setattr(socket, "getaddrinfo", boom)
    with pytest.raises(HTTPException) as exc:
        assert_safe_url("http://does-not-exist.invalid")
    assert exc.value.status_code == 400


def test_public_host_allowed(monkeypatch):
    import socket

    monkeypatch.setattr(
        socket, "getaddrinfo", lambda *a, **k: [(2, 1, 6, "", ("93.184.216.34", 0))]
    )
    assert_safe_url("https://example.com")


def test_host_resolving_to_private_rejected(monkeypatch):
    import socket

    monkeypatch.setattr(
        socket, "getaddrinfo", lambda *a, **k: [(2, 1, 6, "", ("127.0.0.1", 0))]
    )
    with pytest.raises(HTTPException) as exc:
        assert_safe_url("http://sneaky.example.com")
    assert exc.value.status_code == 400


def test_dns_rebinding_any_private_result_rejected(monkeypatch):
    import socket

    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        lambda *a, **k: [
            (2, 1, 6, "", ("93.184.216.34", 0)),
            (2, 1, 6, "", ("10.0.0.1", 0)),
        ],
    )
    with pytest.raises(HTTPException):
        assert_safe_url("http://rebind.example.com")
