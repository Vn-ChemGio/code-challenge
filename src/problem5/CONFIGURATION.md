# Configuration.md

## Environment Setup

To configure the project, you need to create an environment file named:

```id="u2tte8"
.dev.env
```

Place this file in the root directory of the project (the same level as `package.json`).

---

## Required Environment Variables

Add the following configuration to your `.dev.env` file:

```env id="c0t77g"
PORT=3000

DATABASE_HOST=problem5_postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=problem5_db
DATABASE_SSL_MODE=false

INIT_MODE=true
```

---

## Environment Variables Explanation

| Variable            | Description                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `PORT`              | The port on which the application will run (default: 3000).                                                                   |
| `DATABASE_HOST`     | Database host address. When using Docker, this should match the service name defined in `docker-compose`.                     |
| `DATABASE_PORT`     | The port used by the database service (default: 5432 for PostgreSQL).                                                         |
| `DATABASE_USERNAME` | Username used to connect to the database.                                                                                     |
| `DATABASE_PASSWORD` | Password used to authenticate the database connection.                                                                        |
| `DATABASE_NAME`     | The name of the database to connect to.                                                                                       |
| `DATABASE_SSL_MODE` | Enable (`true`) if using a cloud/remote database with SSL (e.g., AWS RDS), otherwise set to `false`.                          |
| `INIT_MODE`         | Enable (`true`) to allow APIs to generate and seed test data into the database (useful for testing features like pagination). |

---

## Explanation

### Running without Docker (Recommended for faster development)

If you prefer not to use Docker, you can configure the `.dev.env` file and run the project directly. This approach helps save time and simplifies the development process, especially when you already have a database available.

---

### Running with Docker

If you are using Docker, you can keep the default configuration as below:

```env id="9r7f2a"
PORT=3000
DATABASE_HOST=problem5_postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=problem5_db
```

These values are aligned with the Docker setup defined in `docker-compose.dev.yml`, so no additional changes are required.

