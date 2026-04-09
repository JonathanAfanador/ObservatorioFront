<?php
$u = 'c:\\Users\\jonathan.DESKTOP-VV9J5N6';
$f1 = $u . '\\AppData\\Local\\Temp\\Rar$DIa7412.11625.rartemp\\postgresql-backend_sm.sql';
$f2 = $u . '\\Downloads\\dump-backend_sm-202604091736.sql';
echo "ZIP File Size: " . filesize($f1) . " bytes\n";
echo "DBeaver File Size: " . filesize($f2) . " bytes\n";
