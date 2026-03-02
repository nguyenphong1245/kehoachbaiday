# -*- coding: utf-8 -*-
"""Ve Hinh 2 - Kien truc tong the tro ly ao ho tro soan KHBD"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

plt.rcParams['font.family'] = 'Times New Roman'
plt.rcParams['font.size'] = 11

fig, ax = plt.subplots(1, 1, figsize=(20, 14))
ax.set_xlim(-1.5, 20)
ax.set_ylim(-2.5, 13.5)
ax.set_aspect('equal')
ax.axis('off')

# ============================================================
# Helpers
# ============================================================
def box(x, y, w, h, title, lines=None, color='#E3F2FD', edge='#1976D2', lw=2, ts=11):
    p = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15",
                        facecolor=color, edgecolor=edge, linewidth=lw)
    ax.add_patch(p)
    cx, cy = x + w/2, y + h/2
    if lines:
        n = len(lines)
        top = cy + n * 0.15 + 0.15
        ax.text(cx, top, title, ha='center', va='center', fontsize=ts,
                fontweight='bold', color='#212121')
        for i, ln in enumerate(lines):
            ax.text(cx, top - 0.5 - i * 0.35, ln, ha='center', va='center',
                    fontsize=8, color='#444', style='italic')
    else:
        ax.text(cx, cy, title, ha='center', va='center', fontsize=ts,
                fontweight='bold', color='#212121')

def darrow(x1, y1, x2, y2, label="", color='#555', fs=8, off=(0, 0.2)):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='<->', color=color, lw=1.8))
    if label:
        ax.text((x1+x2)/2+off[0], (y1+y2)/2+off[1], label, ha='center', va='center',
                fontsize=fs, color=color, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.15', fc='white', ec='none', alpha=0.95))

def sarrow(x1, y1, x2, y2, label="", color='#555', fs=8, off=(0, 0.2)):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.8))
    if label:
        ax.text((x1+x2)/2+off[0], (y1+y2)/2+off[1], label, ha='center', va='center',
                fontsize=fs, color=color, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.15', fc='white', ec='none', alpha=0.95))

def badge(x, y, text):
    ax.text(x, y, text, fontsize=9, fontweight='bold', color='#D32F2F',
            bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFCDD2',
                      edgecolor='#D32F2F', lw=1.2))

# ============================================================
# DOCKER boundary
# ============================================================
dk = FancyBboxPatch((3, 0.3), 15.5, 10.2, boxstyle="round,pad=0.3",
                     facecolor='#FAFAFA', edgecolor='#9E9E9E',
                     linewidth=2.2, linestyle='--')
ax.add_patch(dk)
ax.text(3.5, 10.25, 'Docker Compose Network',
        fontsize=10, fontweight='bold', color='#757575', style='italic')

# ============================================================
# BOXES
# ============================================================

# --- External: User ---
box(-1, 3.8, 3.2, 2.4,
    u'Gi\u00e1o vi\u00ean / H\u1ecdc sinh',
    [u'(Tr\u00ecnh duy\u1ec7t web)'],
    color='#FFF3E0', edge='#E65100', ts=12)

# --- External: Gemini API (above docker) ---
box(7, 11.2, 4.2, 1.5,
    'Gemini API (External)',
    ['gemini-2.5-pro (KHBD)',
     'gemini-2.5-flash (chat, hints)'],
    color='#FCE4EC', edge='#C62828', ts=11)

# --- External: SMTP (below docker) ---
box(3.3, -1.5, 2.6, 1.1,
    'SMTP Server',
    [u'Email x\u00e1c th\u1ef1c t\u00e0i kho\u1ea3n'],
    color='#F5F5F5', edge='#9E9E9E', ts=9)

# --- (4) Frontend ---
box(3.8, 3.2, 3.4, 3.6,
    u'(4) Frontend\nReact 18 + Nginx',
    [':80  Reverse proxy',
     u'/api/* \u2192 Backend',
     u'/ws/* \u2192 Backend',
     u'SSE streaming \u2192 UI',
     u'Giao di\u1ec7n KHBD',
     u'Rich text editor'],
    color='#E0F7FA', edge='#00838F', ts=10)

# --- (3) Backend (CENTER) ---
box(8, 1.5, 4.5, 7,
    u'(3) Backend\nFastAPI + Python',
    [':8000',
     u'Nghi\u1ec7p v\u1ee5 KHBD (SSE streaming)',
     u'X\u00e2y d\u1ef1ng prompt 2 l\u1edbp',
     u'Tr\u1eafc nghi\u1ec7m, phi\u1ebfu h\u1ecdc t\u1eadp',
     u'B\u00e0i t\u1eadp l\u1eadp tr\u00ecnh (sandbox)',
     u'Qu\u1ea3n l\u00fd l\u1edbp h\u1ecdc, \u0111\u00e1nh gi\u00e1',
     u'WebSocket c\u1ed9ng t\u00e1c nh\u00f3m',
     'JWT + CSRF + Refresh token',
     u'Ph\u00e2n quy\u1ec1n: admin / GV / HS'],
    color='#FFFDE7', edge='#F57F17', ts=11)

# --- (2) Neo4j ---
box(14, 7.2, 3.8, 2.2,
    '(2) Neo4j CE',
    [u'\u0110\u1ed3 th\u1ecb tri th\u1ee9c  :7687',
     u'CTGDPT 2018 (CT Tin h\u1ecdc THPT)',
     u'Khung NLS (CV 3456)'],
    color='#E8F5E9', edge='#2E7D32', ts=10)

# --- (1) PostgreSQL ---
box(14, 3.4, 3.8, 3.2,
    '(1) PostgreSQL 16',
    ['Alpine  :5432',
     u'T\u00e0i kho\u1ea3n, phi\u00ean \u0111\u0103ng nh\u1eadp',
     u'KHBD \u0111\u00e3 l\u01b0u',
     u'Tr\u1eafc nghi\u1ec7m, phi\u1ebfu HT',
     u'B\u00e0i t\u1eadp LT, l\u1edbp h\u1ecdc',
     'Token quota'],
    color='#E3F2FD', edge='#1565C0', ts=10)

# --- (5) Piston ---
box(14, 0.8, 3.8, 2,
    '(5) Piston CE',
    [u'Sandbox th\u1ef1c thi m\u00e3 ngu\u1ed3n',
     u'Python, C++, Java  :2000'],
    color='#F3E5F5', edge='#6A1B9A', ts=10)

# ============================================================
# ARROWS
# ============================================================

# 1. User <-> Frontend
darrow(2.2, 5.0, 3.8, 5.0, 'HTTP/S', '#E65100', 9)

# 2. Frontend <-> Backend (/api/*)
darrow(7.2, 6.0, 8.0, 6.0, '/api/*', '#00838F', 8, (0, 0.25))

# 3. Frontend <-> Backend (/ws/*)
darrow(7.2, 4.5, 8.0, 4.5, '/ws/*', '#00838F', 8, (0, -0.28))

# 4. Backend -> Gemini (SDK)
darrow(10.2, 8.5, 9.1, 11.2, 'HTTPS (SDK)', '#C62828', 8, (0.6, 0))

# 5. Backend <-> Neo4j
darrow(12.5, 7.8, 14.0, 8.0, 'Cypher (Bolt)', '#2E7D32', 8, (0, 0.30))

# 6. Backend <-> PostgreSQL
darrow(12.5, 5.0, 14.0, 5.0, 'SQL (asyncpg)', '#1565C0', 8, (0, 0.28))

# 7. Backend <-> Piston
darrow(12.5, 2.5, 14.0, 2.0, 'HTTP (API)', '#6A1B9A', 8, (0, 0.25))

# 8. Backend -> SMTP (one way)
sarrow(9.2, 1.5, 5.5, -0.4, 'SMTP', '#9E9E9E', 8, (-0.3, 0.25))

# ============================================================
# B1-B6 badges with flow descriptions
# ============================================================

# B1: User -> Frontend -> Backend (GV chon bai + cau hinh)
badge(3.3, 7.2, 'B1')
ax.text(4.0, 7.25, u'GV ch\u1ecdn b\u00e0i + c\u1ea5u h\u00ecnh',
        fontsize=7.5, color='#D32F2F', style='italic')
ax.annotate('', xy=(5.2, 6.8), xytext=(3.7, 7.1),
            arrowprops=dict(arrowstyle='->', color='#D32F2F', lw=1, ls='--'))

# B2: Backend -> Neo4j (truy van do thi tri thuc)
badge(13.0, 9.7, 'B2')
ax.text(13.7, 9.75, u'Truy v\u1ea5n CTGDPT + NLS',
        fontsize=7.5, color='#D32F2F', style='italic')
ax.annotate('', xy=(15.5, 9.4), xytext=(13.5, 9.6),
            arrowprops=dict(arrowstyle='->', color='#D32F2F', lw=1, ls='--'))

# B3: Backend builds prompt (right side of Backend box)
badge(8.3, 1.0, 'B3')
ax.text(8.95, 1.05, u'T\u1ea1o prompt 2 l\u1edbp',
        fontsize=7.5, color='#D32F2F', style='italic')
ax.annotate('', xy=(9.5, 1.5), xytext=(9.0, 1.15),
            arrowprops=dict(arrowstyle='->', color='#D32F2F', lw=1, ls='--'))

# B4: Backend -> Gemini
badge(8.0, 10.0, 'B4')
ax.text(8.7, 10.05, u'G\u1eedi prompt \u2192 Gemini',
        fontsize=7.5, color='#D32F2F', style='italic')

# B5: Gemini -> Backend
badge(11.0, 10.0, 'B5')
ax.text(11.7, 10.05, u'Nh\u1eadn KHBD sinh',
        fontsize=7.5, color='#D32F2F', style='italic')

# B6: Backend -> Frontend -> User (SSE stream)
badge(3.3, 2.7, 'B6')
ax.text(4.0, 2.75, u'SSE stream \u2192 GV xem/ch\u1ec9nh',
        fontsize=7.5, color='#D32F2F', style='italic')
ax.annotate('', xy=(5.0, 3.2), xytext=(3.7, 2.9),
            arrowprops=dict(arrowstyle='->', color='#D32F2F', lw=1, ls='--'))

# ============================================================
# Legend - B1-B6 flow summary (bottom left)
# ============================================================
lx, ly = -1.0, -2.2
ax.text(lx, ly, u'Lu\u1ed3ng sinh KHBD (B1\u2013B6):',
        fontsize=9, fontweight='bold', color='#333')
flow_lines = [
    u'B1: Gi\u00e1o vi\u00ean ch\u1ecdn b\u00e0i h\u1ecdc, c\u1ea5u h\u00ecnh ho\u1ea1t \u0111\u1ed9ng \u2192 Frontend \u2192 Backend',
    u'B2: Backend truy v\u1ea5n Neo4j \u2192 l\u1ea5y d\u1eef li\u1ec7u CTGDPT + NLS',
    u'B3: Backend x\u00e2y d\u1ef1ng prompt (v\u00f9ng c\u1ed1 \u0111\u1ecbnh + v\u00f9ng s\u00e1ng t\u1ea1o)',
    u'B4: Backend g\u1eedi prompt \u0111\u1ebfn Gemini API',
    u'B5: Gemini tr\u1ea3 k\u1ebft qu\u1ea3 KHBD \u0111\u00e3 sinh',
    u'B6: Backend stream SSE \u2192 Frontend \u2192 GV xem v\u00e0 ch\u1ec9nh s\u1eeda',
]
for i, fl in enumerate(flow_lines):
    ax.text(lx, ly - 0.38 * (i + 1), fl, fontsize=7.5, color='#555')

# ============================================================
plt.tight_layout()
out = 'D:/KL/WEB1/init/backend/app/services/data/bao/fig2_architecture.png'
plt.savefig(out, dpi=200, bbox_inches='tight', facecolor='white')
print(f"Saved: {out}")
