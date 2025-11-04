<?php
// serve_upload.php — secure file serving for uploads stored outside webroot
// Requires ADMIN_TOKEN env var to validate signed URLs

$adminToken = getenv('ADMIN_TOKEN') ?: null;
$allowedOriginsEnv = getenv('ALLOWED_ORIGINS') ?: '*';
$allowedOrigins = array_map('trim', explode(',', $allowedOriginsEnv));
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array('*', $allowedOrigins)) {
    header("Access-Control-Allow-Origin: *");
} elseif ($origin && in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!$adminToken) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Server missing ADMIN_TOKEN. Set ADMIN_TOKEN env var to enable secure file serving."]);
    exit;
}

$file = $_GET['file'] ?? null;
$token = $_GET['token'] ?? null;
$expires = isset($_GET['expires']) ? intval($_GET['expires']) : 0;

if (!$file || !$token || !$expires) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Missing file, token or expires parameters"]);
    exit;
}

// Validate filename (no path traversal)
$basename = basename($file);
if ($basename !== $file) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Invalid file name"]);
    exit;
}

// Validate expiry
if (time() > $expires) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(["error" => "URL has expired"]);
    exit;
}

// Validate token
$expected = hash_hmac('sha256', $file . '|' . $expires, $adminToken);
if (!hash_equals($expected, $token)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

$storageDir = __DIR__ . '/storage/uploads';
$path = $storageDir . '/' . $basename;
if (!is_file($path)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(["error" => "File not found"]);
    exit;
}

// Determine MIME type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $path);
finfo_close($finfo);
$allowedMimes = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml'];
if (!in_array($mime, $allowedMimes)) {
    // Disallow serving unexpected types
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Serving this file type is not allowed"]);
    exit;
}

// Send file
header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($path));
header('Cache-Control: public, max-age=31536000, immutable');
header('X-Content-Type-Options: nosniff');
// Inline display for images
header('Content-Disposition: inline; filename="' . $basename . '"');

// Read file to output
$fp = fopen($path, 'rb');
if ($fp === false) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Failed to open file"]);
    exit;
}

while (!feof($fp)) {
    echo fread($fp, 8192);
    flush();
}
fclose($fp);
exit;
?>
