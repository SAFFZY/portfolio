// All site content lives here. Edit this file to update the portfolio.

export const profile = {
  name: "Saffran Makkar",
  first: "Saffran",
  role: "AI / ML Engineer",
  tagline: "LLMs · Agents · Workflow Automation",
  location: "Delhi NCR, India",
  timezone: "Asia/Kolkata",
  email: "saffran.makkar@gmail.com",
  github: "https://github.com/SAFFZY",
  linkedin: "https://www.linkedin.com/in/saffran-makkar",
  resume: `${import.meta.env.BASE_URL}Saffran_Makkar_Resume.pdf`,
};

export const stats = [
  { value: 8, suffix: "+", label: "AI workflows in production" },
  { value: 40, suffix: "%", label: "Less manual processing time" },
  { value: 10, suffix: "+", label: "Business reports powered" },
  { value: 3, suffix: "", label: "Teams shipped with" },
];

export const capabilities = [
  {
    title: "LLM Systems & RAG",
    description:
      "Retrieval pipelines, structured prompting and model selection — local (Ollama, Llama 3) or API-based — tuned for answers people can trust.",
    tools: ["Prompt Eng.", "RAG", "Hugging Face", "OpenAI", "Llama 3"],
  },
  {
    title: "Agentic Workflows",
    description:
      "Agents wired into real business systems through APIs and webhooks — qualifying leads, routing queries and closing loops without a human in the middle.",
    tools: ["n8n", "Make", "Webhooks", "Gmail API", "Playwright"],
  },
  {
    title: "Backend & Deployment",
    description:
      "Python services that hold up in production: FastAPI, REST, auth, validation, containers and the boring parts that keep things running.",
    tools: ["Python", "FastAPI", "Docker", "Tilt", "Azure"],
  },
  {
    title: "Data & Analytics",
    description:
      "Ingestion and transformation pipelines across messy sources, ending in dashboards and reports that decisions actually get made on.",
    tools: ["Microsoft Fabric", "Pandas", "SQL", "ETL", "NumPy"],
  },
];

export type Project = {
  id: string;
  index: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  problem: string;
  approach: string[];
  outcome: string;
  stack: string[];
  art: "graph" | "rings" | "bars" | "wave" | "grid" | "orbit";
  link?: string;
};

export const projects: Project[] = [
  {
    id: "ats",
    index: "01",
    title: "Automated Application Tracker",
    kind: "Personal project · LLM pipeline",
    year: "2025",
    summary:
      "An inbox that reads, scores and replies to job applications on its own — powered by a locally hosted LLM.",
    problem:
      "Screening applications by hand meant hours spent opening emails, reading resumes and writing the same replies.",
    approach: [
      "Built an email pipeline that parses inbound applications and extracts resumes automatically.",
      "Scored each resume against role criteria with Llama 3 running locally through Ollama — no data leaves the machine.",
      "Applications below a set threshold receive an automatic, polite rejection; the rest are queued for review.",
    ],
    outcome: "100+ resumes processed in minutes instead of hours of manual review.",
    stack: ["n8n", "Python", "Llama 3", "Ollama", "Webhooks", "Gmail API"],
    art: "graph",
    link: "https://github.com/SAFFZY",
  },
  {
    id: "lead-agent",
    index: "02",
    title: "Lead Qualification Agent",
    kind: "Alletec · Agentic AI",
    year: "2026",
    summary:
      "LLM agents connected to internal APIs that qualify incoming leads and route queries to the right team.",
    problem:
      "Sales and travel teams were triaging inbound leads and queries manually, and response times stretched into hours.",
    approach: [
      "Integrated LLM-based agents with internal APIs and webhooks.",
      "Automated lead qualification and query routing end to end.",
      "Part of 8+ automation workflows shipped across travel and sales operations.",
    ],
    outcome: "Response turnaround cut from hours to minutes; ~40% less manual processing across workflows.",
    stack: ["Python", "FastAPI", "n8n", "LLM Agents", "Webhooks"],
    art: "orbit",
  },
  {
    id: "fabric",
    index: "03",
    title: "Enterprise Analytics on Fabric",
    kind: "Alletec · Data engineering",
    year: "2026",
    summary:
      "Real-time analytics for enterprise clients in travel, FMCG and manufacturing, built on Microsoft Fabric.",
    problem:
      "Live business data was spread across many disconnected sources, so reporting lagged behind what was actually happening.",
    approach: [
      "Built ingestion and transformation pipelines over real-time data from 5+ sources.",
      "Modelled the data so every report reads from one consistent layer.",
      "Delivered the reports that teams use to track performance.",
    ],
    outcome: "10+ live business reports powered for three enterprise clients.",
    stack: ["Microsoft Fabric", "SQL", "ETL", "Python", "Pandas"],
    art: "bars",
  },
  {
    id: "qa-agent",
    index: "04",
    title: "Core QA Agent",
    kind: "Chirpin IT · LLM agent",
    year: "2026",
    summary:
      "A question-answering agent and the reusable Python framework underneath it.",
    problem:
      "The baseline QA agent missed too many queries, and each module handled APIs and validation its own way.",
    approach: [
      "Built a reusable Python framework standardising API handling and data validation across modules.",
      "Rebuilt the core QA agent with FastAPI and structured prompting.",
      "Shipped the web application layered on top of the framework.",
    ],
    outcome: "~25% better automated query resolution accuracy over the baseline.",
    stack: ["Python", "FastAPI", "Structured Prompting", "REST"],
    art: "rings",
  },
  {
    id: "smartians",
    index: "05",
    title: "Back-office Automation Suite",
    kind: "Smartians AI · Automation",
    year: "2025",
    summary:
      "Six n8n workflows linking Gmail, Google Sheets and OpenAI to remove repetitive backend work.",
    problem:
      "A small team was losing hours every week to copy-paste between inboxes, sheets and tools.",
    approach: [
      "Designed 6+ AI workflows in n8n connecting Gmail, Google Sheets and OpenAI APIs.",
      "Built and deployed an end-to-end web app with a Python backend and REST APIs.",
      "Handled user authentication and data operations in production.",
    ],
    outcome: "~10 hours of manual backend work removed every week.",
    stack: ["n8n", "OpenAI API", "Python", "REST", "Google Sheets"],
    art: "wave",
  },
  {
    id: "findmyworker",
    index: "06",
    title: "FindMyWorker",
    kind: "Personal project · Marketplace",
    year: "2025",
    summary:
      "A marketplace connecting skilled blue-collar workers with clients nearby.",
    problem:
      "Finding a qualified electrician, plumber or carpenter in your area still runs mostly on word of mouth.",
    approach: [
      "Built a web platform with worker profiles and client search.",
      "Implemented search, filtering and profile matching by skill and area.",
      "Designed a simple flow so clients reach the right person quickly.",
    ],
    outcome: "Less time for clients to find qualified workers nearby.",
    stack: ["Python", "SQL", "JavaScript", "HTML", "CSS"],
    art: "grid",
    link: "https://github.com/SAFFZY/Find-my-worker",
  },
];

