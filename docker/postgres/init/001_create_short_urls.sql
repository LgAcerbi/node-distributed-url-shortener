CREATE TABLE IF NOT EXISTS short_urls (
    id UUID PRIMARY KEY,
    code VARCHAR(7) NOT NULL UNIQUE,
    original_url VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_short_urls_code_active
    ON short_urls (code)
    WHERE deleted_at IS NULL;
