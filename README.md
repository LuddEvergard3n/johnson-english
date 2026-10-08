# Johnson English

![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?logo=javascript&logoColor=111111)
![CEFR](https://img.shields.io/badge/CEFR-A1_to_C2-2563EB)
![Lessons](https://img.shields.io/badge/Lessons-209-7C3AED)
![License](https://img.shields.io/badge/License-MIT-0F766E)

Browser-based English learning platform structured around the classical Trivium: grammar for acquisition, logic for structure, and rhetoric for production.

## Curriculum

Johnson covers the complete CEFR progression from A1 to C2 through 55 modules and 209 lessons.

| Level | Modules | Lessons | Language mode |
|---|---:|---:|---|
| A1 | 8 | 31 | Portuguese and English |
| A2 | 11 | 42 | Portuguese and English |
| B1 | 9 | 34 | Portuguese and English |
| B2 | 9 | 34 | Portuguese and English |
| C1 | 9 | 34 | English only |
| C2 | 9 | 34 | English only |

The curriculum progresses from daily communication and pronunciation to academic writing, discourse analysis, pragmatics, rhetoric, and stylistic control. Six pronunciation modules provide guided work from individual sounds to connected speech and prosody.

## Features

- Grammar, logic, rhetoric, pronunciation, and practical-language modules.
- Pre-generated American and British Kokoro audio with a persistent accent selector and native Web Speech API fallback.
- Local curriculum search and visible progress from A1 to C2.
- In-browser voice recording for private pronunciation comparison.
- Shareable lesson links, adjustable speech speed, and sequential navigation.
- Installable PWA with offline access after the first visit.
- Progressive immersion: bilingual support through B2 and full English from C1.
- Browser-based lessons with no application server.
- Deterministic Node.js test runner with no test framework dependency.

## Run locally

Native ES modules require an HTTP server:

On Windows, double-click:

```text
abrir-johnson.cmd
```

Or run on any platform with Node.js:

```bash
node server/local-server.js
```

Open `http://127.0.0.1:4175`. Opening `index.html` directly with a `file://`
URL does not work because browsers block ES modules and curriculum requests in
that mode.

## Tests

```bash
node tests/test-runner.js
```

## Structure

```text
index.html             Application entry point
css/                   Base, layout, and mobile styles
js/                    Router, state, lesson and audio engines
data/                  Levels, modules, and lessons
tests/test-runner.js   Dependency-free checks
manifest.webmanifest  Installation metadata
sw.js                  Versioned offline cache
docs/                  Architecture, pedagogy, audio, and development notes
server/local-server.js Dependency-free local HTTP server
abrir-johnson.cmd      Two-click Windows launcher
```

## Design decisions

- Native JavaScript modules keep the project inspectable and build-free.
- Curriculum data is separated from presentation and lesson engines.
- C1 and C2 intentionally remove Portuguese scaffolding.
- Speech features degrade safely when a browser does not support them.
- Progress and audio preferences remain on the current device; recordings are never persisted or uploaded.
- Kokoro runs only during content preparation; students never download the model.

## Live version

[luddevergard3n.github.io/johnson-english](https://luddevergard3n.github.io/johnson-english/)

## License

MIT License.
