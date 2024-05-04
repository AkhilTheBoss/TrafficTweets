const { Pool } = require("pg");

// Configure the PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TrafficDB",
  password: "xyz",
  port: 5432,
});

// Create a new database
async function createDatabase() {
  const client = await pool.connect();

  try {
    await client.query("CREATE DATABASE TrafficDB");
    console.log("Database created successfully!");
  } catch (error) {
    console.error("Error creating database:", error);
  } finally {
    client.release();
  }
}

// // Call the function to create the database
// createDatabase();

// Function to create a new table
async function createTable() {
  const client = await pool.connect();

  try {
    // Define your SQL query to create a table
    const query = `
        CREATE TABLE TrafficDb (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100),
          Response1 VARCHAR(255),
          Response2 VARCHAR(255),
          UUID VARCHAR(255) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

    // Execute the query
    await client.query(query);

    console.log("Table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    client.release();
  }
}

// createTable();

async function insertData(waitingTime, reason) {
  const client = await pool.connect();
  try {
    // Begin a transaction
    await client.query("BEGIN");

    // Define the SQL query with placeholders
    const query =
      "INSERT INTO TrafficDb (username, Response1, Response2, UUID) VALUES ($1, $2, $3, $4)";

    // Define the values to be inserted
    const values = ["Anonymous", waitingTime, reason, "23d5114_d"];

    // Execute the query with the values array
    await client.query(query, values);

    // Commit the transaction
    await client.query("COMMIT");

    console.log("Data inserted successfully.");
  } catch (error) {
    // If an error occurs, rollback the transaction
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

// Call the function to insert data
// insertData();

module.exports = { insertData };
