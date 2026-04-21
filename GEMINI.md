# Project Principles and Mandates

This project follows strict engineering and operational standards. All interactions with this repository must adhere to the following mandates:

## 1. Step-by-Step Reporting
For every task, modification, or implementation step, a detailed report MUST be generated and stored as a Markdown file in the `reports/changelog/` directory.

### Report Structure:
- **Title:** `[CHG-YYYYMMDD-SEQ] Task Brief`
- **Sections:** Overview, Time (KST), Detailed Changes (Backend, Frontend, etc.), Database Schema Changes (if any), and Remarks.
- **Filename Pattern:** `YYYYMMDD_SEQ_description.md`

## 2. Infrastructure & Tooling
- **Logs & Reports:** The `reports/` directory is for documentation purposes only and MUST NOT be committed to version control. Ensure it is listed in `.gitignore`.
- **Backend:** Spring Boot (Java) with JPA/Hibernate.
- **Frontend:** React (TypeScript) with TailwindCSS/Lucide-icons.

## 3. Communication Style
- Always provide a concise technical summary after completing each major step.
- Focus on architectural integrity and maintainability.
