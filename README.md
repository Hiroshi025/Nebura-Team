<!-- LOGO & TITLE -->
<p align="center">
  <img src="https://i.pinimg.com/1200x/58/08/35/5808355cb825f18671975d00cbe10870.jpg" width="120" alt="Nebura Control Logo" />
</p>

<h1 align="center">Nebura Control</h1>
<p align="center">
  <b>Version:</b> 1.0.0<br>
  <b>License:</b> MIT<br>
  <b>Author:</b> <a href="https://github.com/Hiroshi025" target="_blank">Hiroshi025</a>
</p>

---

## 🗂️ Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Security](#security)
- [Scalability](#scalability)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Monitoring & Health](#monitoring--health)
- [Testing](#testing)
- [Deployment](#deployment)
- [Support & Resources](#support--resources)
- [Contributing](#contributing)
- [License](#license)
- [Advanced Guides](#advanced-guides)

---

## 📝 Overview

**Nebura Control** is a modular, extensible, and robust API platform designed to integrate with services such as Discord, WhatsApp, GitHub, Google Gemini AI, and more. Built with TypeScript and NestJS, it focuses on scalability, maintainability, and security for modern multi-service applications.

---

## 🚀 Features

| Feature                | Description                               |
| ---------------------- | ----------------------------------------- |
| Modular Architecture   | Auth, Users, Admin, Health, and more      |
| PostgreSQL Integration | Advanced ORM with TypeORM                 |
| JWT Authentication     | Secure, role-based access control         |
| Rate Limiting          | Configurable request throttling           |
| Global Cache           | Performance optimization                  |
| DTO Validation         | Data validation and transformation        |
| API Versioning         | Backward compatibility                    |
| Swagger/OpenAPI        | Interactive API documentation             |
| Security               | Helmet, sanitization, secure headers      |
| Health Checks          | Health and monitoring endpoints           |
| Logging                | Structured and colorized logs             |
| Extensible Middleware  | Easy integration of custom middlewares    |
| Cloud-Ready            | Docker, Kubernetes, serverless compatible |
| Monitoring             | Metrics and health endpoints              |
| Audit Logging          | Audit of key actions                      |

---

## 🏗️ Architecture

```
src/
├── adapters/           # Database adapters and external services
├── entity/             # ORM entities
├── interfaces/
│   └── http/
│       ├── controllers/
│       └── routes/
├── shared/             # Shared utilities
├── app.module.ts       # Root module
├── main.ts             # Entry point
└── core/               # Core modules (JWT, Discord, etc.)
```

---

## 🛡️ Security

- **JWT:** All protected endpoints require a valid JWT.
- **Roles:** Granular access by roles (admin, developer, user, etc).
- **Helmet:** Secure HTTP headers.
- **Validation:** DTOs and whitelisting.
- **Rate Limiting:** Prevents brute-force attacks.
- **Environment variables:** Secrets are never exposed in code.
- **Audit Logging:** Critical actions are audited.

**References:**

- [NestJS Security Docs](https://docs.nestjs.com/security)
- [Helmet.js](https://helmetjs.github.io/)

---

## 📈 Scalability

- **Stateless API:** JWT enables horizontal scaling.
- **Global Cache:** Reduces database load.
- **Pooling:** Efficient resource usage.
- **Cloud-Ready:** Docker/Kubernetes/serverless.
- **Observability:** Health endpoints and logs.

---

## ⚙️ Requirements

| Component  | Minimum Version |
| ---------- | --------------- |
| Node.js    | 18.x            |
| npm        | 9.x             |
| PostgreSQL | 13.x            |
| Docker     | Optional        |

---

## 🛠️ Installation

```bash
git clone https://github.com/Hiroshi025/Nebura-AI.git
cd Nebura-AI
npm install
```

---

## 🧩 Configuration

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=nebura
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

**See:** [NestJS Environment Variables](https://docs.nestjs.com/techniques/configuration)

---

## ▶️ Usage

### Start the application

```bash
npm run start
```

### Development mode (with hot reload)

```bash
npm run start:dev
```

### Example: Making an authenticated request

```bash
curl -H "Authorization: Bearer <your_jwt_token>" http://localhost:3000/v1/users/me
```

---

## 📚 API Documentation

- **Swagger UI:** [http://localhost:3000/v1/docs](http://localhost:3000/v1/docs)
- **OpenAPI JSON:** [http://localhost:3000/v1/docs/download](http://localhost:3000/v1/docs/download)

**Features:**

- JWT Bearer authentication support
- Interactive endpoint testing
- Download OpenAPI specification

**Tutorial:**  
See [NestJS Swagger Docs](https://docs.nestjs.com/openapi/introduction) for customizing API docs.

---

## 📊 Monitoring & Health

Nebura exposes health and metrics endpoints for monitoring:

| Endpoint            | Description                  |
| ------------------- | ---------------------------- |
| `/v1/health`        | General health check         |
| `/v1/health/db`     | Database connectivity status |
| `/v1/health/memory` | Memory usage and limits      |
| `/v1/health/disk`   | Disk space and usage         |

**Sample health response:**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory": { "status": "up", "used": "120MB" }
  }
}
```

**References:**

- [NestJS Terminus (Health Checks)](https://docs.nestjs.com/recipes/terminus)

---

## 🧪 Testing

Nebura includes comprehensive unit and e2e test support:

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

**Tutorial:**  
See [NestJS Testing Docs](https://docs.nestjs.com/fundamentals/testing) for advanced testing strategies.

---

## 🚀 Deployment

Nebura Control is cloud-ready and can be deployed on any modern platform.

### Docker

```bash
docker build -t nebura-control .
docker run -p 3000:3000 --env-file .env nebura-control
```

### Kubernetes

See [NestJS Kubernetes Guide](https://docs.nestjs.com/recipes/kubernetes).

### Serverless

See [NestJS Serverless Docs](https://docs.nestjs.com/recipes/serverless).

---

## 🆘 Support & Resources

- **Help Center:** [https://help.hiroshi-dev.me/](https://help.hiroshi-dev.me/)
- **GitHub:** [https://github.com/Hiroshi025/Nebura-AI](https://github.com/Hiroshi025/Nebura-AI)
- **Report bugs:** [GitHub Issues](https://github.com/Hiroshi025/Nebura-AI/issues)
- **Documentation:** [Swagger UI](http://localhost:3000/v1/docs)
- **NestJS Docs:** [https://docs.nestjs.com](https://docs.nestjs.com)
- **Discord.js Docs:** [https://discord.js.org/#/docs](https://discord.js.org/#/docs)
- **WhatsApp Web.js Docs:** [https://wwebjs.dev/guide/](https://wwebjs.dev/guide/)
- **Prisma Docs:** [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
- **Express Docs:** [https://expressjs.com/](https://expressjs.com/)

---

## 🤝 Contributing

Contributions are welcome! Open issues or pull requests on [GitHub](https://github.com/Hiroshi025/Nebura-AI).

**Guidelines:**

- Fork the repository
- Create a feature branch
- Commit your changes
- Open a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🧭 Advanced Guides

<details>
  <summary><b>Module Navigation</b></summary>

- [Auth Module](src/interfaces/http/routes/auth)
- [Users Module](src/interfaces/http/routes/users)
- [Admin Module](src/interfaces/http/routes/admin)
- [Health Module](src/interfaces/http/routes/health)
- [Shared Utilities](src/shared)
- [Entities](src/entity)
</details>

<details>
  <summary><b>System States</b></summary>

| State            | Description                          |
| ---------------- | ------------------------------------ |
| Booting          | Application is starting              |
| Initializing     | Modules and dependencies are loading |
| Ready            | API is ready to accept requests      |
| HandlingRequests | Processing incoming HTTP requests    |
| HealthCheck      | Performing health and status checks  |
| Authenticated    | User is authenticated via JWT        |
| Authorized       | User has required role/permissions   |
| ServingData      | Data is being served to the client   |

</details>

<details>
  <summary><b>API Endpoints Overview</b></summary>

| Method | Endpoint                | Description            | Auth Required |
| ------ | ----------------------- | ---------------------- | ------------- |
| POST   | `/v1/auth/login`        | User login             | No            |
| GET    | `/v1/auth/me`           | Get current user       | Yes           |
| GET    | `/v1/users/:id`         | Get user by ID         | Yes           |
| GET    | `/v1/health`            | Health check           | No            |
| GET    | `/v1/admin/users`       | List all users (admin) | Yes (Admin)   |
| POST   | `/v1/admin/cache/clear` | Clear cache (admin)    | Yes (Admin)   |

</details>

<details>
  <summary><b>Tutorials & Examples</b></summary>

- [NestJS Official Tutorial](https://docs.nestjs.com/first-steps)
- [How to Secure APIs with JWT](https://docs.nestjs.com/security/authentication)
- [Integrating Discord.js with NestJS](https://necord.dev/)
- [Testing Strategies in NestJS](https://docs.nestjs.com/fundamentals/testing)
- [Deploying with Docker](https://docs.nestjs.com/recipes/docker)
- [API Versioning in NestJS](https://docs.nestjs.com/techniques/versioning)
- [Advanced Caching Techniques](https://docs.nestjs.com/techniques/caching)
- [Health Checks with Terminus](https://docs.nestjs.com/recipes/terminus)
- [File Uploads with Multer](https://docs.nestjs.com/techniques/file-upload)
- [Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

</details>

---

<p align="center">
  <b>Developed with ❤️ by Hiroshi025</b>
</p>
