<?php

namespace Aznoqmous\Wedb;

class Params {
  public static function input($key=null)
  {
    if(!$key) return array_merge($_GET, $_POST);

    $input = false;
    $input = (array_key_exists($key, $_POST)) ? $_POST[$key] : false;
    if(!$input) $input = (array_key_exists($key, $_GET)) ? $_GET[$key] : false;
    return $input;
  }
}
