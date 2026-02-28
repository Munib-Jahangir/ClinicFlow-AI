# 🏥 ClinicFlow AI - Premium Hospital Management System

ClinicFlow AI is a high-performance, role-based medical management ecosystem designed to streamline clinical workflows through AI-driven analytics, digital record keeping, and smart patient management.

## 🚀 Key Features

### 👤 Role-Based Dashboards
- **Admin**: Full operational control with real-time analytics, revenue tracking, and staff management (Doctors & Receptionists).
- **Doctor**: Clinical terminal for patient queue management, **AI Symptom Analysis**, and **E-Prescription** (Auto-PDF generation).
- **Patient**: Personal health hub to track appointment timeline, download digital prescriptions, and chat with an **AI Health Assistant**.
- **Receptionist**: Front-desk operations for quick patient registration and dispatching appointments.

### 🧠 Intelligent Core
- **AI Symptom Checker**: Clinical decision support that analyzes symptoms and suggests possible conditions/tests.
- **AI Health Companion**: 24/7 patient assistant to explain medical records and clarify health concerns.

### 📊 Operational Excellence
- **Real-time Analytics**: Interactive charts for daily patients, department inflow, and clinic revenue.
- **Digital Records (EHR)**: Full patient history timeline including diagnoses and prescribed medications.
- **Automated PDFs**: Instant generation of professional, clinic-branded prescriptions.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite (Extremely Fast Performance)
- **Styling**: Modern Vanilla CSS (Premium Glassmorphism & Micro-animations)
- **Backend**: InsForge Ecosystem (PostgreSQL Database, Storage, Auth)
- **Icons**: Lucide React
- **Visualization**: Recharts
- **Documents**: jsPDF

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Munib-Jahangir/ClinicFlow-AI.git
   cd ClinicFlow-AI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Ensure your InsForge API keys are configured in the `src/api/insforge.js` file.

4. **Launch Application**:
   ```bash
   npm run dev
   ```

## 🌐 Deployment
- **Platform**: Vercel (Integrated routing fixes for SPAs)
- **Production URL**: [https://hospitalsystem.munibjahangirdev.site](https://hospitalsystem.munibjahangirdev.site)

---

## 📝 Project Summary (for Interviewers)
- **Authentication**: Secure JWT-based Login/Signup with OTP verification.
- **Database**: Real-time Relational Database (Profiles ↔ Roles ↔ Clinical Data).
- **UX Design**: Focus on accessibility and professional "Medical Blue" aesthetics.

Developed with ❤️ by **Munib Jahangir**
