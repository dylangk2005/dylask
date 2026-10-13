param(
    [string]$FeatureName = ""
)

$rootDir = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$draftDir = Join-Path $rootDir "docs\specs\01.draft"
$approvedDir = Join-Path $rootDir "docs\specs\02.approved"
$archiveDir = Join-Path $rootDir "docs\specs\03.archive"

Write-Host "=== KIỂM TRA TRẠNG THÁI SPEC: $FeatureName ===" -ForegroundColor Cyan

if (-not $FeatureName) {
    Write-Host "Danh sách spec trong 02.approved:" -ForegroundColor Green
    Get-ChildItem -Path $approvedDir -Filter "*.md" | Select-Object Name
    Write-Host "`nDanh sách spec trong 01.draft:" -ForegroundColor Yellow
    Get-ChildItem -Path $draftDir -Filter "*.md" | Select-Object Name
    exit 0
}

$approvedFile = Get-ChildItem -Path $approvedDir -Filter "*$FeatureName*" | Select-Object -First 1
$draftFile = Get-ChildItem -Path $draftDir -Filter "*$FeatureName*" | Select-Object -First 1
$archiveFile = Get-ChildItem -Path $archiveDir -Filter "*$FeatureName*" | Select-Object -First 1

if ($approvedFile) {
    Write-Host "[APPROVED] Spec '$($approvedFile.Name)' ĐÃ ĐƯỢC DUYỆT. Được phép tiến hành lập trình!" -ForegroundColor Green
    exit 0
} elseif ($draftFile) {
    Write-Host "[DRAFT] Spec '$($draftFile.Name)' ĐANG Ở DRAFT. CẤM CODE! Vui lòng review và chuyển vào docs/specs/02.approved trước." -ForegroundColor Red
    exit 1
} elseif ($archiveFile) {
    Write-Host "[ARCHIVED] Spec '$($archiveFile.Name)' ĐÃ HOÀN THÀNH & ĐÃ LƯU TRỮ." -ForegroundColor Gray
    exit 0
} else {
    Write-Host "[NOT FOUND] Không tìm thấy spec nào khớp với từ khóa '$FeatureName'." -ForegroundColor Yellow
    exit 2
}
