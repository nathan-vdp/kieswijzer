<?php

$questions = json_decode(file_get_contents("./questions.json"), true);

$points = 0;

foreach ($questions as $question) {
    echo $question['vraag'] . PHP_EOL . PHP_EOL;
    echo "Toelichting: " . $question['informatie'] . PHP_EOL . PHP_EOL;
    foreach ($question['antwoorden'] as $answer) {
        echo $answer['tekst'] . PHP_EOL . PHP_EOL;
    }
    $answer = readline('Antwoord: ');

    if ($answer == 'ja') {
        $points += intval($question['antwoorden'][0]['waarde']);
    } else if ($answer == 'nee') {
        $points += intval($question['antwoorden'][1]['waarde']);
    }
    echo PHP_EOL . PHP_EOL;
}

echo 'Je hebt ' . $points . ' punten behaald.' . PHP_EOL;