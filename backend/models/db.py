import mysql.connector
from mysql.connector import pooling
from config import Config

_pool = None


def _get_pool():
    """Lazily create a connection pool."""
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="medassist_pool",
            pool_size=5,
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASS,
            database=Config.DB_NAME,
        )
    return _pool


def get_connection():
    """Return a connection from the pool."""
    return _get_pool().get_connection()


def execute_query(query, params=None, fetchone=False, fetchall=False, commit=False):
    """
    Convenience helper for running a single SQL statement.

    Returns:
        - For SELECT (fetchone/fetchall): the row(s) as dict(s)
        - For INSERT with commit: lastrowid
        - For UPDATE/DELETE with commit: rowcount
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        if fetchone:
            return cursor.fetchone()
        if fetchall:
            return cursor.fetchall()
        if commit:
            conn.commit()
            return cursor.lastrowid if cursor.lastrowid else cursor.rowcount
    finally:
        cursor.close()
        conn.close()
