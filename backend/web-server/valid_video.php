<?
include 'cors.php';

ini_set('display_errors','On');
error_reporting('E_ALL');

function isAvailableVideo($videoId) {
    $headers = file_get_contents('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v='.$videoId.'&format=json');
    return $headers;
    if (substr($headers[0], 9, 3) !== '404'){
        return $videoId;
    } else {
        return false;
    }
}


var_dump(isAvailableVideo("4cKa735A9H4"));
?>