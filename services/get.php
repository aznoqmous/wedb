<?php

if(!array_key_exists('url', $_POST)) return false;

$url = $_POST['url'];
$curl = curl_init($url);

curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE);

$res = curl_exec($curl);

if($res) echo json_encode($res);
else echo json_encode(false);
