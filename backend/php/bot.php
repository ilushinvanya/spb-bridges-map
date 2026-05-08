<?php

$BOT_TOKEN = '1700778229:AAFDsbotytRaQgFOHG3OibIupu7S6N4JZJM';
$CHAT_ID = 199175320;

function sendMsg(string $text, bool $disable_notification): void
{
    global $BOT_TOKEN, $CHAT_ID;

    $url = "https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage";

    $data = [
        'chat_id'              => $CHAT_ID,
        'text'                 => $text,
        'disable_notification' => $disable_notification,
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    // curl_exec($ch);

    $html = curl_exec($ch);
    // curl_close($ch);

    if ($html === false) {
        echo 'Ошибка cURL: ' . curl_error($ch) . "\n";
        echo 'Код ошибки: ' . curl_errno($ch) . "\n";
    }
    // curl_close($ch);
}
