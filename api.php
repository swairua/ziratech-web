<?php
// Secure API entry point
// Load configuration from environment where possible
$servername = getenv('DB_HOST') ?: 'localhost';
$username   = getenv('DB_USER') ?: getenv('DB_USERNAME') ?: 'mazaoplu_ziraweb';
$password   = getenv('DB_PASS') ?: getenv('DB_PASSWORD') ?: 'Sirgeorge.12';
$dbname     = getenv('DB_NAME') ?: 'mazaoplu_ziraweb';
$adminToken = getenv('ADMIN_TOKEN') ?: null;
$allowedOriginsEnv = getenv('ALLOWED_ORIGINS') ?: '*';
$baseUrl = getenv('BASE_URL') ?: null;

$allowedOrigins = array_map('trim', explode(',', $allowedOriginsEnv));
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array('*', $allowedOrigins)) {
    header("Access-Control-Allow-Origin: *");
} elseif ($origin && in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Admin-Token');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Connect to DB
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}
$conn->set_charset('utf8mb4');

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$table  = isset($_GET['table']) ? $_GET['table'] : null;
action = isset($_GET['action']) ? $_GET['action'] : null;

$allowed_tables = [
    'users','user_roles','profiles','activity_logs','blog_categories','blog_posts',
    'products','form_submissions','company_settings','email_templates','automation_rules',
    'app_settings','notification_settings'
];

function is_admin_token_valid($adminToken) {
    if (!$adminToken) return false;
    if (!isset($_SERVER['HTTP_X_ADMIN_TOKEN'])) return false;
    return hash_equals($adminToken, $_SERVER['HTTP_X_ADMIN_TOKEN']);
}

if (!$table && !isset($input['drop_table']) && !isset($input['create_table']) && ($action !== 'upload_image')) {
    echo json_encode(["error" => "Table name is required"]);
    exit;
}

// Disallow DDL unless admin token present
if ((isset($input['create_table']) || isset($input['alter_table']) || isset($input['drop_table'])) && !is_admin_token_valid($adminToken)) {
    http_response_code(403);
    echo json_encode(["error" => "Admin token required for schema changes"]);
    exit;
}

// Helper for binding params by reference
function bind_params_ref(&$stmt, $types, $values) {
    if (empty($types)) return;
    $refs = [];
    $refs[] = $types;
    foreach ($values as $k => $v) {
        $refs[] = &$values[$k];
    }
    call_user_func_array([$stmt, 'bind_param'], $refs);
}

// CREATE TABLE (admin only)
if (isset($input['create_table'])) {
    if (!is_admin_token_valid($adminToken)) {
        http_response_code(403);
        echo json_encode(["error" => "Admin token required for create_table"]);
        exit;
    }
    $table = preg_replace('/[^a-z0-9_]/i', '', $table);
    if (!in_array($table, $allowed_tables)) {
        http_response_code(400);
        echo json_encode(["error" => "Table not allowed for creation: $table"]);
        exit;
    }
    $columns = $input['columns'] ?? [];
    if (empty($columns)) {
        echo json_encode(["error" => "No columns provided"]);
        exit;
    }
    $fields = [];
    foreach ($columns as $name => $type) {
        $nameFiltered = preg_replace('/[^a-z0-9_]/i', '', $name);
        $fields[] = "`$nameFiltered` " . $conn->real_escape_string($type);
    }
    $sql = "CREATE TABLE IF NOT EXISTS `$table` (" . implode(",", $fields) . ")";
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Table created or already exists"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
    }
    exit;
}

// ALTER TABLE (admin only)
if (isset($input['alter_table'])) {
    if (!is_admin_token_valid($adminToken)) {
        http_response_code(403);
        echo json_encode(["error" => "Admin token required for alter_table"]);
        exit;
    }
    $actions = $input['actions'] ?? [];
    if (empty($actions)) {
        echo json_encode(["error" => "No ALTER actions provided"]);
        exit;
    }
    $alter_parts = [];
    foreach ($actions as $action_item) {
        $type = strtoupper($action_item['type']);
        $name = preg_replace('/[^a-z0-9_]/i', '', $action_item['name'] ?? '');
        $definition = $conn->real_escape_string($action_item['definition'] ?? '');
        $new_name = preg_replace('/[^a-z0-9_]/i', '', $action_item['new_name'] ?? '');
        switch ($type) {
            case 'ADD':
                $alter_parts[] = "ADD COLUMN `$name` $definition";
                break;
            case 'MODIFY':
                $alter_parts[] = "MODIFY COLUMN `$name` $definition";
                break;
            case 'CHANGE':
                $alter_parts[] = "CHANGE `$name` `$new_name` $definition";
                break;
            case 'DROP':
                $alter_parts[] = "DROP COLUMN `$name`";
                break;
            default:
                http_response_code(400);
                echo json_encode(["error" => "Unsupported ALTER type: $type"]);
                exit;
        }
    }
    $table = preg_replace('/[^a-z0-9_]/i', '', $table);
    if (!in_array($table, $allowed_tables)) {
        http_response_code(400);
        echo json_encode(["error" => "Table not allowed for alter: $table"]);
        exit;
    }
    $sql = "ALTER TABLE `$table` " . implode(", ", $alter_parts);
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Table altered successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
    }
    exit;
}

