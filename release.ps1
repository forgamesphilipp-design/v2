$ErrorActionPreference = "Stop"

# letztes Tag holen
$lastTag = git tag --sort=-v:refname | Select-Object -First 1

if (-not $lastTag) {
    $major = 1
    $minor = 0
} else {
    $version = $lastTag -replace '^v',''
    $parts = $version.Split('.')
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
}

# Version erhöhen
$minor++
if ($minor -gt 9) {
    $minor = 0
    $major++
}

$newTag = "v$major.$minor"
Write-Host "Release $newTag"

git add .
git commit -m $newTag
git tag $newTag
git push
git push origin $newTag

