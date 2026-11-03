# Gym Training Management System (Frontend)

A React + TypeScript frontend for a personal trainer / gym management system. It shows two list pages, **Customers** and **Trainings**, with sorting, searching and formatted dates. Data comes from the Personal Trainer REST API.

This project was made as a course assignment (Front End development, Haaga-Helia University of Applied Sciences).

## Assignment requirements

- [x] List pages for customers and trainings
- [x] Navigation between the two list pages
- [x] Sorting on both list pages
- [x] Searching / filtering on both list pages
- [x] Training list shows the customer name
- [x] Training date formatted as `dd.mm.yyyy hh:mm`

## Features

### Navigation
A navigation bar at the top links the **Customers** and **Trainings** pages (React Router). The active page is highlighted, and `/` redirects to the customer list.

### Customers page
- Table with first name, last name, address, postcode, city, email and phone
- **Sorting:** click a column header (sort arrows are always visible) or use the "Sort by" dropdown
- **Searching:** one search box that filters across all columns
- Per-column filters and pagination (10 rows per page)

### Trainings page
- Table with date, duration, activity and customer
- **Customer name** (first name + last name) is shown on every training row
- **Date formatting** with Day.js, for example `18.04.2024 18:59`
- Sorting works on the real date value, so dates sort chronologically and not alphabetically
- Search matches the displayed date format, activity, duration and customer name
- "Sort by" dropdown and header-click sorting stay in sync

## Tech stack

| Purpose | Library |
| --- | --- |
| Framework | React 19 with TypeScript |
| Build tool | Vite |
| Tables, sorting, filtering | AG Grid Community (`ag-grid-react`) |
| Date formatting | Day.js |
| Routing / navigation | React Router |

## REST API

Base URL: `https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api`

| Endpoint | Used for |
| --- | --- |
| `GET /customers` | Customer list |
| `GET /gettrainings` | Trainings with their customer information |

API documentation: https://juhahinkula.github.io/personaltrainerdocs/

The `/customers` endpoint wraps its list in `_embedded.customers`, while `/gettrainings` returns a plain array. A small helper (`extractList` in `src/utils.ts`) handles both formats.

## Project structure

```
src/
├── components/
│   ├── CustomerList.tsx   # Customers page
│   ├── TrainingList.tsx   # Trainings page
│   └── SortSelect.tsx     # Reusable "Sort by" dropdown
├── App.tsx                # Navigation and routes
├── main.tsx               # App entry point
├── types.ts               # TypeScript types and API URL
└── utils.ts               # extractList helper
```

## Getting started

Requirements: Node.js 18 or newer.

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/gym-frontend.git
cd gym-frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

### Other scripts

```bash
npm run build     # production build
npm run preview   # preview the production build
```

## How it works

- **Data fetching:** each page loads its data once with `fetch` inside `useEffect` and stores it in state. Errors are shown on the page.
- **Sorting:** AG Grid's built-in sorting is enabled for all columns, and `unSortIcon` keeps the sort arrows visible. The dropdown uses `applyColumnState` to sort the grid, and `onSortChanged` updates the dropdown when a header is clicked.
- **Searching:** the search box value is passed to AG Grid's `quickFilterText`, which filters rows across all columns.
- **Date formatting:** `valueFormatter` displays the date with Day.js (`DD.MM.YYYY HH:mm`) while the grid keeps the original ISO value for correct sorting.
- **Customer name:** a `valueGetter` combines the customer's first and last name into one column.

## Screenshots

> Add your screenshots to a `screenshots/` folder and update the file names below.

**Customers page**

![Customers page](screenshots/customers.png)

**Customers page: sorting and search**

![Customers sorted and searched](screenshots/customers-sorted.png)

**Trainings page**

![Trainings page](screenshots/trainings.png)

**Trainings page: sorting and search**

![Trainings sorted and searched](screenshots/trainings-sorted.png)

## Author

Dipen Rajbanshi, Business Information Technology, Haaga-Helia University of Applied Sciences
