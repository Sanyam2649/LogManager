import secrets

API_KEY_PREFIX = "bcube_live_"

def generate_api_key() -> str:
    return API_KEY_PREFIX + secrets.token_hex(32)
