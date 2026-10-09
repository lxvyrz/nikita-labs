# Vault Finance 💸

A premium, local-first personal finance dashboard built with plain HTML, CSS and JavaScript.

## Run

Open `index.html` in Chrome, Edge, Firefox or Safari. No build tools, accounts, network requests or backend are required. Keep `index.html`, `style.css` and `script.js` in the same folder.

## Features

- Dashboard: available balance, lifetime income/expenses, current-month net savings and savings rate
- Six-month income/expense bars and current-month category spending doughnut
- Add, edit, delete, search, filter and sort transactions
- Weekly/monthly recurring entries with deterministic occurrence keys to avoid duplicates
- Savings goals, contributions and withdrawals, with goal money excluded from available balance
- Category budgets and overspending warnings
- Custom income/expense categories with icons and colours
- CSV import/export of transactions
- Dark/light themes, example data and reset controls
- Responsive desktop and mobile layout
- All amounts stored as integer pennies

## Important notes

All data is stored in **this browser only** using localStorage. Clearing site data, using another browser or opening the app at a different origin can make the data unavailable. **Export your transactions regularly.** CSV export covers transactions, not goals, budgets, categories, or recurring schedules, so it is not a full backup of all settings.

No banking integration, cloud sync, payments, authentication or financial advice. This is a personal tracking tool.

Recurring transactions are generated when you open the app, not in the background. Each schedule catches up to 120 occurrences per launch. Changing the calendar day at month-end can shift monthly recurrence dates (e.g. January 31 to February 28 and then March 28).

Monthly savings is calculated as this month's income minus expenses. Contributions to savings goals are internal allocations, not expenses. Available balance can be negative if you record spending exceeding income.

Demo records are explicitly labelled in the interface when present, and can be cleared from Settings.

## CSV format

`date,type,description,category,amount_gbp`

Example:

`2026-10-09,expense,Groceries,Food,24.50`

Use **Export CSV** to get a correctly formatted template. Import adds transactions and can create duplicates if you reimport the same file.

## Project files

- `index.html`: UI structure
- `style.css`: responsive design and themes
- `script.js`: calculations, state, interactions, charts, CSV and local persistence

## Install on iPhone (PWA)

1. In GitHub, open **Settings → Pages** for this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then save. GitHub Pages publishes the repository root.
3. After deployment, open **https://lxvyrz.github.io/nikita-labs/personal-money-tracker/** in **Safari on your iPhone**.
4. Tap **Share → Add to Home Screen**, choose **Open as Web App** if shown, then tap **Add**.
5. Launch **Vault** from your Home Screen. Open it online once so the service worker can cache files for offline use.

GitHub Pages may take several minutes to deploy. The repository must be eligible for GitHub Pages on your plan.

**Privacy and backup:** GitHub Pages serves only the app's code; it does not publish your transactions. Your data is kept in localStorage on that iPhone/browser, not synced with your PC. iOS may clear website data in some circumstances, so export CSV backups. CSV export includes transactions only, not goals, budgets or recurring settings.

**Offline:** The app shell is cached after the first successful online load. If the device has never loaded the published app online, offline mode will not work. App updates require a subsequent online visit.
