# ClinicFlow AI - Project Summary & Interview Guide

ClinicFlow AI is a high-performance, role-based Clinical Management System (CMS) built for medical practitioners, staff, and patients. It integrates AI-driven symptom analysis, electronic health records (EHR), and real-time scheduling.

## 🚀 Tech Stack & Architecture
- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS (Modern Premium Design)
- **Backend Services**: InsForge (Authentication, Postgres Database, Storage)
- **State Management**: React Context API (`AuthContext`)
- **Icons**: Lucide React
- **Charting**: Recharts
- **PDF Generation**: jsPDF
- **AI Integration**: Custom AI Client (LLM access for diagnostics)

## 🔑 Functional Roles & Features

### 1. Admin (Command Center)
- **Role**: Total system oversight.
- **Features**:
  - **Dynamic Analytics**: Real-time patient inflow, revenue forecasting, and department efficiency charts.
  - **Staff Management**: Full CRUD for Doctors and Receptionists.
  - **Global Appointments**: Oversight of all clinic bookings.
  - **Ledger Tracking**: Financial summaries based on clinical sessions.

### 2. Doctor (Clinical Terminal)
- **Role**: Patient care and diagnostics.
- **Features**:
  - **Case Queue**: Daily appointment management (Confirm/Complete).
  - **AI Symptom Checker**: Clinical decision support using AI to analyze symptoms and suggest conditions.
  - **E-Prescription**: Digital prescription creation with PDF generation.
  - **Patient Timeline**: View medical history and past diagnoses.

### 3. Patient (Health Hub)
- **Role**: Self-service medical access.
- **Features**:
  - **Health Timeline**: Chronological view of all clinical interactions.
  - **Digital Vault**: Access and download verified PDF prescriptions.
  - **AI Health Companion**: Personalized AI chatbot for medical queries.
  - **Appointment Tracker**: View and track status of upcoming visits.

### 4. Receptionist (Front Desk)
- **Role**: Operational coordination.
- **Features**:
  - **Patient Registration**: Profile creation and record management.
  - **Clinical Queue**: Real-time coordination of daily visits.
  - **Appointment Dispatch**: Booking sessions for any doctor in the system.

## ✅ Current Functionality Status
- **Auth**: Fully functional (Signup, OTP Verification, Role-based login).
- **Database**: Real-time sync with Postgres for all tables (Profiles, Doctors, Patients, Appointments, Prescriptions).
- **UI/UX**: Premium, responsive layout with role-specific sidebars.
- **AI**: Functional AI Symptom Checker and Patient Assistant.
- **PDF**: Automatic prescription generation is functional.

## 🚩 Limitations / Not Implemented
- **Payment Gateway**: Revenue is simulated based on session counts; no real billing integration.
- **Video Consultation**: Currently supports physical visit scheduling only.
- **Push Notifications**: Relies on in-app UI feedback; no external SMS/Email notification system.

## 🎤 Interview Tips
- Mention how **Role-Based Access Control (RBAC)** is handled via the `profiles` table and `AuthContext`.
- Highlight the **AI Integration** as a clinical decision support tool, not a replacement for doctors.
- Focus on **Data Integrity**: Every doctor must be linked to a user profile in `profiles` via email.
