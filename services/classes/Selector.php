<?php

namespace Aznoqmous\Wedb;

class Selector {

  public $html;
  public $content;
  public $selectors;

  public function __construct($html)
  {
    $this->html = self::clean($html);
    $this->extract = self::extract($this->html);
  }

  public static function clean($html)
  {
    $html = preg_replace("/<\!DOCTYPE.*?>/s", '', $html);
    $html = preg_replace("/<link.*?>/s", '', $html);
    $html = preg_replace("/<meta.*?>/s", '', $html);
    $html = preg_replace("/<script.*?\/script>/s", '', $html);
    $html = preg_replace("/<style.*?style>/s", '', $html);
    $html = preg_replace("/src\=/s", "data-src=", $html);
    $html = implode("\n", array_filter(explode("\n", $html), function($el){
      return (strlen($el));
    }));
    return $html;
  }

  /**
   *  Returns [ contents, selectors ]
   */
  public static function extract($html)
  {
    $beforeTag = "#BEGINTAG# : ";
    $afterTag = "#ENDTAG# : ";
    $tag = "#HTMLTAG# : ";
    $splitTag = "#SPLITTAG# : ";
    $html = preg_replace('/<!--.*?-->/s', '', $html);
    $html = preg_replace('/  /', ' ', $html);
    $html = preg_replace('/\r\n|\r|\n/', ' ', $html);
    $html = preg_replace('/<\//', "$splitTag$tag$afterTag", $html);
    $html = preg_replace('/\/>/', "$splitTag$tag$afterTag", $html);
    $html = preg_replace('/</', "$splitTag$tag$beforeTag", $html);
    $html = preg_replace('/>/', "$splitTag", $html);
    $html = preg_replace('/  /', ' ', $html);
    $html = trim($html);


    $arrTags = explode("$splitTag", $html);


    $arrTags = array_filter($arrTags, function($a){
      return strlen(str_replace(' ', '', $a));
    });

    $arrTags = array_map(function($a){
      return trim($a);
    }, $arrTags);

    $beforeTags = array_filter($arrTags, function ($a) use ($beforeTag) {
      return (count(explode($beforeTag, $a)) > 1);
    });

    $contents = array_filter($arrTags, function ($a) use ($tag) {
      return (count(explode($tag, $a)) <= 1);
    });

    $selectors = [];
    foreach($arrTags as $key => $strTag){

      if(!self::match($tag, $strTag)) {

        $selector = [];

        foreach($arrTags as $k => $el){

          if(self::match($beforeTag, $el)){
            $selector[] = $el;
          }
          if(self::match($afterTag, $el)){
            array_pop($selector);
          }

          if($key == $k){
            $selector = implode(" > ", $selector);
            $selector = str_replace($tag, '', $selector);
            $selector = str_replace($beforeTag, '', $selector);
            $selector = str_replace($afterTag, '', $selector);

            $matches = [];
            preg_match_all("/class=\"(.*?)\"/", $selector, $matches);
            if(count($matches)){
              foreach($matches[0] as $i => $match){
                  $replace = $matches[1][$i];
                  $replace = implode('.', explode(' ', ' '.$replace));
                  $selector = str_replace($match, $replace, $selector);
                  $selector = str_replace(' .', '.', $selector);
              }
            }
            preg_match_all("/id=\"(.*?)\"/", $selector, $matches);
            if(count($matches)){
              foreach($matches[0] as $i => $match){
                  $replace = $matches[1][$i];
                  $replace = implode('#', explode(' ', ' '.$replace));
                  $selector = str_replace($match, $replace, $selector);
                  $selector = str_replace(' #', '#', $selector);
              }
            }
            $selectors[] = $selector;
            break;
          }
        }
      }
    }

    return [
      'contents' => array_values($contents),
      'selectors' => $selectors
    ];
  }

  public static function match($pattern, $string)
  {
    return (count(explode($pattern, $string)) > 1);
  }

  public function extractLinks($html)
  {
    $matches = [];
    $html = str_replace("'", '"', $html);
    preg_match_all("/<a.*?href\=\"(.*?)\"/s", $html, $matches);
    $links = $matches[1];
    $links = array_filter($links, function($link){
      return ( (strlen($link)) && $link[0] != '#' );
    });
    return $links;
  }

  public function select($selector)
  {
    $specialChars = ['#', '.', '>'];
    $selector = str_replace(' ', '.*?', $selector);
    $matches = array_filter($this->extract['selectors'], function($str) use ($selector, $specialChars){
      return ( preg_match("/$selector/", $str, $matches) );
    });
    $results = [];
    foreach($matches as $key => $match){
      $results[] = [
        'selector' => $match,
        'content' => $this->extract['contents'][$key]
      ];
    }
    return $results;
  }

}
