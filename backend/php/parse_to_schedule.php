<?php

date_default_timezone_set('Europe/Moscow');

function timeToTomorrowTimestamp(string $time): int
{
    [$h, $m] = explode(':', $time);
    $h = (int)$h;
    $m = (int)$m;
    // День и вечер время (>= 10:00) — сегодня; утро (< 10:00) — завтра
    $day = $h >= 10 ? strtotime('today') : strtotime('tomorrow');
    return mktime($h, $m, 0, date('n', $day), date('j', $day), date('Y', $day));
}

function parseSite(): string
{
    $message_text = '🔅 Сообщение с сайта mostotrest-spb' . "\n";

    $url = 'https://mostotrest-spb.ru/razvodka-mostov';

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);


    $html = curl_exec($ch);

    if ($html === false) {
        echo 'Ошибка cURL: ' . curl_error($ch) . "\n";
        echo 'Код ошибки: ' . curl_errno($ch) . "\n";
    }

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);

    $bridges_array = [];

    // Находим все div.bridge
    $bridge_divs = $xpath->query("//div[contains(concat(' ', normalize-space(@class), ' '), ' bridge ')]");

    foreach ($bridge_divs as $bridge_div) {
        // Название моста
        $name_nodes = $xpath->query(".//div[contains(concat(' ', normalize-space(@class), ' '), ' name ')]", $bridge_div);
        $name_bridge = $name_nodes->length > 0 ? trim($name_nodes->item(0)->textContent) : '';

        // Блок с временем
        $line_wrapper_nodes = $xpath->query(".//div[contains(concat(' ', normalize-space(@class), ' '), ' line_wrapper ')]", $bridge_div);
        $time_bridge = $line_wrapper_nodes->length > 0 ? $line_wrapper_nodes->item(0)->textContent : '';

        // Разбиваем по \n, сортируем, фильтруем пустые
        $time_array = explode("\n", $time_bridge);
        $time_filtered = array_values(array_filter($time_array, fn($v) => trim($v) !== ''));
        $time_trims = array_map(fn($t) => trim($t), $time_filtered);
        sort($time_trims);

        $time_filtered_timestamps = array_map(fn($t) => timeToTomorrowTimestamp($t), $time_trims);


        $bridge_object = [
            'title' => $name_bridge,
            'time'  => [],
            'timestamp'  => [],
        ];

        if (count($time_filtered) >= 2) {
            $bridge_object['time'][] = [
                'start' => $time_trims[0],
                'end'   => $time_trims[1],
            ];
            $bridge_object['timestamp'][] = [
                'start' => $time_filtered_timestamps[0],
                'end'   => $time_filtered_timestamps[1],
            ];
        }

        if (count($time_filtered) >= 4) {
            $bridge_object['time'][] = [
                'start' => $time_trims[2],
                'end'   => $time_trims[3],
            ];
            $bridge_object['timestamp'][] = [
                'start' => $time_filtered_timestamps[2],
                'end'   => $time_filtered_timestamps[3],
            ];
        }

        $bridges_array[] = $bridge_object;
    }

    // Кантемировский, Гренадерский, Сампсониевский
    $msg_line_nodes = $xpath->query("//div[contains(concat(' ', normalize-space(@class), ' '), ' msg_line ')]");
    $message_move_string = $msg_line_nodes->length > 0 ? $msg_line_nodes->item(0)->textContent : '';

    $message_text .= trim($message_move_string, "\n");

    if ($message_move_string) {
        if (mb_strpos($message_move_string, 'Гренадер') !== false) {
            $bridges_array[] = [
                'title' => 'Гренадерский',
                'time'  => [['start' => '1:30', 'end' => '4:30']],
                'timestamp'  => [['start' => timeToTomorrowTimestamp('1:30'), 'end' => timeToTomorrowTimestamp('4:30')]],
            ];
        }
        if (mb_strpos($message_move_string, 'Сампсон') !== false) {
            $bridges_array[] = [
                'title' => 'Сампсониевский',
                'time'  => [['start' => '1:30', 'end' => '4:30']],
                'timestamp'  => [['start' => timeToTomorrowTimestamp('1:30'), 'end' => timeToTomorrowTimestamp('4:30')]],
            ];
        }
        if (mb_strpos($message_move_string, 'Кантемир') !== false) {
            $bridges_array[] = [
                'title' => 'Кантемировский',
                'time'  => [['start' => '1:30', 'end' => '4:30']],
                'timestamp'  => [['start' => timeToTomorrowTimestamp('1:30'), 'end' => timeToTomorrowTimestamp('4:30')]],
            ];
        }
    }

    $bridges_object = [
        'bridges'    => $bridges_array,
        'parse_time' => date('Y-m-d H:i:s'),
    ];

    $json_string = json_encode($bridges_object, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    file_put_contents(__DIR__ . '/../jsons/bridges-schedule.json', $json_string);

    return $message_text;
}
