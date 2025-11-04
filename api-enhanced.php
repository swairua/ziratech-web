<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- DB CONFIG ---
$servername = "localhost";
$username   = "mazaoplu_ziraweb";
$password   = "Sirgeorge.12";
$dbname     = "mazaoplu_ziraweb";

// --- DB CONNECTION ---
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8mb4");

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true) ?? [];
$table  = $_GET['table'] ?? null;
$action = $_GET['action'] ?? null;

if (!$table && !isset($input['drop_table']) && !isset($input['create_table']) && $action !== 'upload_image') {
    echo json_encode(["error" => "Table name is required"]);
    exit;
}

/**
 * ✅ CREATE TABLE
 */
if (isset($input['create_table'])) {
    $columns = $input['columns'] ?? [];
    if (empty($columns)) {
        echo json_encode(["error" => "No columns provided"]);
        exit;
    }
    $fields = [];
    foreach ($columns as $name => $type) {
        $fields[] = "`$name` $type";
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

/**
 * ✅ ALTER TABLE
 */
if (isset($input['alter_table'])) {
    $actions = $input['actions'] ?? [];
    if (empty($actions)) {
        echo json_encode(["error" => "No ALTER actions provided"]);
        exit;
    }

    $alter_parts = [];
    foreach ($actions as $action_item) {
        $type = strtoupper($action_item['type']);
        $name = $action_item['name'] ?? '';
        $definition = $action_item['definition'] ?? '';
        $new_name = $action_item['new_name'] ?? '';

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

    $sql = "ALTER TABLE `$table` " . implode(", ", $alter_parts);
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Table altered successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
    }
    exit;
}

/**
 * ✅ DROP TABLE
 */
if (isset($input['drop_table'])) {
    $tableToDrop = $input['drop_table'];
    $sql = "DROP TABLE IF EXISTS `$tableToDrop`";
    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "message" => "Table dropped successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
    }
    exit;
}

/**
 * ✅ CRUD OPERATIONS
 */
switch ($method) {
    case 'GET':
        // Handle special actions
        if ($action === 'count') {
            $sql = "SELECT COUNT(*) as count FROM `$table`";
            $result = $conn->query($sql);
            $row = $result->fetch_assoc();
            echo json_encode(["count" => intval($row['count'])]);
            break;
        }
        
        if ($action === 'stats') {
            $sql = "SELECT COUNT(*) as count FROM `$table`";
            $result = $conn->query($sql);
            $row = $result->fetch_assoc();
            echo json_encode(["count" => intval($row['count']), "stats" => true]);
            break;
        }

        // Handle featured products
        if ($action === 'featured' && isset($_GET['is_featured'])) {
            $sql = "SELECT * FROM `$table` WHERE is_featured = 1 ORDER BY featured_order ASC";
            $result = $conn->query($sql);
            $data = [];
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
            }
            echo json_encode(["data" => $data]);
            break;
        }

        // Handle regular GET with filters
        $id = $_GET['id'] ?? null;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
        $order = $_GET['order'] ?? 'ASC';
        $order = ($order === 'desc' || $order === 'DESC') ? 'DESC' : 'ASC';

        $sql = "SELECT * FROM `$table`";
        $whereConditions = [];

        if ($id) {
            $whereConditions[] = "id=" . intval($id);
        }

        // Handle filtering by other fields
        $allowedFilters = ['user_id', 'status', 'form_type', 'category', 'slug', 'setting_key', 'email'];
        foreach ($allowedFilters as $field) {
            if (isset($_GET[$field])) {
                $value = $conn->real_escape_string($_GET[$field]);
                $whereConditions[] = "`$field`='$value'";
            }
        }

        if (!empty($whereConditions)) {
            $sql .= " WHERE " . implode(" AND ", $whereConditions);
        }

        // Add ORDER BY
        $sql .= " ORDER BY created_at $order";

        // Add LIMIT and OFFSET
        if ($limit) {
            $sql .= " LIMIT $limit";
            if ($offset > 0) {
                $sql .= " OFFSET $offset";
            }
        }

        $result = $conn->query($sql);
        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        echo json_encode(["data" => $data]);
        break;

    case 'POST':
        // Handle image upload
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

            // Validate file upload
            if ($fileError !== UPLOAD_ERR_OK) {
                http_response_code(400);
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
                    UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
                    UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                    UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                    UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                    UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                    UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
                ];
                echo json_encode(["error" => $errorMessages[$fileError] ?? "Unknown upload error"]);
                exit;
            }

            // Validate file size (5MB max)
            $maxSize = 5 * 1024 * 1024;
            if ($fileSize > $maxSize) {
                http_response_code(400);
                echo json_encode(["error" => "File size exceeds 5MB limit"]);
                exit;
            }

            // Get MIME type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $fileTmp);
            finfo_close($finfo);

            // Validate image MIME type
            $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
            if (!in_array($mimeType, $allowedMimes)) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid file type. Only images are allowed."]);
                exit;
            }

            // Create uploads directory if it doesn't exist
            $uploadsDir = __DIR__ . '/assets';
            if (!is_dir($uploadsDir)) {
                if (!mkdir($uploadsDir, 0755, true)) {
                    http_response_code(500);
                    echo json_encode(["error" => "Failed to create uploads directory"]);
                    exit;
                }
            }

            // Generate safe filename
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $safeFileName = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $fileExt;
            $targetPath = $uploadsDir . '/' . $safeFileName;

            // Move uploaded file
            if (!move_uploaded_file($fileTmp, $targetPath)) {
                http_response_code(500);
                echo json_encode(["error" => "Failed to save file"]);
                exit;
            }

            // Set proper permissions
            chmod($targetPath, 0644);

            // Return success with file URL
            $fileUrl = 'https://zira-tech.com/assets/' . $safeFileName;
            echo json_encode([
                "success" => true,
                "url" => $fileUrl,
                "image_url" => $fileUrl,
                "filename" => $safeFileName,
                "path" => $targetPath
            ]);
            exit;
        }

        // Filter out special keys
        $excludeKeys = ['create_table', 'alter_table', 'drop_table', 'action'];
        $inputData = array_diff_key($input, array_flip($excludeKeys));
        
        if (empty($inputData)) {
            http_response_code(400);
            echo json_encode(["error" => "No data provided"]);
            break;
        }

        $keys = array_keys($inputData);
        $values = array_map(function($v) use ($conn) {
            return $conn->real_escape_string(is_array($v) || is_object($v) ? json_encode($v) : $v);
        }, array_values($inputData));

        $sql = "INSERT INTO `$table` (`" . implode("`,`", $keys) . "`) VALUES ('" . implode("','", $values) . "')";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "id" => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID required for update"]);
            break;
        }

        // Handle special case for user_id lookup
        if (isset($_GET['user_id'])) {
            $userId = intval($_GET['user_id']);
            $updates = [];
            foreach ($input as $key => $value) {
                if (!in_array($key, ['user_id', 'action'])) {
                    $updates[] = "`$key`='" . $conn->real_escape_string(is_array($value) || is_object($value) ? json_encode($value) : $value) . "'";
                }
            }
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(["error" => "No data to update"]);
                break;
            }
            $sql = "UPDATE `$table` SET " . implode(",", $updates) . " WHERE user_id=" . $userId;
        } else {
            $updates = [];
            foreach ($input as $key => $value) {
                $updates[] = "`$key`='" . $conn->real_escape_string(is_array($value) || is_object($value) ? json_encode($value) : $value) . "'";
            }
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(["error" => "No data to update"]);
                break;
            }
            $sql = "UPDATE `$table` SET " . implode(",", $updates) . " WHERE id=" . intval($id);
        }

        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID required for delete"]);
            break;
        }

        // Handle special case for user_id lookup
        if (isset($_GET['user_id'])) {
            $userId = intval($_GET['user_id']);
            $sql = "DELETE FROM `$table` WHERE user_id=" . $userId;
        } else {
            $sql = "DELETE FROM `$table` WHERE id=" . intval($id);
        }

        if ($conn->query($sql)) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Unsupported request method"]);
        break;
}

$conn->close();
?>
