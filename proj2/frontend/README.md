<!--
Copyright (c) 2025 Group 2
All rights reserved.

This project and its source code are the property of Group 2:
- Aryan Tapkire
- Dilip Irala Narasimhareddy
- Sachi Vyas
- Supraj Gijre
-->
# CI / Status
#
# [![Backend Tests](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/ci.yml)
# [![FrontEnd Tests](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/uici.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/uici.yml)
# [![Style Checkers](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/style-checkers.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/style-checkers.yml)
# [![Syntax Checkers](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/syntax-checkers.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/syntax-checkers.yml)
# [![Formatters](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/formatters.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/formatters.yml)
# [![Release Wheel](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/release_wheel.yml/badge.svg?branch=main)](https://github.com/AryanT7/SE-Fall-25-Group-2/actions/workflows/release_wheel.yml)

  # Cafes and Calorie Tracker App

  A React + Vite + TypeScript frontend for the Cafe Calories platform.

  ## Who is this for?
  - Consumers placing cafe orders and tracking calorie goals
  - Cafe owners/staff managing menus and orders
  - Drivers viewing/acting on assignments

  ## Prerequisites
  - Node 18+
  - npm

  ## Running the code
  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  App URL: http://localhost:5173

  ## API base URL
  The frontend talks to the backend at `http://localhost:8000` by default.
  To change this, update `src/api/client.ts` (or set your preferred base URL in the same file).

  ## Available scripts
  - `npm run dev`: Start dev server
  - `npm run build`: Production build
  - `npm run preview`: Preview built app
  - `npm run test`: Run unit tests

  ## Notes
  - Make sure the backend is running (see `proj2/backend/README.md`).
  - If CORS or ports differ, update the API base URL as noted above.
  