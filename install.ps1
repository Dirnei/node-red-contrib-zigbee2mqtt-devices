# Install script to setup the project in a Test Node-RED docker container for development.
# Tested under Windows and Linux (Ubuntu 20.04 with powershell)
# Required software: powsershell, docker, docker-compose, nodejs, npm

function copy-files {
    PARAM (
        $src,
        $destRoot,
        $destFolder
    ) 

    $src = Resolve-Path $src
    $destRoot = Resolve-Path $destRoot

    Write-Output "From : $src"
    Write-Output "To   : $destRoot"

    $files = Get-ChildItem -Recurse $src | Where-Object { ! $_.PSIsContainer }
    foreach ($file in $files) {
        $relativeFile = $file.FullName.Substring($src.Path.Length)
        $dest = Join-Path -Path $destRoot -ChildPath $destFolder
        $dest = Join-Path -Path $dest -ChildPath $relativeFile

        $folder = $dest.Substring(0, $dest.LastIndexOf([IO.Path]::DirectorySeparatorChar))
        if (-not (Test-Path $folder)) {
            New-Item -ItemType Directory $folder
        }

        Write-Output $dest
        [System.IO.File]::Copy($file.FullName, $dest, $true);
    }
}

if (-not (Test-Path ".\debug\")) {
    New-Item -ItemType Directory ".\debug"
}

if (-not (Test-Path ".\debug\package.json")) {
    $check = docker container inspect -f '{{.State.Running}}' "nodered_testing"

    if ($check) {
        docker-compose down  
    }

    docker-compose up -d   

    Write-Host "Waiting for node-red to boot ..." -NoNewLine 
    while (!(Test-Path ".\debug\package.json")) { 
        Start-Sleep 2
    }
    
    Write-Host -ForegroundColor Green " done"
}

docker-compose down

$origin = [Environment]::CurrentDirectory;
$repoName = $origin.Split([IO.Path]::DirectorySeparatorChar) | Select-Object -Last 1
Write-Host "Name: $repoName"
if (-not (Test-Path ".\debug\myModules\$repoName")) {
    Write-Output "Creating Path..."
    New-Item -ItemType Directory ".\debug\myModules\$repoName"
    New-Item -ItemType Directory ".\debug\myModules\$repoName\lib"
}

Write-Output "Copy files..."

copy-files -src '.\dist' -destRoot ".\debug\myModules\$repoName" -destFolder "dist"
copy-files -src '.\examples' -destRoot ".\debug\myModules\$repoName" -destFolder "examples"

$packageModified = $false 
$destRoot = Resolve-Path ".\debug\myModules\$repoName"
# Check if package.json needs install
if (Test-Path $destRoot/package.json) {
    Write-Output "Comparing package.json ..."
    $packageModified = (Get-FileHash ./package.json).hash -ne (Get-FileHash $destRoot/package.json).hash
    if ($packageModified) {
        Write-Host "package.json was modified. Reinstall again after copy!" -ForegroundColor Yellow
    }
    else {
        Write-Host "Unmodified. No reinstallation needed!" -ForegroundColor Green
    }
}
else {
    $packageModified = $true;
}

Copy-Item -Path ./package.json -Destination $destRoot/package.json


$destination = Resolve-Path .\debug\
Write-Output "Change location to: $destination"
Set-Location $destination

if ($packageModified) {
    npm install --production ".\myModules\$repoName"
}

Write-Output "Switching back to: $origin"
Set-Location $origin

# fix for windwos docker
# windows docker can't handle links so we need to copy the files....
if ($IsWindows -or $Env:OS -eq "Windows_NT") {
    Write-Host "Fixing Windows Docker Problems" -ForegroundColor Red
    Write-Host "Resolve symlink" -ForegroundColor Yellow
    $files = Get-ChildItem "./debug/node_modules/" | Where-Object { $_.Attributes -match "ReparsePoint" }
    
    Write-Host "Updating modules..." -ForegroundColor Yellow
    $files = Get-ChildItem "./debug/node_modules/" -Directory
    foreach ($file in $files) {
        
        $moduleName = $file.FullName.Split("\") | Select-Object -Last 1

        if (Test-Path "./debug/myModules/$moduleName") {
            Write-Host "Update module: " -NoNewline -ForegroundColor Magenta
            Write-Host $moduleName
            Remove-Item $file.FullName -Force -Recurse
            Copy-Item -Recurse -Path "./debug/myModules/$moduleName/" -Destination "./debug/node_modules/"
        }

    }
}

docker-compose up -d