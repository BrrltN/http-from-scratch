
# HTTP from Scratch

## Project Overview
This project is an HTTP server built from scratch as part of a technical exercise. The objective was to demonstrate a deep understanding of the HTTP protocol, while applying solid software design patterns and exploring modern tools like Bun and Japa.

**Note:** This project is not intended for production use or as a fully-fledged web framework but rather serves as a demonstration of my development capabilities.

## Motivation
- To explore and better understand how the HTTP protocol functions.
- Follow the guided exercise from Code Crafter, which breaks down the implementation step-by-step.
- Focus on key learning points rather than building a comprehensive HTTP server or re-creating existing frameworks like Express.

## Features
- Handles both GET and POST requests.
- Routing with support for dynamic parameters.
- Gzip compression for response payloads.
- Parses headers including: `Content-Length`, `Content-Type`, `User-Agent`, `Host`, `Accept`, and `Accept-Encoding`.
- Responds in `text/plain` and `application/octet-stream` content types.

## Design Highlights
- **Singleton Router**: Ensures a single instance of the router is used throughout the application.
- **Builder Pattern for Responses**: Facilitates clean and standardized response creation.
- **Modular Design**: Clear separation between the domain logic, request parsing, response handling, and error management.
- **TypeScript**: Strongly typed codebase to catch errors early and ensure maintainability.
- **Tests**: Comprehensive test coverage using the Japa test runner, focusing on both the domain logic and routing mechanism.

## Installation and Usage
### Prerequisites
- Bun (https://bun.sh)

### Steps to Run
1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the server:
   ```bash
   bun run serve
   ```
3. Run tests:
   ```bash
   bun run test
   ```

## Project Structure
```bash
app
├── domain
│   ├── domain.spec.ts      # Business logic unit tests
│   ├── domain.ts           # Handlers for different HTTP routes
│   └── routes.ts           # Route definitions
├── framework
│   ├── app.ts              # Orchestrates request lifecycle
│   ├── error.ts            # Error management
│   ├── request
│   │   ├── body.ts         # Request body parsing
│   │   ├── header.ts       # Request header parsing
│   │   ├── request.ts      # Request object creation
│   │   └── startline.ts    # Request start line parsing
│   ├── response
│   │   ├── builder.ts      # Builder for constructing responses
│   │   └── standard.ts     # Standard response types
│   ├── router
│   │   ├── router.spec.ts  # Router unit tests
│   │   └── router.ts       # Router logic with singleton pattern
│   └── type.ts             # Shared types
├── main.ts                 # Application entry point
└── server.ts               # Server setup and initialization
config
└── test.ts                 # Test configuration
package.json
bun.lockb
tsconfig.json
README.md
```

## Testing
- Tests are located in `app/domain/domain.spec.ts` and `app/framework/router/router.spec.ts`.
- **Domain Tests**: Focus on the business logic, launching the server and simulating HTTP requests to check for expected responses.
- **Router Tests**: Test the functionality of the routing system, ensuring proper route handling and no side effects between tests.

## Further Improvements
- Implement a middleware system to better separate domain logic from server logic.
- Expand support for more HTTP methods beyond GET and POST.
- Add support for more body parsers (e.g., JSON).

## Conclusion
This project is a demonstration of my ability to build robust systems from the ground up, utilizing modern tools and applying best practices in software design. It showcases my understanding of backend development, HTTP protocol handling, and testing principles. For further discussions, especially in interviews, feel free to explore the code and ask about the design decisions behind specific components.