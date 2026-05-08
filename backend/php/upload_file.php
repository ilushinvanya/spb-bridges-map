<?php

function uploadFile(string $nameFile, string $ftppass): void
{
    $FTP_HOST = '77.222.62.237';
    $FTP_USER = 'ilushinvan_bridges';

    $ftp = ftp_connect($FTP_HOST);
    ftp_login($ftp, $FTP_USER, $ftppass);
    ftp_pasv($ftp, true);
    ftp_chdir($ftp, 'public_html/server_bridges');

    $local_file = __DIR__ . '/../jsons/' . $nameFile;
    ftp_put($ftp, 'result_bridges.json', $local_file, FTP_BINARY);

    ftp_close($ftp);
}

if (PHP_SAPI === 'cli' && isset($argv[1], $argv[2])) {
    uploadFile($argv[1], $argv[2]);
}