export const experience = [
  {
    role: "AI/ML Engineer (AI Evangelist)",
    company: "Alletec",
    period: "Apr 2026 — Present",
    points: [
      "Built and deployed 8+ AI automation workflows across travel and sales operations with Python, FastAPI and n8n — ~40% less manual processing.",
      "Worked on real-time data for enterprise clients on Microsoft Fabric: pipelines across 5+ sources powering 10+ reports.",
      "Integrated LLM agents with internal APIs and webhooks for lead qualification and query routing — hours down to minutes.",
    ],
  },
  {
    role: "Python AI Intern",
    company: "Chirpin IT",
    period: "Feb 2026 — Apr 2026",
    points: [
      "Built a reusable Python framework and the web app on top of it, standardising API handling and validation.",
      "Optimised the core QA agent with FastAPI and structured prompting — ~25% better resolution accuracy.",
    ],
  },
  {
    role: "AI Engineer Intern",
    company: "Smartians AI Pvt. Ltd.",
    period: "Sep 2025 — Dec 2025",
    points: [
      "Designed 6+ n8n workflows integrating Gmail, Google Sheets and OpenAI — ~10 hours/week of manual work removed.",
      "Built and deployed an end-to-end web app with a Python backend, REST APIs and auth in production.",
    ],
  },
];

export const education = {
  school: "KR Mangalam University",
  degree: "B.Tech CSE — AI & ML",
  period: "2022 — 2026",
  coursework: ["Machine Learning", "Deep Learning", "DSA", "DBMS", "Operating Systems", "Computer Networks"],
};

export const certifications = [
  "Microsoft Fabric Data Engineer Associate (DP-700)",
  "Microsoft Azure AI Fundamentals (AI-900)",
  "Google — Generative AI",
  "IBM — Python 101 for Data Science",
  "IBM — Data Visualization with Python",
  "TATA — Data Visualization",
];

export const skills: Record<string, string[]> = {
  "AI / ML": ["LLM Integration", "Prompt Engineering", "Agentic AI", "RAG", "Hugging Face", "Machine Learning", "Deep Learning", "Generative AI"],
  Data: ["Pandas", "NumPy", "Matplotlib", "Preprocessing", "EDA", "Data Viz", "ETL"],
  "Backend & Automation": ["FastAPI", "REST APIs", "Webhooks", "n8n", "Make", "Playwright", "Docker", "Tilt"],
  "Languages & Tools": ["Python", "SQL", "Git", "Azure", "Microsoft Fabric", "Jupyter", "Colab"],
};
