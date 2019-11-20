<?php

require '../vendor/autoload.php';

use Aznoqmous\Wedb\Saver;
use Aznoqmous\Wedb\Params;

$saver = new Saver('../public/save.json');

$data = Params::input();

$saver->setUniqueField('reference');
$saver->save($data);

echo $saver->csv();
