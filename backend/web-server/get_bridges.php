<?
include 'cors.php';

ini_set('display_errors','On');
error_reporting('E_ALL');

$isfile = file_get_contents("result_bridges.json");
echo $isfile;

?>