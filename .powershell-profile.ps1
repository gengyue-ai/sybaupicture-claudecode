# Sybau Picture PowerShell 编码配置
# 设置控制台输出编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# 设置默认文件编码为UTF-8
$PSDefaultParameterValues = @{
    'Out-File:Encoding' = 'utf8'
    'Export-Csv:Encoding' = 'utf8'
    'Set-Content:Encoding' = 'utf8'
    'Add-Content:Encoding' = 'utf8'
}

# 设置环境变量
$env:PYTHONUTF8 = "1"
$env:LC_ALL = "en_US.UTF-8"

Write-Host "✅ PowerShell UTF-8 编码已配置" -ForegroundColor Green
