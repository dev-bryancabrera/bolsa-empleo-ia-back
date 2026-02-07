# AGENTS.md - Agent Guidelines for BolsaEmpleoIA

## Development Commands

### Running the Application
```bash
npm start          # Production mode
npm run dev        # Development with nodemon
```

### Code Quality
```bash
npx eslint .                # Run ESLint on entire codebase
npx eslint src/             # Run ESLint on source code only
npx eslint --fix .           # Auto-fix linting issues
npx prettier --write .       # Format code with Prettier
```

### Testing
```bash
npm test             # Run all tests (when tests are added)
npm test -- --watch  # Run tests in watch mode
npm test path/to/test.test.js  # Run single test file
```

## Architecture Guidelines

### Clean Architecture Structure
This project follows Clean Architecture with these layers:
- **Domain**: Core business entities (`src/lib/{module}/domain/`)
- **Application**: Use cases and business logic (`src/lib/{module}/application/`)
- **Infrastructure**: External dependencies (`src/lib/{module}/infrastructure/`)

### Module Organization
Each module (Persona, CV, Administracion, Chatbot) follows the same structure:
```
src/lib/{module}/
├── domain/
│   ├── Entity.js
│   └── EntityRepository.js
├── application/
│   └── use-cases/
└── infrastructure/
    ├── http/
    │   ├── controllers/
    │   └── routes/
    ├── EntityRepositorySequelize.js
    └── index.js
```

## Code Style Guidelines

### General Rules
- Use **CommonJS** modules (`require`/`module.exports`)
- Follow **Spanish naming** for variables and comments when appropriate
- Use **snake_case** for database fields and **camelCase** for JavaScript variables
- Keep files focused on single responsibility

### Import Organization
```javascript
// External dependencies first
const { DataTypes } = require('sequelize');

// Internal infrastructure
const PersonaModel = require('../../../infrastructure/models/PersonaModel.js');

// Domain layer
const Persona = require('../domain/Persona.js');
const PersonaRepository = require('../domain/PersonaRepository.js');
```

### Class Structure
```javascript
class ClassName {
    constructor(dependencies) {
        this.dependency = dependencies.dependency;
    }

    // Use arrow functions for methods that need 'this' binding
    method = async (req, res, next) => {
        try {
            // Business logic
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Regular methods for internal logic
    async execute(dto) {
        // Implementation
        return result;
    }
}

module.exports = ClassName;
```

### Error Handling
- Always use try-catch in async methods
- Pass errors to Express error handlers using `next(error)`
- Return appropriate HTTP status codes (404 for not found, 400 for validation, 500 for server errors)

### Database Patterns
- Use **Sequelize models** in `src/infrastructure/models/`
- Implement repository pattern with `_toEntity()` methods
- Use `underscored: true` for database fields
- Set `timestamps: false` when using custom timestamp fields

### Controller Patterns
- Use dependency injection in constructors
- Implement CRUD methods: `crear`, `listar`, `obtener`, `actualizar`, `eliminar`
- Use arrow functions for HTTP method handlers to maintain `this` context
- Validate required parameters and return 404 when resources don't exist

### Use Case Patterns
- All use cases should have an `execute()` method
- Use DTOs (Data Transfer Objects) for input
- Transform data to domain entities before persistence
- Keep business logic separate from infrastructure concerns

### Security Considerations
- Use JWT middleware for protected routes
- Validate input data using express-validator when available
- Never expose sensitive information in error responses
- Use environment variables for configuration

## Development Workflow

1. **Creating a new module**: Follow the existing folder structure
2. **Adding a new use case**: Create in `application/use-cases/` directory
3. **Adding endpoints**: Create controller method and corresponding route
4. **Database changes**: Update or create Sequelize models
5. **Testing**: Add test files alongside implementation (tests directory not yet established)

## Code Quality Tools

- **ESLint**: Configured with Prettier integration
- **Prettier**: Code formatting with consistent style
- **Jest**: Testing framework (configured but no tests yet)

## Notes for AI Agents

- This is a **Node.js + Express** project with **MySQL + Sequelize**
- The codebase uses **Spanish terminology** (persona, crear, listar, etc.)
- Follow existing patterns when creating new features
- All database operations should go through repository classes
- Controllers should be thin, delegating to use cases
- Domain entities should remain framework-agnostic