# ProcessHub: Real-Time Process Monitoring Dashboard

ProcessHub is a full-stack DevOps dashboard for monitoring live process activity, system pressure, and alerts in real time. It combines a React + Tailwind frontend with an Express + Socket.io backend, backed by OS-level telemetry gathered through Node.js and `systeminformation`.

## Features

- Live dashboard cards for overall CPU, memory, process count, and uptime
- Realtime CPU line chart and memory usage visualization
- Searchable, filterable, sortable process table
- Process termination workflow with confirmation modal
- Threshold alerts for CPU and memory pressure
- Notifications panel and downloadable logs export
- Basic authentication with JWT
- Light and dark mode with accent customization
- Responsive glassmorphism UI with Framer Motion transitions

## Project Structure

```text
.
├── backend
│   ├── .env.example
│   ├── package.json
│   └── src
├── frontend
│   ├── .env.example
│   ├── package.json
│   └── src
└── package.json
```


## Setup

1. Install dependencies from the project root:

```bash
npm install
```

2. Copy the example environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start both backend and frontend together with Python:

```bash
python3 run_dashboard.py
```

## Default Login

- Username: `admin`
- Password: `admin123`

You can change these in [backend/.env.example](/Users/tsb/Desktop/CSE316 Project/backend/.env.example) after copying it to `backend/.env`.

## Runtime Endpoints

- Frontend dev server: `http://<your-local-ip>:5173`
- Backend API: `http://<your-local-ip>:5001`

The app is configured to bind to `0.0.0.0`, so you can also access it from another device on your local network.

## Run From Python, Not localhost

Use this command in the terminal:

```bash
python3 run_dashboard.py
```

The Python launcher prints your network URL automatically. Open the `http://<your-local-ip>:5173` address it shows instead of `localhost`.

## Environment Variables

### Backend

- `PORT`: API port, default `5001`
- `HOST`: bind host, default `0.0.0.0`
- `CLIENT_ORIGIN`: comma-separated allowed frontend origins
- `JWT_SECRET`: JWT signing secret
- `AUTH_USERNAME`: login username
- `AUTH_PASSWORD`: login password
- `POLL_INTERVAL`: realtime metrics interval in milliseconds
- `MAX_PROCESSES`: number of processes returned to the client
- `ALERT_CPU_THRESHOLD`: CPU warning threshold
- `ALERT_MEMORY_THRESHOLD`: memory warning threshold

### Frontend

- `VITE_APP_TITLE`: app title shown in the UI
- `VITE_API_URL`: optional backend API base URL
- `VITE_SOCKET_URL`: optional backend Socket.io base URL

## Notes

- Process termination permissions depend on your OS user privileges.
- Exported logs include alert history, operator actions, and the latest system summary.
- For remote device access, make sure the device can reach your computer on the same network.
