import pytest
from backend.security import is_ip_restricted, validate_and_resolve_url, sanitize_html_content


def test_ip_restricted_checks():
    # Loopback
    assert is_ip_restricted("127.0.0.1") is True
    assert is_ip_restricted("127.0.1.1") is True
    # Private subnets
    assert is_ip_restricted("10.0.0.1") is True
    assert is_ip_restricted("172.16.0.1") is True
    assert is_ip_restricted("192.168.1.1") is True
    # Cloud metadata / link-local
    assert is_ip_restricted("169.254.169.254") is True
    # Unspecified / Current
    assert is_ip_restricted("0.0.0.0") is True
    # IPv6 Loopback
    assert is_ip_restricted("::1") is True

    # Valid Public IPs (e.g. Cloudflare DNS, Google DNS)
    assert is_ip_restricted("1.1.1.1") is False
    assert is_ip_restricted("8.8.8.8") is False


def test_ssrf_url_validation_blocks_private():
    with pytest.raises(ValueError, match="Only http and https are allowed"):
        validate_and_resolve_url("ftp://example.com/file")

    with pytest.raises(ValueError, match="Only http and https are allowed"):
        validate_and_resolve_url("file:///etc/passwd")

    with pytest.raises(ValueError, match="forbidden"):
        validate_and_resolve_url("http://localhost:8080/admin")

    with pytest.raises(ValueError, match="forbidden"):
        validate_and_resolve_url("http://127.0.0.1/status")

    with pytest.raises(ValueError, match="forbidden"):
        validate_and_resolve_url("http://0.0.0.0:3000")


def test_ssrf_url_validation_allows_public():
    normalized, resolved_ip = validate_and_resolve_url("https://example.com")
    assert normalized.startswith("https://example.com")
    assert not is_ip_restricted(resolved_ip)


def test_html_sanitization():
    raw_html = """
    <html>
        <head><title>Test Page</title><script>alert('xss');</script></head>
        <body>
            <h1>Engineering Hiring Update</h1>
            <p>We are actively hiring 10 senior backend engineers in Boston.</p>
            <style>body { color: red; }</style>
        </body>
    </html>
    """
    cleaned = sanitize_html_content(raw_html)
    assert "Engineering Hiring Update" in cleaned
    assert "We are actively hiring 10 senior backend engineers" in cleaned
    assert "alert" not in cleaned
    assert "<script>" not in cleaned
    assert "color: red" not in cleaned
