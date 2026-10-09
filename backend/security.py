import ipaddress
import socket
import urllib.parse
from typing import Tuple, Optional
import httpx
from bs4 import BeautifulSoup
from backend.config import settings


# Forbidden / restricted IP networks (SSRF prevention)
RESTRICTED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # Private Class A
    ipaddress.ip_network("172.16.0.0/12"),    # Private Class B
    ipaddress.ip_network("192.168.0.0/16"),   # Private Class C
    ipaddress.ip_network("169.254.0.0/16"),   # Link-local / Cloud Metadata (169.254.169.254)
    ipaddress.ip_network("0.0.0.0/8"),        # Current network
    ipaddress.ip_network("100.64.0.0/10"),    # Carrier-grade NAT
    ipaddress.ip_network("192.0.0.0/24"),     # IETF Protocol
    ipaddress.ip_network("198.18.0.0/15"),    # Benchmark testing
    ipaddress.ip_network("224.0.0.0/4"),      # Multicast
    ipaddress.ip_network("240.0.0.0/4"),      # Reserved
    ipaddress.ip_network("::1/128"),          # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),         # IPv6 Unique local
    ipaddress.ip_network("fe80::/10"),        # IPv6 Link-local
]


def is_ip_restricted(ip_str: str) -> bool:
    """Check if an IP address is private, loopback, link-local, or otherwise restricted."""
    try:
        ip = ipaddress.ip_address(ip_str)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
            return True
        for net in RESTRICTED_NETWORKS:
            if ip in net:
                return True
        return False
    except ValueError:
        return True


def validate_and_resolve_url(url: str) -> Tuple[str, str]:
    """
    Validates a URL and ensures its hostname does not resolve to private or loopback IP addresses.
    Returns (normalized_url, resolved_ip).
    Raises ValueError on SSRF attempts or invalid URLs.
    """
    if not url:
        raise ValueError("URL cannot be empty")

    parsed = urllib.parse.urlparse(url.strip())
    if parsed.scheme.lower() not in ("http", "https"):
        raise ValueError(f"Invalid URL scheme '{parsed.scheme}'. Only http and https are allowed.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("URL missing valid hostname")

    # Block obvious local names
    lower_host = hostname.lower()
    if lower_host in ("localhost", "local", "internal", "intranet", "0.0.0.0", "127.0.0.1", "::1"):
        raise ValueError(f"Access to local hostname '{hostname}' is forbidden")

    if lower_host.endswith(".local") or lower_host.endswith(".internal"):
        raise ValueError(f"Access to internal domain '{hostname}' is forbidden")

    # Resolve hostname via DNS
    try:
        addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
    except socket.gaierror as e:
        raise ValueError(f"Could not resolve domain '{hostname}': {str(e)}")

    if not addr_info:
        raise ValueError(f"DNS resolution for '{hostname}' returned no IP addresses")

    first_ip = ""
    for addr in addr_info:
        ip_str = addr[4][0]
        if is_ip_restricted(ip_str):
            raise ValueError(f"SSRF violation: Hostname '{hostname}' resolves to restricted IP '{ip_str}'")
        if not first_ip:
            first_ip = ip_str

    normalized = urllib.parse.urlunparse(parsed)
    return normalized, first_ip


class SafeHTTPClient:
    """
    A secure HTTP client with:
    - SSRF prevention (IP validation on every request and manual redirect validation)
    - Request timeout bounds
    - Maximum content size limits (2MB default)
    - Anti-loopback protection
    """

    def __init__(self, timeout: float = None, max_size: int = None):
        self.timeout = timeout or settings.REQUEST_TIMEOUT_SECONDS
        self.max_size = max_size or settings.MAX_RESPONSE_SIZE_BYTES

    async def get(self, url: str, max_redirects: int = 3) -> Tuple[int, str, str]:
        """
        Safely fetches content from a URL.
        Returns (status_code, content_text, final_url).
        """
        current_url = url
        redirects_followed = 0

        async with httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=False,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DealSignal-AI-Researcher/1.0"}
        ) as client:
            while redirects_followed <= max_redirects:
                normalized_url, _ = validate_and_resolve_url(current_url)

                try:
                    # Stream request to enforce size bounds
                    async with client.stream("GET", normalized_url) as response:
                        if response.status_code in (301, 302, 303, 307, 308):
                            location = response.headers.get("location")
                            if not location:
                                return response.status_code, "", str(response.url)

                            # Handle relative redirects
                            current_url = urllib.parse.urljoin(normalized_url, location)
                            redirects_followed += 1
                            continue

                        # Read bounded payload
                        chunks = []
                        total_bytes = 0
                        async for chunk in response.aiter_bytes():
                            total_bytes += len(chunk)
                            if total_bytes > self.max_size:
                                raise ValueError(f"Response size exceeded limit of {self.max_size} bytes")
                            chunks.append(chunk)

                        content_bytes = b"".join(chunks)
                        content_type = response.headers.get("content-type", "")
                        charset = "utf-8"
                        if "charset=" in content_type:
                            charset = content_type.split("charset=")[-1].split(";")[0].strip()

                        try:
                            text = content_bytes.decode(charset, errors="replace")
                        except Exception:
                            text = content_bytes.decode("utf-8", errors="replace")

                        return response.status_code, text, str(response.url)

                except httpx.TimeoutException:
                    raise TimeoutError(f"Request to '{normalized_url}' timed out after {self.timeout}s")
                except httpx.RequestError as e:
                    raise IOError(f"Network error accessing '{normalized_url}': {str(e)}")

            raise ValueError(f"Exceeded maximum redirect limit of {max_redirects}")


def sanitize_html_content(raw_html: str, max_chars: int = 25000) -> str:
    """
    Extracts text from HTML while removing script, style, and malicious tags.
    Truncates to max_chars to keep LLM context bounded.
    """
    if not raw_html:
        return ""

    try:
        soup = BeautifulSoup(raw_html, "html.parser")
        for tag in soup(["script", "style", "noscript", "iframe", "object", "embed", "svg"]):
            tag.decompose()

        text = soup.get_text(separator="\n")
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = "\n".join(chunk for chunk in chunks if chunk)
        return clean_text[:max_chars]
    except Exception:
        return raw_html[:max_chars]
