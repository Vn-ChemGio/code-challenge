# README.md

## Introduction

This project uses the **NestJS** framework instead of directly working with Express.js. NestJS provides better optimization for production-ready applications thanks to its official modules, powerful CLI tools, modular architecture, and built-in testing support.

Additionally, it comes pre-configured with TypeScript, helping reduce errors and inconsistencies that often occur with manual setup.

You can follow the instructions below to install, configure, and run the project.

---

## Configuration

Please refer to the configuration guide:
👉 [Configuration.md](./Configuration.md)

---

## Installation

Please follow the installation guide:
👉 [install.md](./install.md)

---

## Running the Project

* Use the following script if you are connecting to an existing database (**RECOMMENDED**):

```
npm run start:dev
```

* Use Docker if you want to start both the database and API together:

```
docker compose --env-file ./.env.dev -f docker-compose.dev.yml up
```

---

## Usage Guide

* Access the API documentation at:
  👉 http://localhost:3000/api-docs

* Login credentials:

```
Username: admin
Password: admin
```

* You can use the provided examples or customize the parameters based on your needs.

* Alternatively, you can use API testing tools such as **Postman** to test the available endpoints.

---

## TIP

* Run the following API to generate and seed test data into the database:

```
POST http://localhost:3000/test
```

* ⚠️ This should be executed **before any user is created** to ensure proper test data initialization.
