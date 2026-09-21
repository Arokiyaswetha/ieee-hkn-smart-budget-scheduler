# IEEE-HKN Smart Budget Scheduler

This project reorganizes the supplied single-file React application into an independent Vite + React project.

## Structure

```text
ieee-hkn-smart-budget-scheduler/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── data/
    │   └── initialData.js
    └── utils/
        └── dateUtils.js
```

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

### Notes

- The original application logic and UI are preserved.
- Seed/demo data is isolated in `src/data/initialData.js`.
- Date/currency helpers are isolated in `src/utils/dateUtils.js`.
- The main UI/state logic remains in `src/App.jsx`.
- This is still a frontend demo: the original code's authentication, RBAC, and PostgreSQL content are demo/client-side behavior unless a real backend is added.
