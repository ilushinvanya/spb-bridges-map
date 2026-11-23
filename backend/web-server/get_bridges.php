<?php
include 'cors.php';

ini_set('display_errors', '1');
error_reporting(E_ALL);

$isfile = file_get_contents("bridges.json");
echo $isfile;

?>