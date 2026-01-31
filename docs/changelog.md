# Changelog

## 2026-01-31

### Planning Phase
- Created implementation plan for unCaptcha npm library
- Defined 5 challenge types: function execution, chained operations, encoded instructions, pattern extraction, code transformation
- Outlined architecture with server SDK, client solver, and middleware support
- Planned file structure with 15+ new files across core, functions, server, and client directories


### Implementation Phase
- Created TypeScript project structure with `package.json`, `tsconfig.json`, `tsup.config.ts`
- Implemented core types in `src/core/types.ts`
- Implemented encoding utilities (base64, hex, rot13) in `src/core/encoding.ts`
- Created function pools:
  - `src/functions/math.ts` - 11 mathematical functions
  - `src/functions/string.ts` - 13 string manipulation functions
  - `src/functions/array.ts` - 14 array operation functions
  - `src/functions/composite.ts` - 6 composite/chained functions
- Implemented `src/utils/crypto.ts` - HMAC signing, timing-safe comparison
- Implemented `src/utils/rate-limiter.ts` - in-memory rate limiter
- Created challenge generator in `src/core/generator.ts` supporting 5 challenge types
- Created challenge verifier in `src/core/verifier.ts` with stateful and stateless modes
- Implemented Express middleware in `src/server/middleware.ts`
- Created standalone API in `src/server/standalone.ts`
- Implemented client solver in `src/client/solver.ts`
- Implemented client executor in `src/client/executor.ts`
- Created main entry point `src/index.ts`
- Created `README.md` documentation
- Created example files in `examples/`
- Build successful with dual ESM/CJS outputs

- Added .gitignore file

### Documentation Improvements
- Rewrote README.md with Banner.png, cleaner layout, and visual flow diagram
- Created docs/api.md - Full API reference
- Created docs/challenges.md - Detailed challenge type documentation  
- Created docs/security.md - Security guide and best practices
- Created docs/llm.txt - Machine-readable documentation for AI agents


### Seamless Agent Flow
- Modified middleware to return challenge + solving instructions inline on 401
- Added buildSolvingInstructions() that generates human/LLM-readable solving steps
- AI agents no longer need to install the client library
- Flow is now: request → 401 with instructions → solve → retry with answer
- Updated docs/llm.txt with new seamless flow documentation

- Rewrote docs/llm.txt as integration guide for AI coding assistants (not solving guide)

### NPM Publishing Setup
- Updated package.json: fixed exports, removed private flag, added repository/homepage/bugs
- Created LICENSE (MIT)
- Created .npmignore to exclude source files and dev files
- Package ready to publish (94.4 kB)

