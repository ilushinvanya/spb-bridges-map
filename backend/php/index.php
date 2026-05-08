<?php

require_once __DIR__ . '/parse_to_schedule.php';
require_once __DIR__ . '/merge_data_schedule.php';
require_once __DIR__ . '/compare_remote_data.php';
require_once __DIR__ . '/upload_file.php';
require_once __DIR__ . '/bot.php';

function init(string $ftppass): void
{
    $message_text = '';

    // Парсим сайт
    $parse_message_text = parseSite();
    $message_text .= $parse_message_text . "\n\n";

    // Мержим два файла
    mergeFiles();

    // Сравниваем файл с сайта и новые данные
    $compare_message_text = compareFile();
    $message_text .= $compare_message_text . "\n";

    // Загружаем новый файл
    uploadFile('bridges-result.json', $ftppass);

    // Отправляем сообщение в Telegram если есть изменения
    if (mb_strpos($message_text, 'Нет изменений') === false) {
//         sendMsg($message_text, false);
    }
}

if (PHP_SAPI === 'cli' && isset($argv[1])) {
    init($argv[1]);
}
