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
    $html = self::cleanSingleTags($html);
    $html = preg_replace("/<script.*?\/script>/s", '', $html);
    $html = preg_replace("/<style.*?style>/s", '', $html);
    $html = preg_replace("/src\=/s", "data-src=", $html);
    $html = implode("\n", array_filter(explode("\n", $html), function($el){
      return (strlen($el));
    }));
    return $html;
  }

  public static function cleanSingleTags($html)
  {
    $singleTags = [
      'link',
      'meta',
      'br',
      'hr',
      'base',
      'input'
    ];
    foreach ($singleTags as $tag) {
      $html = preg_replace("/<$tag.*?>/s", '', $html);
    }
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
            // replace ids by #
            preg_match_all("/class=\"(.*?)\"/", $selector, $matches);
            if(count($matches)){
              foreach($matches[0] as $i => $match){
                  $replace = $matches[1][$i];
                  $replace = implode('.', explode(' ', ' '.$replace));
                  $selector = str_replace($match, $replace, $selector);
                  $selector = str_replace(' .', '.', $selector);
              }
            }

            // replace classes by .
            preg_match_all("/id=\"(.*?)\"/", $selector, $matches);
            if(count($matches)){
              foreach($matches[0] as $i => $match){
                  $replace = $matches[1][$i];
                  $replace = implode('#', explode(' ', ' '.$replace));
                  $selector = str_replace($match, $replace, $selector);
                  $selector = str_replace(' #', '#', $selector);
              }
            }

            // rewrite attributes to [key="value"]
            $selector = preg_replace('/ ([A-z]*?=\".*?\")/s', "[$1]",$selector);

            $selectors[] = $selector;
            break;
          }
        }
      }
    }

    $contents = array_values($contents);

    return [
      'contents' => $contents,
      'selectors' => $selectors
    ];
  }

  public static function reg_match($pattern, $string)
  {
    preg_match_all("/$pattern/s", $string, $matches);
    return (count($matches[0]));
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

  public function selectAll($selector)
  {

    $specialChars = ['#', '.', '>'];

    $trailSelector = explode(' ', $selector);
    $trailSelector = $trailSelector[count($trailSelector)-1];

    $selector = str_replace('"', '\"', $selector);
    $selector = str_replace('[', '\[', $selector);
    $selector = str_replace(']', '\]', $selector);

    $selector = str_replace('  ', ' ', $selector);
    $selector = str_replace('*', '', $selector);
    $selector = str_replace(' >', '>', $selector);
    $selector = str_replace('> ', '>', $selector);
    $selector = str_replace(' ', '.*?', $selector);
    $selector = str_replace('>', '[^ ]*? > [^ ]*?', $selector);

    $matches = array_filter($this->extract['selectors'], function($str) use ($selector){
      return self::reg_match($selector, $str);
    });

    if($trailSelector != '*') $matches = array_filter($matches, function($match) use ($trailSelector) {
      $trailMatch = explode('>', $match);
      $trailMatch = $trailMatch[count($trailMatch)-1];
      return self::match($trailSelector, $trailMatch);
    });

    $results = [];
    foreach($matches as $key => $match){
      $results[] = $this->extract['contents'][$key];
    }
    return $results;
  }

  public function select($selector)
  {
    $res = $this->selectAll($selector);
    if(!count($res)) return false;
    return $res[0];
  }

  /**
  ** SELECT TAG HEAD
  **/
  public static function selectorToRegexp($selector)
  {
    /*
    * First : 1 selector per level
    */
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
        $selector = "<(.*?$selector.*?)>";
      }

      $arrReg[] = $selector;
    }

    $reg = implode('.*?', $arrReg);
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

}
