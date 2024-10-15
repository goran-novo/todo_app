# NestJS Todo API

Todo API built with NestJS, TypeORM using Docker. Uses PostgreSQL for storage and Redis for scheduling tasks.

## Summary

Users can create and manage tasks. Main features:
- Create tasks with optional deadlines and reminders
- Update task status (e.g., pending, completed, archived)
- Automatically archive old tasks after 3 days (if pending)
- Send email reminders for upcoming tasks
- Add categories to tasks

Uses Redis to handle delayed tasks, such as sending reminders or archiving old tasks. When creating a task with a deadline and/or reminder, Redis receives a delayed task for those actions.

## How to Start

1. Copy the example settings file:
   ```
   cp .env.example .env
   ```
   Change the settings in `.env` if needed.

2. Build and start the app:
   ```
   docker-compose up --build
   ```

3. The API is available at `http://localhost:3000`.

## API Documentation

Swagger UI is available at `http://localhost:3000/api`

## Testing Emails

Uses Mailtrap for email testing. This captures emails the app would send, without sending them to real email addresses.

Setup:
1. Sign up at https://mailtrap.io/
2. Create a new inbox in Mailtrap
3. Update the Mailtrap credentials in the `.env` file

All emails from the app go to the Mailtrap inbox for review.

## Project Structure

```
src/
├── domain/
│   ├── dtos/
│   ├── events/
│   ├── mappers/
│   ├── models/
│   └── queues/
├── infra/
│   └── database/
│       ├── entities/
│       └── repositories/
├── modules/
└── ...
```

Uses a Data Access Layer (DAL) service with separate repositories for each entity.

## Commands

- `npm run start:dev`: Start the app for development
- `npm run build`: Prepare the app for use
- `npm run start:prod`: Start the app for real use
- `npm run test`: Run Jest tests
- `npm run migration:generate`: Set up database changes
- `npm run migration:run`: Apply database changes

## Parts of the App

### Main App
- Built using the Dockerfile
- Uses port 3000
- Requires the database and Redis

### Database
- Uses PostgreSQL 15
- Uses port 54320
- Sets up initial data using `init.sql`

### Redis
- Uses Redis 7
- Uses port 6379
- Manages scheduled tasks

## Testing

Uses Jest for testing. Run tests with:

```
npm run test
```

This executes all test suites and provides results.

## App Settings

The app uses various settings stored in the `.env` file, created by copying `.env.example`. Includes settings for the database, user logins, Redis, and email.