// DROP TABLE (admin only)
if (isset($input['drop_table'])) {
    if (!is_admin_token_valid($adminToken)) {
        http_response_code(403);
        echo json_encode(["error" => "Admin token required for drop_table"]);
        exit;
    }
    $tableToDrop = preg_replace('/[^a-z0-9_]/i', '', $input['drop_table']);
    if (!in_array($tableToDrop, $allowed_tables)) {
        http_response_code(400);
        echo json_encode(["error" => "Table not allowed for drop: $tableToDrop"]);
        exit;
    }
    $sql = "DROP TABLE IF EXISTS `$tableToDrop`";
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Table dropped successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
    }
    exit;
}

switch ($method) {
    case 'GET':
        if (!in_array($table, $allowed_tables)) {
            http_response_code(400);
            echo json_encode(["error" => "Table not allowed: $table"]);
            break;
        }
        if ($action === 'count') {
            $sql = "SELECT COUNT(*) as count FROM `$table`";
            $result = $conn->query($sql);
            $row = $result ? $result->fetch_assoc() : null;
            echo json_encode(["count" => intval($row['count'] ?? 0)]);
            break;
        }
        if ($action === 'featured' && $table === 'products') {
            $stmt = $conn->prepare("SELECT * FROM `products` WHERE is_featured = 1 ORDER BY featured_order ASC");
            $stmt->execute();
            $res = $stmt->get_result();
            $data = [];
            while ($row = $res->fetch_assoc()) $data[] = $row;
            echo json_encode(["data" => $data]);
            break;
        }
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
        $order = isset($_GET['order']) && (strtolower($_GET['order']) === 'desc') ? 'DESC' : 'ASC';

        $sql = "SELECT * FROM `$table`";
        $whereClauses = [];
        $types = '';
        $values = [];
        if ($id) {
            $whereClauses[] = "id = ?";
            $types .= 'i';
            $values[] = $id;
        }
        $allowedFilters = ['user_id', 'status', 'form_type', 'category', 'slug', 'setting_key', 'email'];
        foreach ($allowedFilters as $field) {
            if (isset($_GET[$field])) {
                $whereClauses[] = "`$field` = ?";
                $types .= 's';
                $values[] = $_GET[$field];
            }
        }
        if (!empty($whereClauses)) {
            $sql .= ' WHERE ' . implode(' AND ', $whereClauses);
        }
        $sql .= " ORDER BY created_at $order";
        if ($limit) {
            $sql .= " LIMIT ?";
            $types .= 'i';
            $values[] = $limit;
            if ($offset > 0) {
                $sql .= " OFFSET ?";
                $types .= 'i';
                $values[] = $offset;
            }
        }
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            if (!empty($types)) bind_params_ref($stmt, $types, $values);
            $stmt->execute();
            $res = $stmt->get_result();
            $data = [];
            while ($row = $res->fetch_assoc()) $data[] = $row;
            echo json_encode(["data" => $data]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'POST':
        if ($action === 'upload_image') {
            if (!isset($_FILES['file'])) {
                http_response_code(400);
                echo json_encode(["error" => "No file provided"]);
                exit;
            }
            $file = $_FILES['file'];
            $fileName = $file['name'];
            $fileTmp = $file['tmp_name'];
            $fileSize = $file['size'];
            $fileError = $file['error'];
            if ($fileError !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(["error" => "File upload error code: $fileError"]);
                exit;
            }
            $maxSize = 5 * 1024 * 1024;
            if ($fileSize > $maxSize) {
                http_response_code(400);
                echo json_encode(["error" => "File size exceeds 5MB limit"]);
                exit;
            }
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $fileTmp);
            finfo_close($finfo);
            $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($mimeType, $allowedMimes)) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid file type. Only JPEG/PNG/GIF/WEBP allowed."]);
                exit;
            }
            // Store uploads outside webroot for safety
            $storageDir = __DIR__ . '/storage/uploads';
            if (!is_dir($storageDir)) {
                if (!mkdir($storageDir, 0755, true)) {
                    http_response_code(500);
                    echo json_encode(["error" => "Failed to create storage uploads directory"]);
                    exit;
                }
            }

            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $safeFileName = 'img_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $fileExt;
            $targetPath = $storageDir . '/' . $safeFileName;

            if (!move_uploaded_file($fileTmp, $targetPath)) {
                http_response_code(500);
                echo json_encode(["error" => "Failed to save file"]);
                exit;
            }

            // Restrict permissions
            chmod($targetPath, 0644);

            // Generate time-limited signed URL for access
            $expiry = time() + (60 * 60 * 24 * 7); // 7 days
            if ($adminToken) {
                $token = hash_hmac('sha256', $safeFileName . '|' . $expiry, $adminToken);
            } else {
                // Admin token not set - require setting ADMIN_TOKEN in env for secure access
                http_response_code(500);
                echo json_encode(["error" => "Server missing ADMIN_TOKEN env var. Set ADMIN_TOKEN to enable secure file access."]);
                exit;
            }

            if ($baseUrl) {
                $fileUrl = rtrim($baseUrl, '/') . '/serve_upload.php?file=' . urlencode($safeFileName) . '&expires=' . $expiry . '&token=' . $token;
            } else {
                $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
                $fileUrl = $scheme . '://' . $host . '/serve_upload.php?file=' . urlencode($safeFileName) . '&expires=' . $expiry . '&token=' . $token;
            }

            // Return filename and signed URL. Do not expose server filesystem path.
            echo json_encode([
                "success" => true,
                "url" => $fileUrl,
                "image_url" => $fileUrl,
                "filename" => $safeFileName
            ]);
            exit;
        }

        $excludeKeys = ['create_table', 'alter_table', 'drop_table', 'action'];
        $inputData = array_diff_key($input, array_flip($excludeKeys));
        if (empty($inputData)) {
            http_response_code(400);
            echo json_encode(["error" => "No data provided"]);
            break;
        }
        if (!in_array($table, $allowed_tables)) {
            http_response_code(400);
            echo json_encode(["error" => "Table not allowed: $table"]);
            break;
        }
        $keys = array_keys($inputData);
        $placeholders = array_fill(0, count($keys), '?');
        $sql = "INSERT INTO `$table` (`" . implode('`,`', array_map(function($k){return preg_replace('/[^a-z0-9_]/i', '', $k);}, $keys)) . "`) VALUES (" . implode(',', $placeholders) . ")";
        $types = '';
        $values = [];
        foreach ($inputData as $v) {
            if (is_int($v)) $types .= 'i';
            elseif (is_float($v) || is_double($v)) $types .= 'd';
            else $types .= 's';
            $values[] = is_array($v) || is_object($v) ? json_encode($v) : $v;
        }
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
            break;
        }
        bind_params_ref($stmt, $types, $values);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'PUT':
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if (!$id && !isset($_GET['user_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID required for update"]);
            break;
        }
        if (!in_array($table, $allowed_tables)) {
            http_response_code(400);
            echo json_encode(["error" => "Table not allowed: $table"]);
            break;
        }
        $updates = [];
        $types = '';
        $values = [];
        foreach ($input as $key => $value) {
            if ($key === 'action') continue;
            $k = preg_replace('/[^a-z0-9_]/i', '', $key);
            $updates[] = "`$k` = ?";
            if (is_int($value)) $types .= 'i';
            elseif (is_float($value) || is_double($value)) $types .= 'd';
            else $types .= 's';
            $values[] = is_array($value) || is_object($value) ? json_encode($value) : $value;
        }
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(["error" => "No data to update"]);
            break;
        }
        if (isset($_GET['user_id'])) {
            $whereClause = "user_id = ?";
            $types .= 'i';
            $values[] = intval($_GET['user_id']);
        } else {
            $whereClause = "id = ?";
            $types .= 'i';
            $values[] = intval($id);
        }
        $sql = "UPDATE `$table` SET " . implode(',', $updates) . " WHERE " . $whereClause;
        $stmt = $conn->prepare($sql);
        if (!$stmt) { http_response_code(500); echo json_encode(["error" => $conn->error]); break; }
        bind_params_ref($stmt, $types, $values);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        if (!$id && !isset($_GET['user_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID required for delete"]);
            break;
        }
        if (!in_array($table, $allowed_tables)) {
            http_response_code(400);
            echo json_encode(["error" => "Table not allowed: $table"]);
            break;
        }
        if (isset($_GET['user_id'])) {
            $sql = "DELETE FROM `$table` WHERE user_id = ?";
            $stmt = $conn->prepare($sql);
            $uid = intval($_GET['user_id']);
            $stmt->bind_param('i', $uid);
        } else {
            $sql = "DELETE FROM `$table` WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $iid = intval($id);
            $stmt->bind_param('i', $iid);
        }
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Unsupported request method"]);
        break;
}

$conn->close();
?>
