<?php

require '../vendor/autoload.php';

use Aznoqmous\Wedb\Req;
use Aznoqmous\Wedb\Selector;

if(!array_key_exists('url', $_POST)) return false;

$url = $_POST['url'];
$selectors = json_decode($_POST['selectors']);
$res = (new Req($url))->do();

// get rid of links and scripts prevent imgs from loading
$res = preg_replace("/<link.*?\/>/", '', $res);
$res = preg_replace("/<script.*?\/script>/", '', $res);
$res = preg_replace("/<style.*?\/style>/", '', $res);
$res = preg_replace("/src/", "data-src", $res);

// NEXT
// $s = new Selector($res);
// foreach ($selectors as $selector) {
//   $s->select($selector->selector);
// }

// $res = '';

echo json_encode($res);
