const { Pool } = require("pg");

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

// Function to create the 'chats' table
async function createTable() {
  try {
    // Define SQL query to create the table
    const query = `
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        roomID VARCHAR(255) NOT NULL,
        sender VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Execute the query
    await pool.query(query);

    console.log("Table 'chats' created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

// // Call the function to create the table
createTable();

async function insert(roomID, sender, message) {
  const query =
    "INSERT INTO chats (roomID, sender, message) VALUES ($1, $2, $3)";
  const values = [roomID, sender, message];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error("Error inserting data into TrafficChats:", error);
    } else {
      console.log("Data inserted into TrafficChats successfully");
    }
  });
}

module.exports = { insert };
