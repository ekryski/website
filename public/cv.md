# Eric Kryski

**Full-stack Engineer · AI Systems · Founder**

Calgary, Canada · Available remote, open to travel and relocation to select locations

[hello@erickryski.com](mailto:hello@erickryski.com) · [erickryski.com](https://erickryski.com) · [github.com/ekryski](https://github.com/ekryski) · [linkedin.com/in/ekryski](https://www.linkedin.com/in/ekryski)

---

## Summary

Full-stack engineer with 15 years shipping and operating production software, eight of them as technical co-founder of a payments company. I can design and build the application, run the infrastructure under it, and maintain and help scale it after launch. Most of my recent work is agentic in nature: internal tools driven by multi-modal AI models, automation that replaces manual operations work, and ongoing research on novel physics based and more performant AI models and GPU kernel tuning. I am used to being the first engineer on a problem nobody has scoped yet, and feel comfortable scoping work in phases, deciding what to buy instead of build, and coordinating teams of agents and people to get it done.

---

## Technical Skills

**Languages** · JavaScript, TypeScript, Python, Ruby, Rust, Swift, Java, SQL

**Frontend** · React, Next.js, React Native, Expo, Tailwind CSS, WebGL, three.js

**Backend** · Node.js, Feathers.js, Express, PostgreSQL, Redis, MongoDB, Neo4j, RabbitMQ, REST and real-time APIs, queueing, caching

**AI and Agentic Systems** · LLM orchestration, agent harnesses and evaluation design, RAG pipelines, hybrid retrieval over BM25/FTS5 and vector search, memory decay and context-window management, AI-driven content generation and analysis, n8n workflow automation, local inference on Apple Silicon (MLX, Metal and CUDA kernels), AI-native development with Claude Code, Cursor and Codex

**Infrastructure and DevOps** · Google Cloud Platform, Kubernetes, Docker, CI/CD, GitHub Actions, Vercel, Netlify, Supabase, Heroku, monitoring and on-call ownership

**Security and Compliance** · OAuth and SSO, access control, AML and KYC programs, cross-border fintech licensing, blockchain forensics

---

## Experience

### CEO & Co-Founder, Bidali
**March 2018 – Present** · Calgary, Canada

Payments and commerce infrastructure. Co-founding engineer and primary architect turned CEO.

- With my co-founder, built and operated the internal tooling that runs the business: customer support, sales, marketing and compliance workflows, automated to the point that a very small team supports customers worldwide.
- Architected the platform APIs on Feathers.js, Node.js and PostgreSQL, with Redis for queueing and caching.
- Designed and run the production infrastructure on Google Cloud Platform and Kubernetes, with GitHub Actions for CI, GitHub Container Registry for container deploys and private NPM modules, and front-end deploys on Netlify. 99.9% uptime.
- Processed over **$40M in payments volume** and grew the gift card catalogue to **4,516 brands across 154 countries**.
- Led the integration and maintenance process for **30+ blockchain networks**, including the forensics tooling used to trace them.
- Assisted the RCMP, US Secret Service and FBI in tracing several crypto-asset thefts, and advised the governments of Bermuda and Canada on crypto-asset regulation.
- Raised venture capital and ran finance, HR, taxation and licensing.

### Managing Partner, Bullish Ventures
**August 2015 – Present** · Calgary, Canada

Product development and CTO-as-a-service for startups, from rapid prototyping through to production. Early adopters of and contributors to Web3.js, React, React Native and Expo.

- **Uncoil (Matter), April – August 2025.** Architected an AI-driven marketing platform generating omni-channel advertising that routed prospects to landing pages tailored to their buyer persona, with LLM-driven content generation and performance analysis, then handed the architecture to their internal team to build. Business rules and AI automation in n8n. Node.js, React, PostgreSQL, Supabase, GCP.
- **Plume Network, April 2024 – December 2025.** Helped build the first iteration of the network, the pre-launch portal and the mainnet portal, working primarily as co-project manager. Independently ran the static and dynamic analysis on sybil attack and usage patterns that separated bots from genuine users. Vercel, Node.js, React, PostgreSQL, Redis.

### National FinTech Committee Member, Canadian Blockchain Consortium
**March 2020 – December 2024** · Canada, part-time

Helped lead the committee working toward Canadian regulatory standards for blockchain and crypto-asset legislation in financial services. Drafted policy recommendations, gathered industry feedback, established governance protocols, and interfaced with politicians, regulators, law enforcement, financial institutions and other stakeholders at committee hearings and round tables.

### Engineering, KISSmetrics
**July 2014 – January 2015** · Calgary, Canada

- Built much of the new reporting and dashboard interface in React.
- Introduced automated tests and linting into the deployment process.

### VP of Architecture, PetroFeed
**March 2013 – May 2014** · Calgary, Canada

- Built the scraping, ingestion, normalization and scoring pipeline for oil and gas drilling, well and land licensing data, modelling the relationships between entities as a graph in Neo4j. Ruby, Node.js, MongoDB, Neo4j and RabbitMQ.
- Led the team which built a heavily customized Google Maps interface that exposed relationships between rigs, land sales and production facilities, used for prospecting, monitoring, acquisitions and competitive analysis.

### Software Developer, Calgary Scientific
**September 2012 – March 2013** · Calgary, Canada

- Built custom high-performance Linux distributions for rendering medical imaging data on NVIDIA GPUs, against a Java imaging core.
- Built a real-time collaborative web review platform using WebGL, Node.js and JavaScript, demoed at RSNA 2012.

### Senior Software Developer, MyMobileCoverage
**May 2011 – July 2012** · Calgary, Canada

- Replaced a .NET backend with a high-throughput Node.js service on MongoDB, Memcached and SQL Server, deployed to Heroku.
- Helped build the Android, iOS and BlackBerry applications for collecting wireless cell tower usage data, and the heat map visualizations of coverage and signal strength over OpenStreetMap.

---

## Research & Open Source

**Coupled-oscillator speech models** (2025 – present) · Original research into whether speech recognition can run on oscillator physics rather than attention. Two papers. The second measures spoken-digit recognition across **1,940 pre-registered experiment runs**, a full factorial of coupling laws, lattice geometries, frequency structures and drive pathways, against GRU, TCN, CNN, transformer and S4D baselines at exact parameter parity. An [interactive guide](https://erickryski.com/articles/how-a-machine-hears-a-number) runs the whole pipeline live in the browser.

**Sam** · A personal AI assistant for macOS running fully on-device on Apple Silicon through MLX, no cloud and no Python. Memory is a retrieval-augmented store over SQLite FTS5 with BM25 ranking, TTL-based decay and automatic context injection, with embedding-based semantic search and a directed-graph memory layer for associative recall.

**Feathers.js** · Co-creator and maintainer of the real-time Node.js framework. Wrote the original authentication plugin and every OAuth connector flow in it, the permissions module behind its fine-grained RBAC, the database adapters, and the project documentation, and made sure all of it worked and scaled over websockets. Took it from a side project to adoption in almost every country, then handed it to a core team with a real release process.

**Iron and Butter** · A Rust kernel DSL compiling one definition to Metal, CUDA, HIP and Vulkan, plus a dependency-light LLM inference library for Apple Silicon built on it. Releasing shortly at [waffuru.ai](https://waffuru.ai).

---

## Education & Interests

**BSc, Computer Science** · University of Calgary, 2011. Published undergraduate HCI research on emotive expression in interactive robotic vehicles ([Springer](https://link.springer.com/chapter/10.1007/978-3-642-23765-2_7)). Founded and ran **Krysco Contracting Corp.**, a landscape construction company, from 2004 to 2012 to pay for school. Founder of **YYC.js** ([speaking history](https://erickryski.com/speaking)). Competed in speed skating at the national and international level, and classically trained in violin.
