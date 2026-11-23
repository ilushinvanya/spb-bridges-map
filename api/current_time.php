<?php
include 'cors.php';

ini_set('display_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

$response = file_get_contents("https://yandex.com/time/sync.json?geo=2");

if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Не удалось получить данные времени'
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo $response;
}

?>