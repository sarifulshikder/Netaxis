import time
import socket

def check_postgres():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('postgres', 5432))
        print("Postgres is reachable")
    except Exception as e:
        print(f"Postgres not reachable: {e}")

check_postgres()
