<?php

function parseTimeBridge(array $times): string
{
    $result = '';
    foreach ($times as $bridge_time) {
        if (!empty($bridge_time['start'])) {
            $result .= $bridge_time['start'] . ' - ' . $bridge_time['end'] . "\n";
        } else {
            $result .= "Не разводится\n";
        }
    }
    return $result;
}

function compareFile(): string
{
    $ch = curl_init('http://map-bridges-spb.ru/server/get_bridges.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response      = curl_exec($ch);
    // curl_close($ch);
    $remote_bridges = json_decode($response, true);

    $local_bridges = json_decode(file_get_contents(__DIR__ . '/../jsons/bridges-result.json'), true);

    $flag_has_change = false;
    $message_text    = '🔅 Новые изменения: ' . "\n";

    foreach ($remote_bridges['bridges'] as $remote_bridge) {
        $remote_bridge_title = $remote_bridge['title']['en'];
        $remote_bridge_times = $remote_bridge['time'];

        foreach ($local_bridges['bridges'] as $local_bridge) {
            $local_bridge_title = $local_bridge['title']['en'];
            $local_bridge_times = $local_bridge['time'];

            if ($remote_bridge_title === $local_bridge_title) {
                $string_remote = json_encode($remote_bridge_times, JSON_UNESCAPED_UNICODE);
                $string_local  = json_encode($local_bridge_times, JSON_UNESCAPED_UNICODE);

                if ($string_remote !== $string_local) {
                    $message_text   .= '✂ ' . $remote_bridge['title']['ru'] . "\n";
                    $message_text   .= 'Было  : ' . parseTimeBridge($remote_bridge_times);
                    $message_text   .= 'Стало : ' . parseTimeBridge($local_bridge_times);
                    $message_text   .= "\n";
                    $flag_has_change = true;
                } else {
                    $message_text .= $remote_bridge['title']['ru'] . "\n";
                    $message_text .= parseTimeBridge($remote_bridge_times);
                    $message_text .= "\n";
                }
            }
        }
    }

    if ($flag_has_change) {
        return $message_text;
    }

    return '🔅 Нет изменений';
}
