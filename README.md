# 🗳️ PollStream - Real-Time Polling Platform

PollStream is a real-time, microservices-based polling application designed for scalability, responsiveness, and fault-tolerance. It allows users to vote on active polls and see updates instantly as others vote — all without needing to refresh the page.

![PollStream Demo](./assets/pollstream-output.png)
*Figure: Real-time poll updates in action*

---

## 🧩 Microservices Architecture

PollStream is architected around **microservices**, each with a clearly defined responsibility:

### 1. 🧠 Poll Service
- Manages creation and listing of polls.
- Stores poll metadata and vote counts in PostgreSQL.
- Runs a **Celery worker** that periodically disables expired polls (`is_active = False`).
- Listens to messages from **RabbitMQ** to update vote tallies in the DB.

### 2. ✅ Vote Service
- Accepts and verifies votes from users.
- Pushes valid votes as tasks to **Celery**, decoupling request handling from heavy processing.
- Sends vote events to **RabbitMQ** to inform Poll Service about new votes.

### 3. 🔌 WebSocket Service
- Uses **Django Channels** to maintain persistent WebSocket connections with clients.
- Subscribes to **Redis pub/sub** channels for new vote events.
- Notifies all connected clients in real time when someone votes on a poll.

---

## 📡 Real-Time Flow

Here’s a simplified version of how real-time updates happen:

1. A user votes → Vote Service verifies and queues the task via **Celery**.
2. Celery worker updates Vote DB and publishes vote event to **RabbitMQ**.
3. Poll Service (subscriber) receives message and updates poll vote counts in PostgreSQL.
4. After DB update, Poll Service publishes the event to **Redis pub/sub**.
5. WebSocket Service receives it and **broadcasts** the latest poll data to all connected users.

---

![PollStream Architecture Diagram](./assets/pollstream_-_arch.png)
*Figure: PollStream Microservices Architecture*

---

## ⚙️ Technologies Used

| Component          | Technology                |
|-------------------|---------------------------|
| Backend Framework | Django, Django REST       |
| Realtime Layer    | Django Channels + Redis   |
| Queue/Async Tasks | Celery + RabbitMQ         |
| Databases         | PostgreSQL                |
| Pub/Sub           | Redis Channels            |
| Containerization  | Docker + Docker Compose   |
| Frontend          | React.js     |

---

## 🚀 Features

- 🛠️ Microservices architecture with independent scaling
- 📊 Real-time vote updates via WebSocket
- ⏱️ Auto-disabling of expired polls via Celery tasks
- 📤 Vote processing via background workers
- ⚡ Instant client updates through Redis pub/sub and Channels
- 🧪 Production-ready Docker setup for all services

---

## 🧪 Services Overview

### Poll Service
- **Endpoints**: `GET /polls/`, `POST /polls/`
- **Celery Task**: Auto-disable expired polls
- **RabbitMQ Listener**: Update vote counts from vote service
- **Redis Publisher**: Publishes vote updates to WebSocket service

### Vote Service
- **Endpoints**: `POST /votes/`
- **Celery Task**: Validate and process vote
- **RabbitMQ Publisher**: Notifies Poll Service of new vote

### WebSocket Service
- **Endpoint**: `ws://.../ws/polls/{poll_id}/`
- **Redis Subscriber**: Listens to poll updates
- **Real-Time Updates**: Broadcasts to all users in a room

---

## 🧵 Message Queue Flow

```mermaid
sequenceDiagram
    participant User
    participant VoteService
    participant CeleryWorker
    participant RabbitMQ
    participant PollService
    participant Redis
    participant WebSocketService

    User->>VoteService: Submit Vote
    VoteService->>CeleryWorker: Queue vote task
    CeleryWorker->>RabbitMQ: Publish vote message
    RabbitMQ->>PollService: Deliver vote message
    PollService->>PollService: Update DB
    PollService->>Redis: Publish vote update
    Redis->>WebSocketService: Deliver update
    WebSocketService->>User: Notify clients via WebSocket

