#pragma once

#include <stdint.h>

namespace WaddleTokens {

constexpr uint8_t GRAY4_LEVELS[4] = {0, 85, 170, 255};

constexpr uint32_t RGB_Grey0 = 0x0c0e10;
constexpr uint8_t GRAY4_Grey0 = 0;
constexpr uint16_t DITHER_Grey0 = 0xefff;
constexpr uint32_t RGB_Grey1 = 0x15181b;
constexpr uint8_t GRAY4_Grey1 = 0;
constexpr uint16_t DITHER_Grey1 = 0xefff;
constexpr uint32_t RGB_Grey2 = 0x1f2327;
constexpr uint8_t GRAY4_Grey2 = 0;
constexpr uint16_t DITHER_Grey2 = 0xefbf;
constexpr uint32_t RGB_Grey3 = 0x2d3237;
constexpr uint8_t GRAY4_Grey3 = 1;
constexpr uint16_t DITHER_Grey3 = 0xafbf;
constexpr uint32_t RGB_Grey4 = 0x474d53;
constexpr uint8_t GRAY4_Grey4 = 1;
constexpr uint16_t DITHER_Grey4 = 0xadaf;
constexpr uint32_t RGB_Grey5 = 0x6a7077;
constexpr uint8_t GRAY4_Grey5 = 1;
constexpr uint16_t DITHER_Grey5 = 0xa5a7;
constexpr uint32_t RGB_Grey6 = 0x969ca2;
constexpr uint8_t GRAY4_Grey6 = 2;
constexpr uint16_t DITHER_Grey6 = 0x8525;
constexpr uint32_t RGB_Grey7 = 0xc1c6cb;
constexpr uint8_t GRAY4_Grey7 = 2;
constexpr uint16_t DITHER_Grey7 = 0x0505;
constexpr uint32_t RGB_Grey8 = 0xe2e5e8;
constexpr uint8_t GRAY4_Grey8 = 3;
constexpr uint16_t DITHER_Grey8 = 0x0401;
constexpr uint32_t RGB_Grey9 = 0xf5f6f7;
constexpr uint8_t GRAY4_Grey9 = 3;
constexpr uint16_t DITHER_Grey9 = 0x0001;
constexpr uint32_t RGB_White = 0xffffff;
constexpr uint8_t GRAY4_White = 3;
constexpr uint16_t DITHER_White = 0x0000;
constexpr uint32_t RGB_IsbreDark = 0x5fb0dc;
constexpr uint8_t GRAY4_IsbreDark = 2;
constexpr uint16_t DITHER_IsbreDark = 0x8525;
constexpr uint32_t RGB_IsbreLight = 0x1b6390;
constexpr uint8_t GRAY4_IsbreLight = 1;
constexpr uint16_t DITHER_IsbreLight = 0xadaf;

constexpr uint8_t GRAY4_LIGHT_Bg = 3;
constexpr uint8_t GRAY4_LIGHT_Surface = 3;
constexpr uint8_t GRAY4_LIGHT_Border = 2;
constexpr uint8_t GRAY4_LIGHT_Text = 0;
constexpr uint8_t GRAY4_LIGHT_Muted = 1;
constexpr uint8_t GRAY4_LIGHT_Accent = 1;
constexpr uint8_t GRAY4_LIGHT_OnAccent = 3;
constexpr uint8_t GRAY4_LIGHT_PenguinInk = 0;
constexpr uint8_t GRAY4_LIGHT_PenguinPaper = 3;
constexpr uint8_t GRAY4_LIGHT_PenguinPlate = 3;

constexpr uint8_t GRAY4_DARK_Bg = 0;
constexpr uint8_t GRAY4_DARK_Surface = 0;
constexpr uint8_t GRAY4_DARK_Border = 1;
constexpr uint8_t GRAY4_DARK_Text = 3;
constexpr uint8_t GRAY4_DARK_Muted = 2;
constexpr uint8_t GRAY4_DARK_Accent = 2;
constexpr uint8_t GRAY4_DARK_OnAccent = 0;
constexpr uint8_t GRAY4_DARK_PenguinInk = 0;
constexpr uint8_t GRAY4_DARK_PenguinPaper = 3;
constexpr uint8_t GRAY4_DARK_PenguinPlate = 1;

constexpr uint8_t BAYER_4X4[16] = {0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5};

constexpr uint16_t BAYER_PATTERN[17] = {
    0x0000,
    0x0001,
    0x0401,
    0x0405,
    0x0505,
    0x0525,
    0x8525,
    0x85a5,
    0xa5a5,
    0xa5a7,
    0xada7,
    0xadaf,
    0xafaf,
    0xafbf,
    0xefbf,
    0xefff,
    0xffff};

inline bool ditherInk(uint16_t pattern, int x, int y) { return (pattern >> (((y & 3) << 2) | (x & 3))) & 1; }

constexpr int SPACE_1 = 4;
constexpr int SPACE_2 = 8;
constexpr int SPACE_3 = 12;
constexpr int SPACE_4 = 16;
constexpr int SPACE_6 = 24;
constexpr int SPACE_8 = 32;
constexpr int SPACE_12 = 48;
constexpr int BORDER_WIDTH = 2;
constexpr int RADIUS_SM = 2;

}
