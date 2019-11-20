<?php

require '../vendor/autoload.php';

use Aznoqmous\Wedb\Saver;

$saver = new Saver('../public/save.json');

$file = fopen('php://memory', 'w');
$filename = time() . ".csv";
header('Content-Encoding: UTF-8');
header('Content-Type: application/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $filename . '";');
echo $saver->csv();
echo "\xEF\xBB\xBF";
fpassthru($file);
