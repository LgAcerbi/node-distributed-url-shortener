# errors

Shared application errors for `url-shortener-service`.

## Installation

This package is already part of the workspace. Import it directly:

```ts
import { AppError, ErrorType, NotFoundError, ValidationError } from '@workspace/errors';
```

## Available Exports

- `AppError`: Base typed error with `message` and `type`.
- `ErrorType`: Error type constants (`NOT_FOUND`, `VALIDATION`, etc.).
- `NotFoundError`: Convenience error with `ErrorType.NOT_FOUND`.
- `ValidationError`: Convenience error with `ErrorType.VALIDATION`.

## Usage

### Throw domain/application errors

```ts
import { NotFoundError, ValidationError } from '@workspace/errors';

if (!url.startsWith('https')) {
    throw new ValidationError('URL must start with https');
}

if (!shortUrl) {
    throw new NotFoundError('Short URL not found');
}
```

### Use the base class when needed

```ts
import { AppError, ErrorType } from '@workspace/errors';

throw new AppError('Short URL already exists', ErrorType.CONFLICT);
```

## HTTP Mapping Pattern

At the adapter/controller layer, map `error.type` to status codes (for example, `NOT_FOUND -> 404`, `VALIDATION -> 400`) so domain/application code stays transport-agnostic.
