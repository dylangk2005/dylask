param(
    [Parameter(Mandatory=$true)]
    [string]$Description
)

$rootDir = (Resolve-Path "$PSScriptRoot\..\..\..\..").Path
$migrationDir = Join-Path $rootDir "dylask-backend\src\main\resources\db\migration"

if (-not (Test-Path $migrationDir)) {
    New-Item -ItemType Directory -Path $migrationDir -Force | Out-Null
}

# Lấy danh sách version hiện có
$existingFiles = Get-ChildItem -Path $migrationDir -Filter "V*__*.sql"
$maxVersion = 0

foreach ($file in $existingFiles) {
    if ($file.Name -match "^V(\d+)__") {
        $v = [int]$matches[1]
        if ($v -gt $maxVersion) {
            $maxVersion = $v
        }
    }
}

$nextVersion = $maxVersion + 1
$cleanDesc = $Description.ToLower().Replace(" ", "_").Replace("-", "_")
$fileName = "V${nextVersion}__${cleanDesc}.sql"
$filePath = Join-Path $migrationDir $fileName

$template = @"
-- Migration: $fileName
-- Hệ Quản Trị CSDL: MySQL 8.4 LTS
-- Tạo lúc: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- Bảng mẫu với Audit columns và Engine InnoDB
-- CREATE TABLE example_table (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     is_active BOOLEAN NOT NULL DEFAULT TRUE,
--     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"@

Set-Content -Path $filePath -Value $template -Encoding UTF8
Write-Host "Đã tạo file migration mới:" -ForegroundColor Green
Write-Host "Path: $filePath" -ForegroundColor Cyan
