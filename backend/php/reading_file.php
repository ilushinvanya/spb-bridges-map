<?php

function readingFile(string $nameFile): string
{
    $parsed = json_decode(file_get_contents(__DIR__ . '../jsons/' . $nameFile), true);

    $message_text = '🔅 Чтение нового файла ' . "\n";

    foreach ($parsed['bridges'] as $bridge) {
        $message_text .= $bridge['title']['ru'] . "\n";

        foreach ($bridge['time'] as $bridge_time) {
            if (!empty($bridge_time['start'])) {
                $message_text .= $bridge_time['start'] . ' - ' . $bridge_time['end'] . "\n";
            } else {
                $message_text .= "Не разводится\n";
            }
        }

        $message_text .= "\n";
    }

    return $message_text;
}

if (PHP_SAPI === 'cli' && isset($argv[1])) {
    echo readingFile($argv[1]);
}
