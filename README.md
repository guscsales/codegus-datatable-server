# DataTable Consuming From Server

This project is a simple example of how to consume a DataTable from a server in a large dataset with more than 1 million transaction records.

The datatable contains filters by search (with debounce) and type, pagination and sorting.

The project is built with Next.js, Shadcn/UI, Tanstack Table, and SWR. The backend is built with Node.js, Express, Prisma and Docker.

This project was created to teach people from my YouTube channel [Codegus](https://codeg.us/yt?utm_source=github) on how to render a DataTable consuming the data from an API.

## Before Continue

**PS: Make sure to have Docker installed and running.**

**PPS: To run the final implementation, please use the branch `rehearsal`**

## Example Running

<img src="https://raw.githubusercontent.com/guscsales/codegus-datatable-server/refs/heads/main/public/readme/example-running-1.gif" alt="Example Running" width="1000" />

## Getting Started

### Step 1

Install all dependencies:

```bash
pnpm install
```

### Step 2

Create the Postgres database to be running in Docker:

```bash
docker compose up -d
```

### Step 3

Seed the database with some data:

**Note: by default the seed-db script will create 1000000 transactions, and 50000 users. You can update these parameters directly in the `seed-db.ts` file updating the variables `TRANSACTIONS_COUNT` and `USERS_COUNT`.**

**The process to seed the database may take a while.**

Create a `.env` file in the root of the project with the following content:

```bash
DATABASE_URL="postgresql://codegus_dt:12345678@localhost:5432/codegus_dt?schema=public"
```

Run the seed script:

```bash
pnpm seed-db
```

You'll see the following output:

<img src="https://raw.githubusercontent.com/guscsales/codegus-datatable-server/refs/heads/main/public/readme/seed-db.png" alt="Seed DB" width="500" />

### Step 4

Run the API that consumes the database:

```bash
pnpm run-server
```

The fetch endpoint is running in [http://localhost:7543/api/transactions](http://localhost:7543/api/transactions).

### Step 5

In another terminal, run the Next.js application:

```bash
pnpm dev
```

Open the browser and go to [http://localhost:3000](http://localhost:3000) to see the result.
