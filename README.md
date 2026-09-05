# Dr.Fit — Fitness & Nutrition Platform

[![CI Pipeline](https://github.com/dr-fit/dr-fit-app/actions/workflows/ci.yml/badge.svg)](https://github.com/dr-fit/dr-fit-app/actions)
[![Go Version](https://img.shields.io/badge/Go-1.21%2B-00ADD8?logo=go)](https://golang.org)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-000000?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Dr.Fit is a full-stack mobile platform engineered to deliver healthy recipes, nutrition tracking, and meal discovery for active users. The repository contains a cross-platform mobile frontend built with React Native and Expo, coupled with a fast Go backend service powered by Fiber.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Repository Structure](#repository-structure)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [CI/CD Workflow](#cicd-workflow)
- [License](#license)

---

## Overview

Dr.Fit delivers high-performance recipe discovery and nutrition management. The service handles flexible JSON data structures (supporting both array and string ingredient representations), gracefully normalizes data for client viewports, and guarantees fast RESTful response times.

---

## Key Features

- **Real-Time Recipe Search**: Live text filtering across available recipes.
- **Detailed Recipe View**: Full ingredient breakdowns, prep time indicator, and high-resolution visuals with fallback badging.
- **Flexible Data Normalization**: Safe parsing for heterogeneous data schemas (array objects vs. comma-separated string ingredients).
- **Robust Error Handling & Resilience**: Pull-to-refresh capabilities, error states, and connection recovery handling.

---

## Architecture & Tech Stack

### Backend Service
- **Language**: Go (1.21+)
- **Framework**: [Fiber v2](https://gofiber.io/) (Express-inspired web framework for Go)
- **Data Persistence**: Local JSON store with Fiber REST routing
- **Testing**: Native Go `testing` package with Fiber HTTP test utilities

### Frontend Mobile Application
- **Framework**: React Native with [Expo SDK 54](https://expo.dev/)
- **Language**: TypeScript 5.9
- **Components**: Functional React components utilizing Hooks and Safe Area Context
- **API Client**: Standard `fetch` with strict TypeScript data normalization

---

## Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI pipeline (Build, Test, Typecheck)
├── backend/
│   ├── data/
│   │   └── recipes.json    # Recipe data store
│   ├── handlers/
│   │   ├── recipes.go      # REST HTTP handlers & JSON loading
│   │   └── recipes_test.go # Backend unit test suite
│   ├── models/
│   │   └── recipe.go       # Go structs for Recipe data
│   ├── main.go             # Application entry point & router
│   ├── go.mod
│   └── go.sum
└── frontend/
    ├── api/
    │   └── recipes.ts      # API client & data normalization logic
    ├── components/
    │   ├── RecipeBadge.tsx # Image/badge fallback component
    │   └── RecipeListModal.tsx # Main recipe feed & detail views
    ├── App.tsx             # React Native application root
    ├── index.ts            # Entry registration
    ├── package.json
    └── tsconfig.json
```

---

## API Documentation

### Endpoints

#### 1. List Recipes
- **Method**: `GET`
- **Path**: `/recipes`
- **Response**: `200 OK`
- **Content-Type**: `application/json`
- **Example Response**:
```json
[
  {
    "id": 1,
    "title": "Grilled Chicken Bowl",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    "prep_time": 25,
    "ingredients": [
      { "name": "Chicken breast", "weight": 200, "unit": "g" }
    ]
  }
]
```

#### 2. Get Recipe by ID
- **Method**: `GET`
- **Path**: `/recipes/:id`
- **Responses**:
  - `200 OK`: Recipe found
  - `400 Bad Request`: Invalid ID format
  - `404 Not Found`: Recipe ID does not exist

---

## Getting Started

### Prerequisites
- **Go**: `1.21` or higher
- **Node.js**: `18.x` or `20.x`
- **npm**: `9.x` or higher
- **Expo Go App** (optional, for physical device testing) or iOS/Android Simulator

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies & verify modules:
   ```bash
   go mod tidy
   ```
3. Run the Go server:
   ```bash
   go run main.go
   ```
   *The server will start listening on `http://localhost:8080`.*

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm start
   ```
4. Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code using Expo Go on a physical device.

---

## Testing & Quality Assurance

### Running Backend Unit Tests
Run the Go unit test suite covering handler logic and Fiber endpoints:
```bash
cd backend
go test -v ./...
```

### Running Frontend Typecheck
Validate TypeScript types across the frontend application:
```bash
cd frontend
npm run typecheck
```

---

## CI/CD Workflow

The project utilizes **GitHub Actions** for automated continuous integration on every `push` and `pull_request` targeting `main` or `master` branches:

- **Backend CI**: Sets up Go, resolves dependencies, compiles binary builds, and runs `go test`.
- **Frontend CI**: Sets up Node.js, installs cached npm modules, and runs `npm run typecheck`.

---

## License

This project is maintained for demonstration and portfolio presentation purposes.
