# Vercel 环境变量更新
Write-Host "=== Vercel 环境变量更新 ===" -ForegroundColor Green

$vars = @{
  'DATABASE_URL' = 'postgresql://postgres:Funinhand1122@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
  'POSTGRES_HOST' = 'db.niqywjbgqkfvuqhngbxm.supabase.co'
  'POSTGRES_URL' = 'postgresql://postgres:Funinhand1122@db.niqywjbgqkfvuqhngbxm.supabase.co:5432/postgres'
  'POSTGRES_PRISMA_URL' = 'postgresql://postgres:Funinhand1122@db.niqywjbgqkfvuqhngbxm.supabase.co:5432/postgres'
  'POSTGRES_URL_NON_POOLING' = 'postgresql://postgres:Funinhand1122@db.niqywjbgqkfvuqhngbxm.supabase.co:5432/postgres'
  'SUPABASE_URL' = 'https://niqywjbgqkfvuqhngbxm.supabase.co'
  'NEXT_PUBLIC_SUPABASE_URL' = 'https://niqywjbgqkfvuqhngbxm.supabase.co'
  'SUPABASE_ANON_KEY' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcXl3amJncWtmdnVxaG5nYnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk0NjYsImV4cCI6MjA2NzI5NTQ2Nn0.AZNXH903VoWYYNJyyUIWsKv6yA_oSW79OBpSE39lSQI'
  'NEXT_PUBLIC_SUPABASE_ANON_KEY' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcXl3amJncWtmdnVxaG5nYnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk0NjYsImV4cCI6MjA2NzI5NTQ2Nn0.AZNXH903VoWYYNJyyUIWsKv6yA_oSW79OBpSE39lSQI'
  'SUPABASE_SERVICE_ROLE_KEY' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcXl3amJncWtmdnVxaG5nYnhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcxOTQ2NiwiZXhwIjoyMDY3Mjk1NDY2fQ.ppnECQTTFD6DWdNYlOH0Ff3aUibTuAPCc539lv5t65s'
}

$count = 0
foreach ($key in $vars.Keys) {
  Write-Host "更新: $key"
  $val = $vars[$key]
  $val | npx vercel env add $key production --force 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $key 完成" -ForegroundColor Green
    $count++
  } else {
    Write-Host "⚠️ $key 失败" -ForegroundColor Yellow
  }
}

Write-Host "`n=== $count/10 个变量更新完成 ===" -ForegroundColor Green
