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

