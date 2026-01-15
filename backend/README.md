## Bcube Logger Backend

This service provides a simple HTTP API for ingesting, storing, and querying
application logs for multiple projects.

It uses **FastAPI**, **SQLAlchemy**, and **PostgreSQL**.


### 1. Configuration

- **Environment file (`.env`)**

  Create a `.env` file in the project root (next to `alembic.ini`) with at least:

  ```env
  APP_ENV=local
  DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/bcube_logger
  ```

  These are read by `app/config.py`.


### 2. Database setup

Currently the Alembic migrations are empty; you should create the tables using
your own migration scripts or via SQL based on the SQLAlchemy models in:

- `app/models/project.py`
- `app/models/log_category.py`
- `app/models/log_entry.py`

Once your schema is in place, you can run Alembic normally:

```bash
alembic upgrade head
```


### 3. Running the API

Install dependencies (preferably in a virtualenv):

```bash
pip install -r requirements.txt
```

Start the server (from the project root):

```bash
uvicorn app.main:app --reload
```

or:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```


### 4. Authentication & Projects

Every request to the logs API must include a **Bearer API key** that identifies
the project.

- Generate an API key using `app/core/api_key.py` (for example in a Python shell):

  ```python
  from app.core.api_key import generate_api_key
  print(generate_api_key())
  ```

- Insert a row into the `projects` table with that key (via SQL or your own admin
  tools). Example SQL:

  ```sql
  INSERT INTO projects (name, api_key) VALUES ('My Project', 'bcube_live_xxx...');
  ```

- Use that key in the `Authorization` header:

  ```http
  Authorization: Bearer bcube_live_xxx...
  ```

The dependency `get_current_project` in `app/core/auth.py` will validate this.


### 5. Logs API

- **Ingest logs**

  - **Method**: `POST /api/v1/logs`
  - **Headers**:
    - `Authorization: Bearer <project_api_key>`
    - `Content-Type: application/json`
  - **Body** (matches `LogIngestRequest` in `app/schemas/ingest.py`):

  ```json
  {
    "service": "auth-service",
    "environment": "production",
    "logs": [
      {
        "timestamp": "2026-01-14T12:34:56Z",
        "level": "ERROR",
        "message": "Invalid token",
        "meta": { "user_id": 123 }
      }
    ]
  }
  ```

  - **Response**:

  ```json
  {
    "message": "Logs ingested",
    "inserted": 1
  }
  ```

- **Query logs**

  - **Method**: `GET /api/v1/logs`
  - **Query params** (all optional):
    - `level`
    - `category`
    - `service`
    - `from` / `to` (ISO datetimes)
    - `search` (search in message and meta)
    - `limit` (default 50, max 200)
    - `offset` (default 0)

- **Get single log**

  - **Method**: `GET /api/v1/logs/{log_id}`

- **Delete log**

  - **Method**: `DELETE /api/v1/logs/{log_id}`

- **List categories**

  - **Method**: `GET /api/v1/logs/categories`

  Returns the categories for the current project, including system categories
  (`GENERAL`, `ERROR`, `AUTH`, `DB`, `API`). These are auto-created when you
  first ingest logs for a project.


### 6. Python client utility (for other projects)

This repository includes a small Python client in `app/utils_log_client.py` that
you can reuse from other codebases.

- **Install dependency** (in the other project, or share the same virtualenv):

  ```bash
  pip install requests
  ```

- **Quick usage example** (in another Python service):

  ```python
  from datetime import datetime
  from app.utils_log_client import LogClient

  client = LogClient(
      base_url="http://localhost:8000",
      api_key="bcube_live_xxx...",
      service="auth-service",
      environment="development",
  )

  client.send_log(
      level="ERROR",
      message="Login failed",
      meta={"user_id": 123},
      timestamp=datetime.utcnow(),
  )
  ```

You can also use the top-level helpers `send_log` and `send_logs` from the same
module if you prefer not to manage a long-lived client instance.


### 7. cURL examples

- **Send a log with cURL**:

  ```bash
  curl -X POST "http://localhost:8000/api/v1/logs" \
    -H "Authorization: Bearer bcube_live_xxx..." \
    -H "Content-Type: application/json" \
    -d '{
      "service": "auth-service",
      "environment": "development",
      "logs": [
        {
          "level": "INFO",
          "message": "User logged in",
          "meta": { "user_id": 123 }
        }
      ]
    }'
  ```

- **Query logs**:

  ```bash
  curl "http://localhost:8000/api/v1/logs?service=auth-service&level=ERROR" \
    -H "Authorization: Bearer bcube_live_xxx..."
  ```


### 8. Summary of commands

- **Install deps**: `pip install -r requirements.txt`
- **Run DB migrations** (after adding real migrations): `alembic upgrade head`
- **Run server**: `uvicorn app.main:app --reload`
- **Health check**: `curl http://localhost:8000/health`
