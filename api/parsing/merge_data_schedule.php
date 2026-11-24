<?php

function generateTable(array $bridges_data): string
{
    $html = '<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">';
    $html .= '<thead style="background-color: #f2f2f2;">';
    $html .= '<tr>';
    $html .= '<th>Название</th>';
    $html .= '<th>Первый интервал</th>';
    $html .= '<th>Второй интервал</th>';
    $html .= '</tr>';
    $html .= '</thead>';
    $html .= '<tbody>';

    foreach ($bridges_data['bridges'] as $bridge) {
        $title = $bridge['title']['ru'] ?? 'N/A';
        $firstInterval = '';
        $secondInterval = '';

        if (isset($bridge['time']) && is_array($bridge['time'])) {
            if (isset($bridge['time'][0]['start']) && isset($bridge['time'][0]['end'])) {
                $firstInterval = $bridge['time'][0]['start'] . ' - ' . $bridge['time'][0]['end'];
            }
            if (isset($bridge['time'][1]['start']) && isset($bridge['time'][1]['end'])) {
                $secondInterval = $bridge['time'][1]['start'] . ' - ' . $bridge['time'][1]['end'];
            }
        }

        $html .= '<tr>';
        $html .= '<td>' . htmlspecialchars($title) . '</td>';
        $html .= '<td>' . htmlspecialchars($firstInterval) . '</td>';
        $html .= '<td>' . htmlspecialchars($secondInterval) . '</td>';
        $html .= '</tr>';
    }

    $html .= '</tbody>';
    $html .= '</table>';

    return $html;
}

function mergeFiles(): void
{
    $bridges_data     = json_decode(file_get_contents(__DIR__ . '/../data/bridges-data.json'), true);
    $bridges_schedule = json_decode(file_get_contents(__DIR__ . '/../data/bridges-schedule.json'), true);

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

    $result = file_put_contents(__DIR__ . '/../data/bridges-result.json', $json_string);

    header('Content-Type: application/json; charset=utf-8');

    if ($result === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Не удалось записать файл bridges-result.json'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(200);
        header('Content-Type: text/html; charset=utf-8');
        echo generateTable($bridges_data);
    }
}
