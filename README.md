# SoloSuccess AI

**SoloSuccess AI** is a comprehensive, AI-powered operating system designed to empower solopreneurs. It integrates strategic intelligence, operational management, productivity tools, and creative resources into a unified, futuristic interface.

Built with a "Cyberpunk/High-Tech" aesthetic, it provides a command center for managing every aspect of a solo business, from competitor analysis to financial tracking.

## 🚀 Key Features

### 🧠 Strategic Intelligence

- **Competitor Stalker**: Deep-dive analysis of competitors.
- **Signal Tower**: Market trend monitoring and signal detection.
- **The Scout**: Advanced research and reconnaissance.
- **The Pivot**: Market validation and pivot analysis.

### 💼 Operations & Management

- **Dashboard**: Centralized command center for daily overview.
- **Treasury**: Financial tracking and management.
- **The Boardroom**: Strategic decision-making and planning.
- **The Ironclad**: Legal and compliance management.
- **The Mainframe**: Core system settings and data management.

### ⚡ Productivity & Execution

- **Tactical Roadmap**: Project management and execution planning.
- **War Room**: Intensive problem-solving sessions.
- **Focus Mode**: Distraction-free work environment.
- **System Boot**: Daily startup routine and onboarding.

### 🎨 Creativity & Innovation

- **Idea Incinerator**: Validate and refine business ideas.
- **The Studio**: Creative asset management and creation.
- **The Deck**: Pitch deck creation and management.
- **The Architect**: System and process design.

### 📚 Knowledge & Growth

- **The Codex**: Knowledge base and documentation.
- **The Academy**: Learning resources and skill development.
- **The Vault**: Secure storage for sensitive assets.
- **The Simulator**: Scenario planning and simulation.

### 🌐 Networking & Community

- **The Network**: Professional relationship management.
- **The Tribe**: Community engagement.
- **The Uplink**: External communications and integrations.

### 🤖 AI Core

- **Agent Chat**: Integrated AI assistant for real-time support and automation.
- **Command Palette**: Quick access to all features and AI commands.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express (implied)
- **Database**: PostgreSQL, Drizzle ORM
- **AI**: Google Generative AI (Gemini)
- **Payments**: Stripe
- **Testing**: Vitest, React Testing Library

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- Google Gemini API Key
- Stripe API Keys (optional for billing)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/prettyinpurple2021/solosuccess-ai.git
    cd solosuccess-ai
    ```

2. **Install dependencies**

    ```bash
    npm install
    # Also install server dependencies
    cd server
    npm install
    cd ..
    ```

3. **Environment Setup**
    Create a `.env` file in the root and `server` directories with necessary environment variables (Database URL, API Keys, etc.).

4. **Database Setup**

    ```bash
    npm run db:generate
    npm run db:push
    ```

5. **Run the Application**

    ```bash
    npm run dev:all
    ```

    This command runs both the frontend (Vite) and backend server concurrently.

## 📜 Scripts

- `npm run dev`: Run frontend only.
- `npm run dev:all`: Run both frontend and backend.
- `npm run build`: Build for production.
- `npm run test`: Run tests with Vitest.
- `npm run db:studio`: Open Drizzle Studio to manage database.

## 📄 License

[Add License Here]
