import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "nexusops.db")

def migrate():
    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(100)")
        print("Added google_id column.")
    except sqlite3.OperationalError as e:
        print(f"google_id column may already exist: {e}")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN google_access_token TEXT")
        print("Added google_access_token column.")
    except sqlite3.OperationalError as e:
        print(f"google_access_token column may already exist: {e}")

    # Add github_token to repositories
    try:
        cursor.execute("ALTER TABLE repositories ADD COLUMN github_token VARCHAR(255)")
        print("Added github_token column to repositories.")
    except sqlite3.OperationalError as e:
        print(f"github_token column may already exist: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
