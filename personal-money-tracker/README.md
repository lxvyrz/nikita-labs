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
