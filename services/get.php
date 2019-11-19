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
  if(array_key_exists('attr', $objSelector)){
    // select attribute
    $results[] = [
      'selector' => $selector,
      'results' => $s->selectTagAttribute($selector, $objSelector->attr)
    ];
  }
  else {
    // select content
    $results[] = [
      'selector' => $selector,
      'results' => $s->select($selector)
    ];
  }
}


// dump($s->selectTagAttribute('#product_reference .editable', 'content'));
dump($s->select('.our_price_display #our_price_display'));
// dump($s->select('.editable'));

echo json_encode([
  'results' => $results,
  'links' =>  $s->extractLinks($html)
]);
?>
