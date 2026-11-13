# NuxiPro

> **⚠️ Read-Only Mirror**
> This repository is an automated public mirror of **NuxiPro Cloud**. 
> The official source of truth, active development, issues, and merge requests are hosted on [Codeberg](https://codeberg.org/NuxiPro/Core). Contributions and pull requests on GitHub are not monitored.

---

## Why I Built NuxiPro:

NuxiPro is built to last over time without becoming complicated and visually overloaded.

Today's tools help you add tasks every day, which is simple and effective, but none help you remove those completed tasks from your workspace. As a result, your dashboard turns into a graveyard of completed tasks.

I built NuxiPro to help me daily and to no longer depend on closed solutions like Trello (which is American). I'm creating a sovereign, secure, and simple tool to help me build my projects, while clearing my workspace of completed tasks that pile up and slow down the tool needlessly.

For example, tools like Todoist don't really move tasks: they only hide them. So the task stays there in the background, which ends up making the app heavier and slower when you open the board.

I simply chose to do exactly the opposite of other tools by creating a simple solution, effective daily, that doesn't waste your time.

---

## Architecture

```
Core/
├── app/
│   ├── backend/          # Bun + Hono API (/api/v1)
│   ├── web-frontend/     # React + Vite app
│   └── global-doc/       # docs (frontend/ + backend/)
├── packages/shared/      # shared types, config, logger
│
├── LICENSE                      ← AGPL v3 License
├── CLA.md                        ← Contributor License Agreement
└── CONTRIBUTING.md               ← contribution guidelines
```

---

## Development

The frontend was built using AI ("vibe coding"). This deliberate choice allows me to avoid getting bogged down in client-side issues and focus entirely on the infrastructure and backend server.

### Security & Privacy

* **Frontend:** While UI design and visual integration were delegated to AI, strict attention was paid to security to prevent any immediate vulnerabilities.
* **Backend and Infrastructure:** Security is built in from the ground up (*Security by Design*) to protect future users.
* **Sovereign Hosting:** As the primary daily user of NuxiPro myself, privacy is a top priority. All data is hosted in Finland in a sovereign, privacy-respecting environment.

> **Reporting a Security Vulnerability**  
> **Please do not open a public issue for security-related matters.**  
> If you discover a vulnerability or have any sensitive inquiries, please contact me directly via email at: **security@nuxipro.com**

---

## Run locally

Requirements: Bun + Docker (for the local DB).

### Step one

Install bun
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bash_profile
```

### Step two

```bash
git clone https://github.com/Babas974/NuxiPro.git
cd NuxiPro/Core
bun install

# 1a. backend env (parent dir + backend dir)
cp app/web-frontend/.env.exemple app/.env
cp app/backend/.env.example app/backend/.env

# 1b. frontend env (own folder only, never the parent dir)
# put BACKEND_API_URL + BACKEND_AUTH_URL in app/web-frontend/.env

# 2. local DB (PostgreSQL 17, localhost only)
docker compose -f docker-compose.dev.yml up -d
```

Fill in `app/backend/.env` (minimum to run):

```bash
DATABASE_URL=postgresql://dev:dev@localhost:5432/dev
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
```

Defaults already in the templates work for local: backend `:8080`, frontend `:8787`.

```bash
# 3. backend (terminal 1)
cd app/backend
bun run dev

# 4. frontend (terminal 2)
cd app/web-frontend
bun run dev
```

Open `http://localhost:8787`, create an account (or request a magic link). **In local dev no email is sent: copy the magic-link URL directly from the backend terminal logs** (`[dev] magic link for <email>: <url>`) and open it in the browser.

## Tests

```bash
cd app/backend && bun test              # backend tests
cd app/web-frontend && bun run test:run # frontend tests (vitest, single pass)
```

## License

This project is licensed under the **AGPL-3.0 License**.
For more details, see the [LICENSE](./LICENSE) file.

---

## Contributing and Feedback

Your feedback is always welcome! Feel free to open an **issue** to:
* Suggest new features or improvements
* Share general feedback
* Report a bug (non-security critical)

I will take the time to read and reply to every submission.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CLA.md](CLA.md).

---

**Author:** Sébastien Babas

- **Site :** [nuxipro.com](https://nuxipro.com)
- **Blog/Docs :** [center](https://center.nuxipro.com)
- **Demo :** [demo](https://demo.nuxipro.com)
- **Cloud NuxiPro :** [cloud (In dev)](https://app.nuxipro.com)
