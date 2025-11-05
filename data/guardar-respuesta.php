<?php
// data/guardar-respuesta.php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'msg' => 'Método no permitido']);
  exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload) || !isset($payload['nombre']) || !isset($payload['prioridades'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'msg' => 'Faltan campos']);
  exit;
}

$file = __DIR__ . '/respuestas-global.json';
$current = [];

if (file_exists($file)) {
  $current = json_decode(file_get_contents($file), true);
  if (!is_array($current)) {
    $current = [];
  }
}

$payload['ts'] = date('c');
$current[] = $payload;

file_put_contents($file, json_encode($current, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['ok' => true]);
