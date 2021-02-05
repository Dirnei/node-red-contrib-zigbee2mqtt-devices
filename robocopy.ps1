robocopy.exe ./src/ ./dist/ /MIR /xf *.js /xf *.ts /NFL /NDL /NJH /NJS /nc /ns /np

Write-Output $LastExitCode
if ($LastExitCode -ge 8) {
    Write-Output "Error copying files"
    exit $LastExitCode
} Else {
    Write-Output "Copied src/ to dist/"
    exit 0
}