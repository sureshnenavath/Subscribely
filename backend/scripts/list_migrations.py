import sqlite3
conn = sqlite3.connect(r'D:\VS Code\Subscribely-Bolt\backend\db.sqlite3')
cur = conn.cursor()
try:
    cur.execute("SELECT id, app, name FROM django_migrations ORDER BY id")
    rows = cur.fetchall()
    for r in rows:
        print(r)
except Exception as e:
    print('ERROR', e)
finally:
    conn.close()
