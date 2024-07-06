<?php
$cid=$_GET['cid'];
$ver=$_GET['ver'];

$url_1="czIuaW1saXpoaS5jb20vc2xpdmUvcGM=";
$url_2="ZW5vdy90aHVtYm5haWwvYXBpL3YxL2NvdXJzZXdhcmU=";
$url_3="Y291cnNld2FyZUlkPQ==";
$url_4="JnJlc29sdXRpb249OTYwXzY0MA==";
$url="https://" . base64_decode($url_1) . "/" . base64_decode($url_2) . "?" . base64_decode($url_3) . $cid . "&&version=" . $ver . base64_decode($url_4);

$lines_string=file_get_contents($url);

$html=preg_replace( "/\t|\n/", "", $lines_string);
echo "jsonpCallback('" . $html . "');";
?>