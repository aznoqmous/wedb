<?php

namespace Aznoqmous\Wedb;

class Req {

  public $url;

  public function __construct($url)
  {
    $this->url = $url;
  }

  public function do()
  {
    $curl = curl_init($this->url);

    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE);

    $res = curl_exec($curl);

    if($res) return $res;
    else return false;
  }

}
