"""
Standard U-Net for binary tumor segmentation.
Input:  (B, 1, H, W) grayscale ultrasound
Output: (B, 1, H, W) logits (apply sigmoid for probability mask)
"""

import torch
import torch.nn as nn

from src.config import IN_CHANNELS, UNET_BASE_CHANNELS, UNET_DEPTH


class DoubleConv(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class Down(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.pool_conv = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_ch, out_ch),
        )

    def forward(self, x):
        return self.pool_conv(x)


class Up(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.up = nn.ConvTranspose2d(in_ch, in_ch // 2, kernel_size=2, stride=2)
        self.conv = DoubleConv(in_ch, out_ch)

    def forward(self, x, skip):
        x = self.up(x)
        # pad if odd input sizes cause shape mismatch
        diff_y = skip.size(2) - x.size(2)
        diff_x = skip.size(3) - x.size(3)
        x = nn.functional.pad(x, [diff_x // 2, diff_x - diff_x // 2,
                                    diff_y // 2, diff_y - diff_y // 2])
        x = torch.cat([skip, x], dim=1)
        return self.conv(x)


class UNet(nn.Module):
    def __init__(
        self,
        in_channels: int = IN_CHANNELS,
        out_channels: int = 1,
        base_channels: int = UNET_BASE_CHANNELS,
        depth: int = UNET_DEPTH,
    ):
        super().__init__()
        self.depth = depth

        self.in_conv = DoubleConv(in_channels, base_channels)

        self.downs = nn.ModuleList()
        ch = base_channels
        for _ in range(depth):
            self.downs.append(Down(ch, ch * 2))
            ch *= 2

        self.ups = nn.ModuleList()
        for _ in range(depth):
            self.ups.append(Up(ch, ch // 2))
            ch //= 2

        self.out_conv = nn.Conv2d(base_channels, out_channels, kernel_size=1)

    def forward(self, x):
        skips = []
        x = self.in_conv(x)
        skips.append(x)

        for down in self.downs[:-1]:
            x = down(x)
            skips.append(x)
        x = self.downs[-1](x)  # bottleneck, no skip stored for this one

        for up, skip in zip(self.ups, reversed(skips)):
            x = up(x, skip)

        return self.out_conv(x)  # logits


if __name__ == "__main__":
    model = UNet()
    dummy = torch.randn(2, 1, 256, 256)
    out = model(dummy)
    print("Output shape:", out.shape)  # expect (2, 1, 256, 256)
    n_params = sum(p.numel() for p in model.parameters())
    print(f"Params: {n_params:,}")
