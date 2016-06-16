<?php
$text = $_REQUEST['t'];
// 按字母全部反转
$text = strrev($text);
// 按单词再反转回来
$len = strlen($text);

for ($i = 1, $start = 0, $end; $i <= $len; $i++) {
	if ($i === $len || $text[$i] === ' ') {
		// swap
		$end = $i - 1;
		while ($end > $start) {
			$tmp = $text[$start];
			$text[$start] = $text[$end];
			$text[$end] = $tmp;
			$start++;
			$end--;
		}
		$start = $i + 1;
	}
}
echo $text;