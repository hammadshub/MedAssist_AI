# 🩺 MedAssist AI

**Intelligent Disease Identification System** – A full-stack web application that uses Machine Learning and NLP to predict diseases from user-described symptoms, assess risk levels, and provide medical recommendations.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-REST%20API-green?logo=flask)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML%20Model-F7931E?logo=scikit-learn)

---

## 📌 Features

- **NLP Symptom Extraction** – Converts free-text patient descriptions into structured medical symptoms using a 300+ phrase lexicon
- **ML Disease Prediction** – Random Forest classifier predicts the top-3 most likely diseases with confidence percentages
- **Interactive Chatbot** – Conversational symptom-gathering flow that asks targeted follow-up questions to improve diagnostic accuracy
- **Red-Flag Safety Engine** – Rule-based system detects dangerous symptom combinations and escalates risk levels (HIGH → URGENT → EMERGENCY)
- **Medical Recommendations** – Provides lab tests, specialist referrals, and lifestyle tips for predicted diseases
- **User Authentication** – JWT-based login/registration with role-based access (user/admin)
- **Admin Dashboard** – Manage diseases, symptoms, and red-flag safety rules
- **Prediction History** – Users can view and download their past symptom checks and results

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------| 
| **Frontend** | React, Vite, TailwindCSS, Lucide Icons |
| **Backend** | Python, Flask, Flask-JWT-Extended, Flask-Bcrypt |
| **Database** | MySQL |
| **ML/AI** | scikit-learn (Random Forest), pandas, NumPy, joblib |
| **NLP** | Custom rule-based lexicon engine |

---

##System Architecture

User
   │
React Frontend
   │
REST API (Flask)
   │
 ├── NLP Engine
 ├── Safety Engine
 ├── Recommendation Engine
 └── ML Prediction Engine
        │
   Random Forest Model
        │
      MySQL Database

## 📂 Project Structure

```
MedAssist_AI/
├── backend/
│   ├── app.py                      # Flask application entry point
│   ├── config.py                   # Configuration from .env
│   ├── requirements.txt            # Python dependencies
│   ├── models/
│   │   └── db.py                   # MySQL connection pool & query helper
│   ├── routes/
│   │   ├── auth.py                 # Login & registration endpoints
│   │   ├── predict.py              # Symptom prediction endpoint
│   │   ├── chat.py                 # Interactive chatbot endpoint
│   │   ├── history.py              # User prediction history
│   │   └── admin.py                # Admin dashboard endpoints
│   ├── services/
│   │   ├── nlp_engine.py           # NLP symptom extraction
│   │   ├── ml_engine.py            # ML model loading & prediction
│   │   ├── safety_engine.py        # Red-flag detection engine
│   │   ├── recommendation.py       # Medical recommendations
│   │   └── disease_knowledge.py    # Disease knowledge base (41 diseases)
│   ├── ml/
│   │   ├── preprocess_data.py      # Kaggle data preprocessor
│   │   ├── train_model.py          # Model training script
│   │   ├── symptom_columns.json    # Feature column ordering
│   │   ├── dataset.csv             # Preprocessed training data
│   │   └── model.pkl               # Trained model (generated)
│   ├── database/
│   │   ├── schema.sql              # Database schema
│   │   └── seed.sql                # Seed data (diseases, symptoms, rules)
│   └── utils/
│       ├── decorators.py           # Auth decorators
│       └── validators.py           # Input validators
├── frontend/
│   └── src/
│       ├── pages/                  # React page components
│       ├── components/             # Reusable UI components
│       ├── context/                # Auth context provider
│       └── api/                    # Axios API configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- MySQL 8.0+

### 1. Database Setup

```sql
-- Run in MySQL
source backend/database/schema.sql;
source backend/database/seed.sql;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Add: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, SECRET_KEY, JWT_SECRET

# Preprocess the Kaggle dataset (generates dataset.csv & symptom_columns.json)
python ml/preprocess_data.py

# Train the ML model (generates model.pkl)
python ml/train_model.py

# Start the server
python app.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000


## 🤖 ML Model Details

| Property | Value |
|----------|-------|
| **Algorithm** | Random Forest Classifier |
| **Trees** | 200 estimators |
| **Features** | 131 binary symptom columns |
| **Classes** | 41 diseases |
| **Training Data** | 4,920 samples (Kaggle Disease Symptom Dataset) |
| **Train/Test Split** | 80/20 stratified |

**Diseases Covered (41):** Acne, AIDS, Alcoholic Hepatitis, Allergy, Arthritis, Bronchial Asthma, Cervical Spondylosis, Chicken Pox, Chronic Cholestasis, Common Cold, Dengue, Diabetes, Drug Reaction, Fungal Infection, Gastroenteritis, GERD, Heart Attack, Hepatitis A, Hepatitis B, Hepatitis C, Hepatitis D, Hepatitis E, Hypertension, Hyperthyroidism, Hypoglycemia, Hypothyroidism, Impetigo, Jaundice, Malaria, Migraine, Osteoarthritis, Paralysis (Brain Hemorrhage), Peptic Ulcer Disease, Hemorrhoids (Piles), Pneumonia, Psoriasis, Tuberculosis, Typhoid, Urinary Tract Infection, Varicose Veins, Vertigo (BPPV)

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login & get JWT token | ❌ |
| GET | `/api/health` | Health check | ❌ |
| POST | `/api/predict` | Submit symptoms for prediction | ✅ |
| POST | `/api/chat` | Interactive chatbot prediction | ✅ |
| GET | `/api/history` | Get user's prediction history | ✅ |
| GET | `/api/history/<id>` | Get single prediction detail | ✅ |
| CRUD | `/api/admin/diseases` | Manage diseases | ✅ Admin |
| CRUD | `/api/admin/symptoms` | Manage symptoms | ✅ Admin |
| CRUD | `/api/admin/rules` | Manage red-flag rules | ✅ Admin |

---
