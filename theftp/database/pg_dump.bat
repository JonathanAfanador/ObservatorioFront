@echo off
:: Wrapper around pg_dump for Windows to avoid Spatie's file lock issue
set PGPASSFILE=
set PGPASSWORD=123456
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" %*
