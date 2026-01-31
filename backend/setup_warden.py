#!/usr/bin/env python3
import subprocess
import json

# Generate bcrypt hash using Python
password = "123456"

# Use the bcrypt command via npm package
import os
os.chdir(r"C:\Users\ADITYA\OneDrive\Desktop\HostelHub-main\backend")

# Run the hash generation
result = subprocess.run(
    ['node', '-e', f"const bcrypt = require('bcrypt'); bcrypt.hash('{password}', 10).then(h => console.log(h))"],
    capture_output=True,
    text=True
)

hash_value = result.stdout.strip()
print(f"Generated hash: {hash_value}")

# Now insert into database
insert_cmd = [
    'mysql',
    '-h', 'localhost',
    '-u', 'root',
    f'-p1234',
    'hostelhub_db',
    '-e',
    f"INSERT INTO user (name, email, password, role) VALUES ('Warden', 'warden@hostel.com', '{hash_value}', 'WARDEN');"
]

result = subprocess.run(insert_cmd, capture_output=True, text=True)
print(f"Insert result: {result.returncode}")
if result.stderr:
    print(f"Error: {result.stderr}")

# Verify
verify_cmd = [
    'mysql',
    '-h', 'localhost',
    '-u', 'root',
    f'-p1234',
    'hostelhub_db',
    '-e',
    "SELECT email, password FROM user WHERE email='warden@hostel.com';"
]
result = subprocess.run(verify_cmd, capture_output=True, text=True)
print(f"Verification:\n{result.stdout}")
