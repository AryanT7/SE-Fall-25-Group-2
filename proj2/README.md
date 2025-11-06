# Calorie Connect (proj2)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![image](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![image](https://img.shields.io/badge/fastapi-109989?style=for-the-badge&logo=FASTAPI&logoColor=white)
![image](https://img.shields.io/badge/Sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![image](https://img.shields.io/badge/Github%20Actions-282a2e?style=for-the-badge&logo=githubactions&logoColor=367cfe)
![image](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue)
![image](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)


# CI / Status
#
[![Backend Tests](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/ci.yml)
[![FrontEnd Tests](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/uici.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/uici.yml)
[![Codecov](https://codecov.io/gh/AryanT7/SE-Fall-25-Group-2/branch/main/graph/badge.svg)](https://codecov.io/gh/AryanT7/SE-Fall-25-Group-2)
[![Style Checkers](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/style-checkers.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/style-checkers.yml)
[![Syntax Checkers](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/syntax-checkers.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/syntax-checkers.yml)
[![Formatters](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/formatters.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/formatters.yml)
[![Release Wheel](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/release_wheel.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/release_wheel.yml)


**Connecting Calories to Conscious Choices!**

A full‑stack project for cafe ordering, delivery, and calorie tracking that helps users monitor their nutritional balance and empowers restaurants with AI-driven insights.

## Overview

In today's fast-paced world, technology has made life more convenient but also more sedentary—causing many people to lose track of their nutritional balance. Calorie Connect helps users monitor and manage their daily calorie intake by automatically calculating personalized calorie goals based on their height, weight, age, and activity level. The system dynamically suggests meal options aligned with each user's remaining calorie balance, empowering them to make mindful dietary choices.

For restaurant owners, Calorie Connect also integrates AI-generated review summaries powered by Mistral AI, which condense customer feedback into clear insights displayed directly on the restaurant dashboard. By combining health tracking for users and intelligent feedback tools for owners, the app promotes healthier lifestyles while helping restaurants better understand and serve their customers.

## Key Features

### For Users
- **Personalized Calorie Tracking**: Automatically sets daily calorie goals based on height, weight, age, and activity level
- **Smart Food Recommendations**: Suggests meal options based on remaining calorie balance
- **Order Tracking**: Browse cafes, add items to cart, and track order status in real-time
- **Secure Authentication**: JWT-based login and signup system

### For Restaurant Owners
- **Menu Management**: Upload menus via OCR/AI scanning (PDFs or images)
- **AI Review Insights**: Mistral AI-powered summaries of customer feedback
- **Order & Revenue Analytics**: Track orders, revenue, and restaurant performance
- **Real-time Order Updates**: Accept, prepare, and manage orders efficiently

### For Delivery Drivers
- **Live Location Tracking**: Update location in real-time
- **Auto/Manual Order Assignment**: Receive orders automatically or manually
- **Delivery Status Updates**: Update order status throughout delivery process

### Advanced Features
- **AI Review Insights**: Powered by mistral AI it summarizes user feedback to help cafe owners quickly understand what diners love and where to improve. 
- **OCR Menu Scanning**: Automatically extracts and digitizes restaurant menu data from uploaded PDFs or images
- **GitHub Actions**: Automated build and pre-commit test workflows for code quality and CI

### What's next
- **Refund Processing**: Automatic refund initiation and status tracking for canceled orders
- **Live Wait Time Updates**: Monitor food preparation and delivery progress
- **Staff Management**: Add and manage staff accounts within the dashboard
- **Order Rerouting**: Automatic rerouting when orders are canceled

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, JWT auth, SQLite (default) or PostgreSQL
- **Frontend**: React + Vite + TypeScript
- **AI/ML**: Mistral AI (review summaries), OCR for menu scanning
- **Docs**: OpenAPI, MkDocs (backend/docs)
- **CI/CD**: GitHub Actions

## Quick Start

### 1) Backend
```bash
cd proj2/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/

Optional: Use PostgreSQL instead of SQLite. See `proj2/backend/DBSetup.md`.

### 2) Frontend
```bash
cd proj2/frontend
npm install
npm run dev
```
- App: http://localhost:5173

By default, the frontend expects the API at `http://localhost:8000`. Update `src/api/client.ts` if needed.

## Common workflows
- Driver assignment end‑to‑end test steps: `proj2/backend/DRIVER_ASSIGNMENT_TESTING.md`
- OCR menu ingestion: `proj2/backend/OCR_README.md`
- Mistral AI review summarizer: `proj2/backend/ReviewSummarizer.md`
- Seed sample data: run scripts in `proj2/backend` (e.g., `seed_via_api.py`, `seed_cafes.py`)

## Project structure
```
proj2/
  backend/           # FastAPI service and tests
  frontend/          # React app
```

## Environments
- Development (default): SQLite file `proj2/backend/app.db`
- `DATABASE_URL` (see `DBSetup.md`)

## Testing (backend)
```bash
cd proj2/backend
pytest -q
```

## Testing (Frontend)
```
cd proj2/frontend
npx vitest run
```

## Documentation
- Backend API docs (runtime): `http://localhost:8000/docs`
- Backend docs site: `proj2/backend/docs` (served via MkDocs)
- High‑level guides:
  - `proj2/backend/DBSetup.md`
  - `proj2/backend/DRIVER_ASSIGNMENT_TESTING.md`
  - `proj2/backend/OCR_README.md`
  - `proj2/backend/ReviewSummarizer.md`

## Who should use this software?
- Consumers who want to discover cafes, order food, and track daily/weekly calorie goals.
- Cafe owners and staff who manage menus, accept/prepare orders, and view simple analytics.
- Delivery drivers who report location/status and receive auto/manual order assignments.


## Citation

If you use this software in your research or project, please cite it as:
```bibtex
@software{cafe_calories_2025,
  author = {SACHI VYAS,
 ARYAN TAPKIRE, SUPRAJ
 GIJRE, IRALA
 NARASIMHAREDDY DILIP
 KUMAR},
  title = {Calorie Connect: Connecting Calories to Conscious Choices},
  year = {2025},
  url = {https://github.com/AryanT7/SE-Fall-25-Group-2/tree/main/proj2}
}
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Copyright

Copyright © 2025 Group 2: Sachi Vyas, Aryan Tapkire, Supraj Gijre, Irala Narasimhareddy Dilip Kumar. All rights reserved.

## Team

**Group 2**
- Sachi Vyas
- Aryan Tapkire
- Supraj Gijre
- Irala Narasimhareddy Dilip Kumar





