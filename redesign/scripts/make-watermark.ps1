# 生成全站底纹水印（一枚大的南航校徽线稿）。
#
# 源图 imgs/logo_nuaa.png（1142×1142）是一枚不透明的校徽：
# 蓝色实心圆盘 + 白色线稿（文字、三叉戟、1952、NUAA）。
#
# 关键：只保留白色线稿，把蓝底盘整片丢掉。
#   - 若保留蓝色块（按「越深越不透明」取色），大尺寸下白字变镂空，
#     整体就读作一个灰色实心圆盘——正是要避免的效果。
#   - 按「越白越不透明」取色，蓝底盘被切掉，剩下的是纯线稿纹样。
#
#     v     = (lum / 255 - cut) / (1 - cut)
#     alpha = 原alpha × v × factor
#
# 用法（在 redesign 目录执行）：
#     powershell -ExecutionPolicy Bypass -File scripts/make-watermark.ps1
#
# 调参：
#     -factor 整体浓淡（浅色 0.34 / 深色 0.30，调小更淡）
#     -cut    切掉多白的部分（0.62，调大则只剩最亮的线）

param(
  [string]$Src = "$PSScriptRoot\..\..\imgs\logo_nuaa.png",
  [string]$Out = "$PSScriptRoot\..\assets",
  [int]$Tile   = 1080,   # 图块边长（源图 1142，1024 以上不糊）
  [int]$Logo   = 1040    # 校徽边长，几乎满幅，四周留 20px
)

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class NuaaWatermark {
  public static void Make(string srcPath, string outPath, int tile, int logo,
                          int cr, int cg, int cb, double factor, double cut) {
    using (var srcImg = Image.FromFile(srcPath))
    using (var bmp = new Bitmap(tile, tile, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(bmp)) {
        g.Clear(Color.Transparent);
        g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
        int off = (tile - logo) / 2;
        g.DrawImage(srcImg, new Rectangle(off, off, logo, logo));
      }

      var rect = new Rectangle(0, 0, tile, tile);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int len = data.Stride * tile;
      byte[] buf = new byte[len];
      Marshal.Copy(data.Scan0, buf, 0, len);

      for (int y = 0; y < tile; y++) {
        int row = y * data.Stride;
        for (int x = 0; x < tile; x++) {
          int i = row + x * 4;                 // BGRA
          int a = buf[i + 3];
          if (a == 0) { buf[i + 3] = 0; continue; }

          double lum = 0.299 * buf[i + 2] + 0.587 * buf[i + 1] + 0.114 * buf[i];
          double v = (lum / 255.0 - cut) / (1.0 - cut);   // 越白越不透明
          if (v <= 0) { buf[i + 3] = 0; continue; }

          int na = (int)Math.Round(a * v * factor);
          if (na > 255) na = 255;

          buf[i] = (byte)cb; buf[i + 1] = (byte)cg; buf[i + 2] = (byte)cr; buf[i + 3] = (byte)na;
        }
      }

      Marshal.Copy(buf, 0, data.Scan0, len);
      bmp.UnlockBits(data);
      bmp.Save(outPath, ImageFormat.Png);
    }
  }
}
'@

$src = (Resolve-Path $Src).Path
$out = (Resolve-Path $Out).Path

# 浅色区块：#6E7780
[NuaaWatermark]::Make($src, (Join-Path $out 'watermark-on-light.png'), $Tile, $Logo, 110, 119, 128, 0.34, 0.62)
# 深色区块：#C6CBD0
[NuaaWatermark]::Make($src, (Join-Path $out 'watermark-on-dark.png'),  $Tile, $Logo, 198, 203, 208, 0.30, 0.62)

Get-ChildItem (Join-Path $out 'watermark-on-*.png') |
  ForEach-Object { "{0}  {1} 字节" -f $_.Name, $_.Length }
