param(
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

function Test-ProposalApp([int]$Port) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/" -TimeoutSec 1
        return $response.StatusCode -eq 200 -and $response.Content -match 'Proposta Solar'
    } catch {
        return $false
    }
}

$port = $null
foreach ($candidate in 4173..4183) {
    $listener = Get-NetTCPConnection -LocalPort $candidate -State Listen -ErrorAction SilentlyContinue
    if (-not $listener) {
        $port = $candidate
        break
    }
    if (Test-ProposalApp $candidate) {
        $port = $candidate
        break
    }
}

if (-not $port) {
    throw 'Nenhuma porta local disponivel entre 4173 e 4183.'
}

$url = "http://127.0.0.1:$port/"
if (-not (Test-ProposalApp $port)) {
    $bundledPython = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
    $pythonCommand = $null
    $pythonPrefix = @()

    if (Test-Path -LiteralPath $bundledPython) {
        $pythonCommand = $bundledPython
    } else {
        $python = Get-Command python.exe -ErrorAction SilentlyContinue
        if ($python) {
            $pythonCommand = $python.Source
        } else {
            $py = Get-Command py.exe -ErrorAction SilentlyContinue
            if ($py) {
                $pythonCommand = $py.Source
                $pythonPrefix = @('-3')
            }
        }
    }

    if (-not $pythonCommand) {
        throw 'Python nao foi encontrado. Instale o Python 3 para abrir o aplicativo localmente.'
    }

    $arguments = $pythonPrefix + @('-m', 'http.server', "$port", '--bind', '127.0.0.1')
    Start-Process -FilePath $pythonCommand -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden | Out-Null

    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 200
        if (Test-ProposalApp $port) {
            $ready = $true
            break
        }
    }
    if (-not $ready) {
        throw 'O servidor local nao respondeu dentro do tempo esperado.'
    }
}

if (-not $NoBrowser) {
    Start-Process $url | Out-Null
}

Write-Output $url
