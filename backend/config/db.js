const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../food_delivery.db");

const sqlite = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
    runMigrations();
  }
});

// Auto-migration: adds new columns if they don't exist
function runMigrations() {
  // Add admin_code to restaurants
  sqlite.run(`ALTER TABLE restaurants ADD COLUMN admin_code TEXT`, (err) => {
    if (!err) {
      console.log("  ✅ Added admin_code column to restaurants");
      // Seed admin codes for existing restaurants
      sqlite.all("SELECT id FROM restaurants", [], (e, rows) => {
        if (rows) {
          rows.forEach(r => {
            const code = `ZESTY-R${r.id}-ADMIN`;
            sqlite.run("UPDATE restaurants SET admin_code = ? WHERE id = ?", [code, r.id]);
          });
          console.log("  ✅ Seeded admin codes for", rows.length, "restaurants");
        }
      });
    }
  });

  // Add owner_email to restaurants
  sqlite.run(`ALTER TABLE restaurants ADD COLUMN owner_email TEXT`, () => {});

  // Add restaurant_id to users
  sqlite.run(`ALTER TABLE users ADD COLUMN restaurant_id INTEGER`, () => {});
}

// MySQL compatibility wrapper
sqlite.query = function (sql, params, callback) {
  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  if (sql.trim().toUpperCase().startsWith("SELECT")) {
    sqlite.all(sql, params, callback);
  } else {
    sqlite.run(sql, params, function (err) {
      callback(err, { insertId: this.lastID, affectedRows: this.changes });
    });
  }
};

module.exports = sqlite;
