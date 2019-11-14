<?php

require '../vendor/autoload.php';

use Aznoqmous\Wedb\Req;
use Aznoqmous\Wedb\Selector;

function input($key){
  $input = false;
  $input = (array_key_exists($key, $_POST)) ? $_POST[$key] : false;
  if(!$input) $input = (array_key_exists($key, $_GET)) ? $_GET[$key] : false;
  return $input;
}


$url = input('url');
$selectors = input('selectors');

$html = (new Req($url))->do();

// NEXT
$s = new Selector($html);

$results = [];
foreach(json_decode($selectors) as $objSelector){
  $selector = $objSelector->selector;
  $results[] = [
    'selector' => $selector,
    'results' => $s->select($selector)
  ];
}
dump($s->extractLinks($html));
// dump($results);
// echo json_encode($results);
// dump($selector->select("#our_price_display"));
// dump($selector->select("#center_column .page-product-box .rte"));
?>
