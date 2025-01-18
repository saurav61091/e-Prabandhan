<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

// Configuration
$requiredExtensions = ['mysqli', 'pdo', 'pdo_mysql', 'curl', 'json', 'openssl'];
$requiredPhpVersion = '7.4.0';
$minMemoryLimit = '256M';
$minExecutionTime = '300';

// Functions
function checkSystemRequirements() {
    global $requiredExtensions, $requiredPhpVersion, $minMemoryLimit, $minExecutionTime;
    $errors = [];
    
    // Check PHP version
    if (version_compare(PHP_VERSION, $requiredPhpVersion, '<')) {
        $errors[] = "PHP version must be at least {$requiredPhpVersion}. Current version: " . PHP_VERSION;
    }

    // Check extensions
    foreach ($requiredExtensions as $ext) {
        if (!extension_loaded($ext)) {
            $errors[] = "Required PHP extension missing: {$ext}";
        }
    }

    // Check memory limit
    $memoryLimit = ini_get('memory_limit');
    if (intval($memoryLimit) < intval($minMemoryLimit)) {
        $errors[] = "Memory limit must be at least {$minMemoryLimit}. Current limit: {$memoryLimit}";
    }

    // Check max execution time
    $maxExecutionTime = ini_get('max_execution_time');
    if ($maxExecutionTime !== '0' && intval($maxExecutionTime) < intval($minExecutionTime)) {
        $errors[] = "Max execution time must be at least {$minExecutionTime}s. Current limit: {$maxExecutionTime}s";
    }

    return $errors;
}

function executeCommand($command) {
    $output = [];
    $returnVar = 0;
    exec($command . " 2>&1", $output, $returnVar);
    return [
        'success' => $returnVar === 0,
        'output' => implode("\n", $output)
    ];
}

function installApplication($config) {
    try {
        // Create database
        $mysqli = new mysqli($config['db_host'], $config['cpanel_user'], $config['cpanel_pass']);
        if ($mysqli->connect_error) {
            throw new Exception("Database connection failed: " . $mysqli->connect_error);
        }

        $dbName = $mysqli->real_escape_string($config['db_name']);
        $dbUser = $mysqli->real_escape_string($config['db_user']);
        $dbPass = $mysqli->real_escape_string($config['db_pass']);

        $mysqli->query("CREATE DATABASE IF NOT EXISTS `{$dbName}`");
        $mysqli->query("CREATE USER IF NOT EXISTS '{$dbUser}'@'localhost' IDENTIFIED BY '{$dbPass}'");
        $mysqli->query("GRANT ALL PRIVILEGES ON `{$dbName}`.* TO '{$dbUser}'@'localhost'");
        $mysqli->query("FLUSH PRIVILEGES");

        // Update environment files
        $envContent = file_get_contents('.env.example');
        $envContent = str_replace(
            ['DB_HOST=localhost', 'DB_USER=root', 'DB_PASSWORD=', 'DB_NAME=eprabandhan'],
            ["DB_HOST={$config['db_host']}", "DB_USER={$config['db_user']}", "DB_PASSWORD={$config['db_pass']}", "DB_NAME={$config['db_name']}"],
            $envContent
        );
        file_put_contents('.env', $envContent);

        // Install Node.js dependencies
        $commands = [
            'npm install',
            'npm run build',
            'cd ../frontend && npm install && npm run build',
            'cd ../admin-panel && npm install && npm run build'
        ];

        foreach ($commands as $command) {
            $result = executeCommand($command);
            if (!$result['success']) {
                throw new Exception("Command failed: {$command}\nOutput: {$result['output']}");
            }
        }

        return ['success' => true];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// Handle installation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $result = installApplication($_POST);
    header('Content-Type: application/json');
    echo json_encode($result);
    exit;
}

// Check system requirements
$systemErrors = checkSystemRequirements();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>e-Prabandhan Installation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f8f9fa; }
        .installer-container { max-width: 800px; margin: 50px auto; }
        .step { display: none; }
        .step.active { display: block; }
    </style>
</head>
<body>
    <div class="container installer-container">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h3 class="m-0">e-Prabandhan Installation</h3>
            </div>
            <div class="card-body">
                <!-- System Requirements -->
                <div class="step active" id="step1">
                    <h4>System Requirements Check</h4>
                    <?php if (empty($systemErrors)): ?>
                        <div class="alert alert-success">
                            All system requirements are met!
                        </div>
                        <button class="btn btn-primary" onclick="nextStep(2)">Continue</button>
                    <?php else: ?>
                        <div class="alert alert-danger">
                            <strong>Please fix the following issues:</strong>
                            <ul>
                                <?php foreach ($systemErrors as $error): ?>
                                    <li><?php echo htmlspecialchars($error); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Configuration -->
                <div class="step" id="step2">
                    <h4>Configuration</h4>
                    <form id="installForm">
                        <div class="mb-3">
                            <label>Database Host</label>
                            <input type="text" class="form-control" name="db_host" value="localhost" required>
                        </div>
                        <div class="mb-3">
                            <label>Database Name</label>
                            <input type="text" class="form-control" name="db_name" required>
                        </div>
                        <div class="mb-3">
                            <label>Database User</label>
                            <input type="text" class="form-control" name="db_user" required>
                        </div>
                        <div class="mb-3">
                            <label>Database Password</label>
                            <input type="password" class="form-control" name="db_pass" required>
                        </div>
                        <div class="mb-3">
                            <label>cPanel Username</label>
                            <input type="text" class="form-control" name="cpanel_user" required>
                        </div>
                        <div class="mb-3">
                            <label>cPanel Password</label>
                            <input type="password" class="form-control" name="cpanel_pass" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Install</button>
                    </form>
                </div>

                <!-- Installation Progress -->
                <div class="step" id="step3">
                    <h4>Installing...</h4>
                    <div class="progress mb-3">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
                    </div>
                    <div id="installationLog" class="alert alert-info">
                        Installation in progress...
                    </div>
                </div>

                <!-- Completion -->
                <div class="step" id="step4">
                    <div class="text-center">
                        <h4 class="text-success">Installation Complete!</h4>
                        <p>You can now access your application:</p>
                        <div class="list-group">
                            <a href="../" class="list-group-item list-group-item-action">Frontend</a>
                            <a href="../admin" class="list-group-item list-group-item-action">Admin Panel</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        function nextStep(step) {
            $('.step').removeClass('active');
            $(`#step${step}`).addClass('active');
        }

        $('#installForm').on('submit', function(e) {
            e.preventDefault();
            nextStep(3);

            $.ajax({
                url: 'install.php',
                method: 'POST',
                data: $(this).serialize(),
                success: function(response) {
                    if (response.success) {
                        nextStep(4);
                    } else {
                        $('#installationLog').removeClass('alert-info').addClass('alert-danger')
                            .html(`Installation failed: ${response.error}`);
                    }
                },
                error: function() {
                    $('#installationLog').removeClass('alert-info').addClass('alert-danger')
                        .html('Installation failed: Server error');
                }
            });
        });
    </script>
</body>
</html>
