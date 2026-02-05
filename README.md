# FlashCardAI — Intelligent Flashcards for Faster Learning

A modern, user-friendly website that helps learners create, practice, and retain knowledge using AI-generated flashcards and proven study techniques. FlashCardAI transforms plain text, notes, or articles into memorization-ready flashcards, supports multiple study modes, and integrates spaced-repetition to help information move from short-term to long-term memory.

> Note: This README is written to be professional and human-friendly. Replace any placeholders (site URL, commands, environment variables) with values that match your repository and deployment.

[Live demo](https://your-live-site.example.com) • [Report a bug](https://github.com/Mamadi-exe/FlashCardAI_website/issues/new)

Badges
- Build: ![build status](https://img.shields.io/badge/build-passing-brightgreen)
- License: ![license](https://img.shields.io/badge/license-MIT-blue)
- Version: ![version](https://img.shields.io/badge/version-1.0.0-yellowgreen)

Table of contents
- [Why FlashCardAI?](#why-flashcardai)
- [Key features](#key-features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Getting started (local)](#getting-started-local)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

Why FlashCardAI? #why-flashcardai
FlashCardAI reduces the time you spend creating study materials by automating flashcard generation and optimizing review schedules using spaced repetition. It’s designed for students, professionals, and lifelong learners who want an efficient, focused way to remember what matters.

Key features
- AI-assisted flashcard generation from:
  - Plain text or notes
  - URLs / articles (optional)
- Multiple study modes:
  - Learn mode (guided study)
  - Review mode (spaced repetition)
  - Quiz mode (self-test)
- Deck and card management:
  - Create, edit, tag, and organize decks
  - Import/export decks (CSV/JSON/Anki-compatible)
- Personalization:
  - Difficulty settings
  - Custom study schedules and notifications
- Authentication (optional):
  - Local accounts or OAuth providers (Google/GitHub)

How it works
1. Create or import a deck.
2. Use the AI generator to turn notes or an article into question/answer cards.
3. Study using Learn or Review modes. Cards the system flags as “hard” reappear sooner via spaced repetition.
4. Export or share decks with classmates or colleagues.

Tech stack
This README intentionally keeps the stack flexible so you can adapt it to your actual implementation. A typical stack for FlashCardAI includes:
- Frontend: React
- Styling: Tailwind CSS
- Authentication: Firebase Auth
- AI: Ollama locally ran look at backend for more details


Getting started (local)

1. Clone the repo
   git clone https://github.com/Mamadi-exe/FlashCardAI_website.git
   cd FlashCardAI_website

2. Install dependencies
   npm install
   # or
   yarn install
   # or
   pnpm install

3. Create a .env file from the example (if provided)
   cp .env.example .env

4. Add required environment variables (see below)

5. Run the development server
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev

6. Open http://localhost:3000 (or the port your app uses)

Deployment
- Vercel
  - Push to GitHub and connect the repo to Vercel
  - Configure environment variables in the Vercel dashboard
  - Vercel will automatically build and deploy (for Next.js, React apps)

- Netlify
  - Connect the repo and set build command and publish directory
  - Add environment variables in the Netlify UI

- Docker
  - Create a Dockerfile and docker-compose configuration for your web and db services
  - Build and run via docker-compose up --build

Contributing
Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch: git checkout -b feature/your-feature
3. Implement changes and add tests where possible
4. Open a pull request with a clear description and screenshots (if UI changes)
5. Address review feedback and iterate

Please follow these guidelines:
- Keep commits small and focused
- Write clear commit messages
- Update README and docs when adding or changing features
- Respect code style and tests

Roadmap (example)
- Import directly from URLs or PDFs
- Multi-user classrooms and deck sharing
- Mobile app or improved PWA offline support
- Advanced analytics and learning recommendations


Contact
Maintained by Mamadi-exe — https://github.com/Mamadi-exe

If you have questions, feature requests, or bugs to report, please open an issue: https://github.com/Mamadi-exe/FlashCardAI_website/issues

Acknowledgements
- Inspired by spaced repetition systems such as Anki and SuperMemo
- Thanks to the open-source community and AI providers that make rapid prototyping possible

