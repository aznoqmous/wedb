<?php

namespace Aznoqmous\Wedb;

/**
  * Poorman DB
  * Load / save json entities from and to a json file
  */
class Saver {

  public $filepath = '';
  public $file = null;
  public $uniqueFields = [];
  public $separator = ';';

  public function __construct($filepath)
  {
    $this->filepath = $filepath;
    $this->file = $this->open($filepath);
    $this->content = $this->load();
  }

  public function open($filepath)
  {
    $parts = explode('/', $filepath);
    $filename = $parts[count($parts)-1];
    $path = str_replace($filename, '', $filepath);
    $path = preg_replace('/\/$/', '', $path);

    if(!is_dir($path)) mkdir($path);

    return fopen($this->filepath, 'rw');
  }

  public function load()
  {
    $content = fgets($this->file);
    return json_decode($content);
  }

  public function save($data)
  {
    if(count($this->uniqueFields)) $this->content[] = $data;
    else {
      $match = array_filter($this->content, function($entity) use ($data){
        foreach($this->uniqueFields as $uniqueField){
          if($entity[$uniqueField] == $data[$uniqueField]) return true;
        }
        return false;
      });
      if(count($match)) return false;
      $this->content[] = $data;
    }
    file_put_contents($this->filepath, json_encode($this->content));
  }

  public function drop()
  {
    unlink($this->filepath);
  }

  public function setUniqueField($field)
  {
    $this->uniqueFields[] = $field;
  }

  public function findBy($key, $value)
  {
    $results = [];
    foreach($this->content as $entity){
      if($entity[$key] == $value) $results[] = $entity;
    }
    return $results;
  }

  public function csv()
  {
    $columns = [];
    $csv = '';

    // get columns
    foreach($this->content as $entity){
      foreach($entity as $key => $value) {
        if(!in_array($key, $columns)) $columns[] = $key;
      }
    }

    // put cols
    foreach($columns as $col){
      $csv .= "$col;";
    }

    // put entities
    foreach($this->content as $key => $entity){
      $entity = (object) $entity;
      $csv .= PHP_EOL;
      foreach($columns as $col){
        if(array_key_exists($col, $entity)) {
          $value = $entity->{$col};
          $csv .= "\"$value\"{$this->separator}";
        }
        else $csv .= "{$this->separator}";
      }
    }
    return $csv;
  }
}
