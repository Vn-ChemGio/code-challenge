# Install.md

## Installation Guide

After completing the configuration step, follow the instructions below to install and run the project.

---

## (Recommended) Without Docker:

Use the following steps if you have an existing database:

* Ensure your database is already running and accessible with the configured credentials.
* Install dependencies:

```bash id="dep001"
npm install
```

* Start the project:

```bash id="run001"
npm run start:dev
```

* The application should start within a few seconds.
* You can monitor the application status directly in the CLI logs.

---

## With Docker

* Make sure Docker is installed and running on your machine.
* Then run the following command to start both the database and API:

```bash id="docker001"
docker compose --env-file ./.env.dev -f docker-compose.dev.yml up
```
