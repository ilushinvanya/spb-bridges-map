<?
include 'cors.php';

ini_set('display_errors','On');
error_reporting('E_ALL');

$isfile = file_get_contents("https://yandex.com/time/sync.json?geo=2");
echo $isfile;



?>