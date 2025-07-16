#!/bin/bash
cd /app

# First, ensure the database exists
echo "Checking if database exists..."
python3 -c "
import psycopg2
import os
import sys

db_name = os.getenv('POSTGRES_DB', 'dlm-photo-gallery-v2')
db_user = os.getenv('POSTGRES_USER', 'postgres')
db_password = os.getenv('POSTGRES_PASSWORD', 'password')
db_host = os.getenv('POSTGRES_HOST', 'db')

try:
    # Connect to PostgreSQL server (not to specific database)
    conn = psycopg2.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        database='postgres'  # Connect to default postgres database
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f\"SELECT 1 FROM pg_database WHERE datname = '{db_name}'\")
    exists = cursor.fetchone()
    
    if not exists:
        print(f'Creating database {db_name}...')
        cursor.execute(f'CREATE DATABASE \"{db_name}\"')
        print(f'Database {db_name} created successfully!')
    else:
        print(f'Database {db_name} already exists.')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error checking/creating database: {e}')
    sys.exit(1)
"

# Force create tables using SQLAlchemy (more reliable for templates)
echo "Creating database tables..."
python3 -c "
import sys
import os
sys.path.append('/app')

# Import models to register them with Base
from app.models.user import User
from app.models.project import Project  
from app.models.user_session import UserSession
from app.db.base_class import Base
from app.db.session import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print('Creating all tables...')
try:
    # Force table creation
    Base.metadata.create_all(bind=engine)
    print('✅ Tables created successfully!')
    
    # Verify tables exist
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f'📋 Tables in database: {tables}')
    
except Exception as e:
    print(f'❌ Error creating tables: {e}')
    raise
"

# Also try alembic for future migrations
echo "Setting up alembic for future migrations..."
if [ -d "alembic" ] && [ -f "alembic/env.py" ]; then
    echo "Marking current state in alembic..."
    alembic stamp head 2>/dev/null || echo "Alembic stamp failed, but tables should be created"
fi

echo "Migration complete!"