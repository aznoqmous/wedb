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

  /*
  * First : 1 selector per level
  */
  public static function selectorToRegexp($selector)
  {
    $selector =  preg_replace('/  /s', ' ', $selector);
    $selectors = explode(' ', $selector);

    $reg = '';
    $arrReg = [];
    foreach($selectors as $key => $selector)
    {
      if($selector[0] == '#') {
        $selector = str_replace('#', '', $selector);
        $selector = "id=\"$selector\"";
      }
      if($selector[0] == '.') {
        $selector = str_replace('.', '', $selector);
        $selector = "class=\"$selector\"";
      }

      if($key >= count($selectors) - 1){
        $selector = "(.*?$selector.*?)>";
      }

      $arrReg[] = $selector;
    }

    $reg = implode('.*?>.*?<', $arrReg);
    $reg = "/$reg/s";
    return $reg;
  }

  public function selectTag($selector)
  {
    $reg = self::selectorToRegexp($selector);
    preg_match_all($reg, $this->html, $matches);
    $objTag = [];
    if(!$matches || !$matches[1] || !$matches[1][0]) return false;
    $tag = $matches[1][0];
    $parts = explode(' ', $tag);

    $objTag['tagname'] = $parts[0];

    preg_match_all("/ (.*?)=\"(.*?)\"/s", $tag, $attributes);
    foreach($attributes as $key => $attr)
    {
      $attrName = $attributes[1][$key];
      $attrValue = $attributes[2][$key];
      $objTag[$attrName] = $attrValue;
    }
    return $objTag;
  }

  public function selectTagAttribute($selector, $attribute)
  {
      $objTag = $this->selectTag($selector);
      if(!$objTag || !array_key_exists($attribute, $objTag)) return false;
      return $objTag[$attribute];
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
    $html = preg_replace('/  /s', ' ', $html);
    $html = preg_replace('/\r\n|\r|\n/s', ' ', $html);
    $html = preg_replace('/<\//s', "$splitTag$tag$afterTag", $html);
    $html = preg_replace('/\/>/s', "$splitTag$tag$afterTag", $html);
    $html = preg_replace('/</s', "$splitTag$tag$beforeTag", $html);
    $html = preg_replace('/>/s', "$splitTag", $html);
    $html = preg_replace('/  /s', ' ', $html);
    $html = trim($html);


    $arrTags = explode("$splitTag", $html);


    $arrTags = array_filter($arrTags, function($a){
      return strlen(str_replace(' ', '', $a));
    });

    $arrTags = array_map(function($a){
      return trim($a);
    }, $arrTags);

    $beforeTags = array_filter($arrTags, function ($a) use ($beforeTag) {
      return self::match($beforeTag, $a);
    });

    $contents = array_filter($arrTags, function ($a) use ($tag, $beforeTag) {
      return !self::match($tag, $a);
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

    $contents = array_values($contents);

    // AGGREGATE CONTENTS
    // $lastSelector = '';
    // $lastKey = 0;
    // foreach($selectors as $key => $selector){
    //   if(strlen($lastSelector) && self::match($selector, $lastSelector)) {
    //     $contents[$key] = $contents[$lastKey] . ' ' . $contents[$key];
    //   }
    //   if(strlen($lastSelector) && self::match($lastSelector, $selector)) {
    //     $contents[$key] .= ' ' . $contents[$lastKey];
    //   }
    //   $lastSelector = $selector;
    //   $lastKey = $key;
    // }

    return [
      'contents' => $contents,
      'selectors' => $selectors
    ];
  }

  public static function match($pattern, $string)
  {
    return (count(explode($pattern, $string)) > 1);
  }

  public static function replace($pattern, $replacement, $string)
  {
    return implode($replacement, explode($pattern, $string));
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

    $trailSelector = explode(' ', $selector);
    $trailSelector = $trailSelector[count($trailSelector)-1];

    $matches = array_filter($this->extract['selectors'], function($str) use ($selector, $specialChars){
      return self::match($selector, $str);
    });

    $matches = array_filter($matches, function($match) use ($trailSelector) {
      $trailMatch = explode('>', $match);
      $trailMatch = $trailMatch[count($trailMatch)-1];
      return self::match($trailSelector, $trailMatch);
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
