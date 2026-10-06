# Dynamic Visual Assistant

A lecture companion for planning sessions and displaying backend-supplied context-aware visuals while keeping the lecturer in control.

## Run & Operate

- `pnpm --filter @workspace/visual-assistant run dev` — run the web app through its managed workflow
- `pnpm --filter @workspace/visual-assistant run typecheck` — check the frontend TypeScript
- `pnpm --filter @workspace/visual-assistant run build` — build the frontend
- From `artifacts/visual-assistant`, `npm install`, `npm run dev`, and `npm run build` are also supported.
- Optional frontend configuration: `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` (see `artifacts/visual-assistant/.env.example`)

## Stack

- pnpm workspace, Node.js 24, React, TypeScript, Vite, React Router, plain CSS
- Session outlines persist in the current browser; there is no session CRUD or AI/realtime backend connected yet.
- The frontend has typed REST and WebSocket adapters. Live state, transcript, confidence, visuals, and summary metrics must come from the configured service.

## Where things live

- `artifacts/visual-assistant/src/pages/` — routes and page-level flows
- `artifacts/visual-assistant/src/hooks/useRealtimeSession.ts` — single live-session state hook
- `artifacts/visual-assistant/src/services/` — browser session storage, REST adapter, and WebSocket transport
- `artifacts/visual-assistant/src/types.ts` — frontend data and event contracts
- `artifacts/visual-assistant/src/index.css` — plain CSS theme and responsive layouts

## Architecture decisions

- Browser storage is limited to session outlines; it never simulates AI context or completed live analytics.
- Realtime state is backend-owned; manual commands are not shown as applied until confirmed by a service event.

## Product

- Create and edit lecture outlines, review topic sequences, and open a live presentation cockpit.
- The live view preserves backend-confirmed state across reconnects and makes disconnected status explicit.

## User preferences

The interface must not claim AI, microphone, transcript, visual, confidence, or analytics behavior that the configured backend has not supplied.

## Gotchas

- The API server currently exposes health only. Do not imply session or speech routes are already available.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
