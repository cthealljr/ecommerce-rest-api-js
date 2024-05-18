# E-commerce REST API

An E-commerce REST API utilizing JavaScript, Express, Node.js, and PostgreSQL.

This project is part of my portfolio for completing the Codecademy Full-Stack Engineer Career Path.

## Running the app

To run locally, `npm install`, then `npm run start`.

This project requires a [PostgreSQL](https://www.postgresql.org/) database to be running locally.  Reference the ERD diagram located in the `docs` folder of this repo to view the structure of the tables. You can use [pgAdmin](https://www.pgadmin.org/) to interact with the database manually. 

This repo includes an `example.env` file that contains important environment variables for reference.  
Make sure to create a `.env` file and include all variables found in the `example.env` file, replacing the example values with those specific to your environment/needs.  
Uses [dotenvx](https://dotenvx.com/) to load the `.env` file.

To easily populate your database with the requisite tables, `npm run create-db`. This will create tables in your database if they do not already exist. The configuration for this script can be found in the `setupDatabase.js` file located in the `db` directory.

Once the app is running locally, you can access the API at `http://localhost:<your-port>`.

Currently the application only contains a single route for `/` stating that the API Server is not yet implemented.

## Testing

To run unit tests use `npm run test`, excludes database tests.

To run integration tests use `npm run test-integration`, includes database tests.

To test just the database code use `npm run test-db`.

### Integration and Database Tests

Integration and database tests make use of [testcontainers-node](https://node.testcontainers.org/) to create an isolated PostgreSQL instance using [docker](https://www.docker.com/).

## Code Style

JavaScript code in this project follows the [JavaScript Standard Style](https://standardjs.com/).

## License

Unless otherwise stated, files in this project are licensed under the Apache License Version 2.0.
