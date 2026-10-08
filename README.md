# GymPro Management

Gym management frontend built with React 18, TypeScript and Vite.

## Install and run

Requires Node.js 18+. Extract the ZIP into a fresh directory, then run:

```bash
npm install
npm run dev
```

For production build: `npm run build`.

## Storage and backup

Records are stored in this browser (localStorage); settings are separate. Use Backup & Restore to export JSON regularly. This is not a cloud multi-user database. Changing device/browser or clearing storage can lose data without an exported backup.

## Modules

Dashboard, Students, Memberships, Attendance, Trainers, Employees, Equipment, Finance, Suppliers, Reports, Backup, Settings.

## Troubleshooting blank page

Open DevTools (F12) and check Console for module errors. Run `npm install` in a clean folder and restart Vite. Do not use `npm audit fix --force`.
