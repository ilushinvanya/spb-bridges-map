<?php

require_once __DIR__ . '/parse_to_schedule.php';
require_once __DIR__ . '/merge_data_schedule.php';
// require_once __DIR__ . '/compare_remote_data.php';
// require_once __DIR__ . '/upload_file.php';
// require_once __DIR__ . '/bot.php';
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// function init(string $ftppass): void
function init(): void
{
    try {
        // Парсим сайт
        $parse_message_text = parseSite();

        // Мержим два файла
        mergeFiles();

        // Сравниваем файл с сайта и новые данные
        // $compare_message_text = compareFile();

        // Загружаем новый файл
        // uploadFile('bridges-result.json', $ftppass);

        // Отправляем сообщение в Telegram если есть изменения
        // if (mb_strpos($message_text, 'Нет изменений') === false) {
        // sendMsg($message_text, false);
        // }
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if (PHP_SAPI === 'cli') {
    init();
} else {
    // Вызов через веб-сервер (GET-запрос)
    init();
}
