# Script para verificar e corrigir o erro no perfil do PowerShell
Write-Host "Verificando o arquivo de perfil do PowerShell..."

# Caminho do arquivo de perfil
$profilePath = "$env:USERPROFILE\OneDrive\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"

if (Test-Path $profilePath) {
    Write-Host "Arquivo de perfil encontrado: $profilePath"
    
    # Ler o conteúdo do arquivo
    $content = Get-Content $profilePath -Encoding UTF8
    
    Write-Host "Conteúdo do arquivo:"
    $content | ForEach-Object { Write-Host "$($_.IndexOf($_)+1): $_" }
    
    # Identificar a linha problemática (linha 6)
    if ($content.Count -ge 6) {
        $line6 = $content[5]  # Índice 5 para a sexta linha
        Write-Host "`nLinha 6: $line6"
        
        # Verificar se há caracteres especiais ou crases
        if ($line6 -match '`') {
            Write-Host "Encontrada crase (`) na linha 6 - este é provavelmente o problema."
        }
    } else {
        Write-Host "O arquivo tem menos de 6 linhas."
    }
    
    # Criar backup do arquivo original
    $backupPath = "$profilePath.backup"
    Copy-Item $profilePath $backupPath
    Write-Host "Backup criado em: $backupPath"
    
    # Corrigir o problema removendo a crase ou comentário problemático
    $newContent = $content | ForEach-Object {
        # Remover crases soltas que possam estar causando o problema
        $_ -replace '^\s*`', '# $&'  # Comenta linhas que começam com crase
    }
    
    # Salvar o conteúdo corrigido
    $newContent | Set-Content $profilePath -Encoding UTF8
    Write-Host "Arquivo corrigido e salvo em: $profilePath"
    Write-Host "Conteúdo após correção:"
    $newContent | ForEach-Object { Write-Host "$($_.IndexOf($_)+1): $_" }
} else {
    Write-Host "Arquivo de perfil não encontrado em: $profilePath"
    Write-Host "Você pode criar o diretório e arquivo se necessário:"
    Write-Host "New-Item -ItemType Directory -Path '$env:USERPROFILE\OneDrive\Documents\WindowsPowerShell' -Force"
    Write-Host "New-Item -ItemType File -Path '$profilePath'"
}