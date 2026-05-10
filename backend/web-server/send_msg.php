<?
function cors() {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        exit(0);
    }
}

cors();
ini_set('display_errors','On');
error_reporting('E_ALL');

$contact = $_POST['contact'];
$text = $_POST['text'];

$contact = htmlspecialchars($contact);
$text = htmlspecialchars($text);

$contact = urldecode($contact);
$text = urldecode($text);

$contact = trim($contact);
$text = trim($text);

if (!isset($_REQUEST)) {
    return;
}
$file = 'people.txt';
$current = file_get_contents($file);

$data = json_encode($_POST, JSON_UNESCAPED_UNICODE);
$current .= "\n" . $data;
$zapis = file_put_contents($file, $current);

echo "Сообщение успешно отправлено";

$to = 'ilushinvanya@gmail.com';
$subject = 'Письмо с сайта bridges-map';
$message = "Контакт: $contact\nСообщение: $text";

$sendmail = popen('/usr/sbin/sendmail -t', 'w');
fwrite($sendmail, "To: $to\r\n");
fwrite($sendmail, "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n");
fwrite($sendmail, "Content-Type: text/plain; charset=UTF-8\r\n");
fwrite($sendmail, "\r\n");
fwrite($sendmail, $message);
pclose($sendmail);

?>