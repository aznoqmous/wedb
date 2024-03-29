<?php

require '../vendor/autoload.php';

use Aznoqmous\Wedb\Req;
use Aznoqmous\Wedb\Selector;
use Aznoqmous\Wedb\Params;

$url = Params::input('url');
$selectors = Params::input('selectors');

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
      'results' => $s->selectAll($selector)
    ];
  }
}

// dump($s->selectTagAttribute('#product_reference .editable', 'content'));
// dump($s->selectAll('#our_price_display'));
// dump($s->selectAll("#short_description_content p"));
// dump($s->selectAll("#product_condition .editable"));
// dump($s->selectAll(".page-product-box > .rte > p"));
// dump($s->selectAll(".navigation_page span title"));
// dump($s->extract);

echo json_encode([
  'results' => $results,
  'links' =>  $s->extractLinks($html)
]);

?>
