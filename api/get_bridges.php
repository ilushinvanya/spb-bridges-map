<?php
include 'cors.php';

ini_set('display_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

$file_path = __DIR__ . '/data/bridges-result.json';

if (!file_exists($file_path)) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Файл bridges-result.json не найден'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$content = file_get_contents($file_path);

if ($content === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Не удалось прочитать файл bridges-result.json'
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo $content;
}

?>