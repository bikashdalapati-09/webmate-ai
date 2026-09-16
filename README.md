# ⚡ WebMate AI

WebMate AI is a modern, full-stack AI SaaS platform designed to embed intelligent, context-aware AI agents directly onto any website 🌐. Powered by Retrieval-Augmented Generation (RAG) 🧠 and Google Gemini AI ✨, WebMate AI enables automated document ingestion 📄, continuous knowledge retrieval 🔍, real-time query resolution ⚡, and seamless user interaction via an intuitive, Apple-inspired interface 💻.

---

## 🚀 Key Features

* **📦 Embeddable AI Agent Script:** Generate lightweight, drop-in JavaScript widgets (`assistant.js`) to instantly embed dynamic AI chat assistants onto any external site.
* **📄 Document Processing & RAG Engine:** Upload and parse complex PDF documents into vector embeddings using `gemini-embedding-2` for accurate, context-grounded semantic responses.
* **🎯 Vector Database Retrieval:** High-speed semantic similarity matching powered by Qdrant vector database storage.
* **🤖 AI Mock Interview & Assistant Workflows:** Built-in interactive agents capable of dynamic question generation, analysis, and custom user assistance.
* **💳 Token-Based Billing System:** Integrated Razorpay payment gateway enabling token top-ups and flexible subscription management.
* **🔐 Multi-Provider Authentication:** Secure user authentication using JSON Web Tokens (JWT) along with Firebase Google Single Sign-On (SSO).
* **🎨 Apple-Inspired UI Design:** Built with custom Tailwind CSS and Framer Motion animations, featuring dynamic notch elements, glassmorphism styling, and interactive desktop-like widgets.
* **⚡ Real-Time Communication:** Express backend optimized with CORS configuration for cross-origin widget communication and low-latency interaction.

---

## 🛠️ Tech Stack

### 💻 Frontend
* **⚛️ Framework:** React.js (Vite)
* **🎨 Styling & Motion:** Tailwind CSS, Framer Motion
* **🧠 State Management:** Redux Toolkit / React Context API
* **✨ Icons & Components:** React Icons, Lucide Icons

### ⚙️ Backend & Database
* **🚀 Runtime & Framework:** Node.js, Express.js
* **🗄️ Database:** MongoDB (Mongoose), Qdrant Vector DB
* **🔑 Authentication:** JWT, Firebase Auth, Cookie-Parser
* **💰 Payments:** Razorpay API

### 🤖 AI & Machine Learning
* **🧠 LLM Core:** Google Gemini API `gemini-3.5-flash-lite`
* **📐 Embeddings & RAG:** `gemini-embedding-2`, `pdf-parse`, Cosine Similarity
