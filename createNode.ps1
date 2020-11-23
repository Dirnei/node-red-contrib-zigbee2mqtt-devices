Param(
    [Parameter(Mandatory = $True)]
    [string]$NodeName,
    [Parameter(Mandatory = $True)]
    [string]$Label,
    [Parameter(Mandatory = $True)]
    [string]$FuncName,
    [Parameter(Mandatory = $True)]
    [string]$Category,
    [Parameter(Mandatory = $True)]
    [int]$Inputs,
    [Parameter(Mandatory = $True)]
    [int]$Outputs
    )

Write-Host "============================================================================="
Write-Host " Name of the node      : $NodeName"
Write-Host " Display-label value   : $Label"
Write-Host " Creating func name    : $FuncName"
Write-Host " Category              : $Category"
Write-Host " Inputs                : $Inputs"
Write-Host " Outputs               : $Outputs"
Write-Host "============================================================================="

$nodeJsPath = "src/$NodeName.js"
$nodeHtmlPath = "src/$NodeName.html"

Write-Host " Copy templates..."
Copy-Item -Path "_template.js" -Destination $nodeJsPath
Copy-Item -Path "_template.html" -Destination $nodeHtmlPath

Write-host " Replacing tokens..."
(Get-Content -path $nodeJsPath -Raw).Replace('$$NAME_FUNC$$', $FuncName).Replace('$$NAME_NODE$$', $NodeName) | Set-Content -Path $nodeJsPath
(Get-Content -path $nodeHtmlPath -Raw).Replace('$$NAME_LABEL$$', $Label).Replace('$$NAME_NODE$$', $NodeName).Replace('$$NAME_UPPER$$', $NodeName.ToUpper()).Replace('$$CATEGORY$$', $Category).Replace('$$INPUTS$$', $Inputs).Replace('$$OUTPUTS$$', $Outputs) | Set-Content -Path $nodeHtmlPath
Write-host " Finished!"
Write-Host "============================================================================="
Write-Host