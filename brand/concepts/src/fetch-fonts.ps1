# Download the upstream OFL font files used by the concept sheets and brand/scripts/subset-fonts.py
# (gitignored: brand/concepts/src/fonts/). Run: pwsh -NoProfile -File brand/concepts/src/fetch-fonts.ps1
$ErrorActionPreference = 'Continue'
$dest = (Join-Path $PSScriptRoot 'fonts')
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$base = 'https://raw.githubusercontent.com/google/fonts/main/ofl'
$files = @(
    @('geist', 'Geist%5Bwght%5D.ttf', 'Geist[wght].ttf'),
    @('geistmono', 'GeistMono%5Bwght%5D.ttf', 'GeistMono[wght].ttf'),
    @('martianmono', 'MartianMono%5Bwdth,wght%5D.ttf', 'MartianMono[wdth,wght].ttf'),
    @('instrumentserif', 'InstrumentSerif-Regular.ttf', 'InstrumentSerif-Regular.ttf'),
    @('instrumentserif', 'InstrumentSerif-Italic.ttf', 'InstrumentSerif-Italic.ttf'),
    @('fraunces', 'Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf', 'Fraunces[SOFT,WONK,opsz,wght].ttf'),
    @('bricolagegrotesque', 'BricolageGrotesque%5Bopsz,wdth,wght%5D.ttf', 'BricolageGrotesque[opsz,wdth,wght].ttf'),
    @('monasans', 'MonaSans%5Bwdth,wght%5D.ttf', 'MonaSans[wdth,wght].ttf'),
    @('spacemono', 'SpaceMono-Bold.ttf', 'SpaceMono-Bold.ttf'),
    @('spacemono', 'SpaceMono-Regular.ttf', 'SpaceMono-Regular.ttf'),
    @('silkscreen', 'Silkscreen-Regular.ttf', 'Silkscreen-Regular.ttf'),
    @('pixelifysans', 'PixelifySans%5Bwght%5D.ttf', 'PixelifySans[wght].ttf'),
    @('vt323', 'VT323-Regular.ttf', 'VT323-Regular.ttf')
)
$log = (Join-Path $dest 'fetch.log')
'' | Set-Content -Path $log
foreach ($f in $files) {
    $url = "$base/$($f[0])/$($f[1])"
    $out = Join-Path $dest $f[2]
    $code = curl.exe -sL -o $out -w '%{http_code}' $url
    $size = if (Test-Path $out) { (Get-Item $out).Length } else { 0 }
    "$code $size $($f[2])" | Add-Content -Path $log
    $lic = Join-Path $dest "OFL-$($f[0]).txt"
    if (-not (Test-Path $lic)) {
        $c2 = curl.exe -sL -o $lic -w '%{http_code}' "$base/$($f[0])/OFL.txt"
        "$c2 OFL-$($f[0]).txt" | Add-Content -Path $log
    }
}
