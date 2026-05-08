<?php

function mergeFiles(): void
{
    $bridges_data     = json_decode(file_get_contents(__DIR__ . '/../jsons/bridges-data.json'), true);
    $bridges_schedule = json_decode(file_get_contents(__DIR__ . '/../jsons/bridges-schedule.json'), true);

    foreach ($bridges_data['bridges'] as &$bridge_data) {
        $bridge_data_title = $bridge_data['title']['ru'];
        $flag_found        = false;

        foreach ($bridges_schedule['bridges'] as $bridge_schedule) {
            $bridge_schedule_title = mb_convert_case($bridge_schedule['title'], MB_CASE_TITLE, 'UTF-8');

            if ($bridge_data_title === $bridge_schedule_title) {
                $flag_found          = true;
                $bridge_data['time'] = $bridge_schedule['time'];
                $bridge_data['timestamp'] = $bridge_schedule['timestamp'];
            }
        }

        if (!$flag_found) {
            $bridge_data['time'] = [['start' => 0]];
            $bridge_data['timestamp'] = [['start' => 0]];
        }
    }
    unset($bridge_data);

    $bridges_data['parse_time'] = $bridges_schedule['parse_time'];

    $json_string = json_encode($bridges_data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    file_put_contents(__DIR__ . '/../jsons/bridges-result.json', $json_string);
}
