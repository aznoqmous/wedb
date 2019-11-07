<?php

namespace Aznoqmous\Wedb;

class Selector {

  public $html;

  public function __construct($html)
  {
    $this->html = $html;
  }

  public function select($selector=null)
  {
    var_dump($selector);
    $selector = str_replace('>', '', $selector);
    $selector = str_replace('#', '.', $selector);
    $selector = str_replace('  ', ' ', $selector);
    $selectors = explode(' ', $selector);
    $res = $this->html;
    $reg = false;
    foreach ($selectors as $s) {
      $s = trim($s);
      $s = explode('.', $s);
      $s0 = $s[0];
      $s = implode('|', $s);
      if($reg) $reg = "<$s0.*?($s).*?>.*?$reg.*?<\\/$s0>";
      else $reg = "<$s0.*?($s).*?>(.?*)<\\/$s0>";
      echo "<br>";
      var_dump($s0, $s, $reg);
    }
    $res = preg_match("/$reg/s", $res, $matches);
    $res = trim($matches[2]);
    echo $res;

  }

}
