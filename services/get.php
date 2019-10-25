<?php

if(!array_key_exists('url', $_POST)) return false;

$url = $_POST['url'];
$curl = curl_init($url);

curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE);

$res = curl_exec($curl);

// get rid of link and scripts
$res = preg_replace("/<link.*?\/>/", '', $res);
$res = preg_replace("/<script.*?\/script>/", '', $res);
$res = preg_replace("/src/", "data-src", $res);

if($res) echo json_encode($res);
else echo json_encode(false);
