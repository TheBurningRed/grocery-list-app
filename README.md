# Grocery List App

Goji Labs test task: Angular grocery list application built in an Nx monorepo. The app uses a mock REST API powered by `json-server` and includes reusable libraries for shared interfaces and API access.

## Prerequisites

- Node.js
- npm


## Setup

1. Install dependencies

`npm install`

2. Run the app

`npm start`

App is accessible at `http://localhost:4200`

## Unit tests

`npm test`

## Lint

`npm run lint`

# Key features
- Working grocery list with CRUD operations connected to json-server
- Shipped within nx monorepo with reusable interfaces and api-client libraries
- Includes Eslint and Prettier configuration
- Facade service for managing the grocery list, ready to be migrated to NgRx if necessary.
- Error/loading states handling
- Optimistic updates for changing items quantity with rollback
