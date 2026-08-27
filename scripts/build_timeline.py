from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
YEARS = ROOT / "years"
README = ROOT / "README.md"

entries = []
for path in YEARS.glob("*.md"):
    if path.name == "_template.md":
        continue
    match = re.match(r"^(\d{4})\.md$", path.name)
    if not match:
        continue
    year = int(match.group(1))
    entries.append((year, path))

entries.sort(reverse=True)

rows = []
for year, path in entries:
    if year == 2026:
        label = "🌱 First Year"
    else:
        label = "🛰️ Annual Signal"
    rows.append(f"| **{year}** | `ONLINE` | [{label}]({path.as_posix()}) |")

timeline = "\n".join(rows) if rows else "| — | `OFFLINE` | No transmissions yet |"

content = f'''# 🌌 MY TIMELINE TRACE

> *A tiny signal from one human, sent into the future.*

This is not a blog.  
It is not a résumé.  
It is not an attempt to predict the future.

**It is a time capsule.**

A small record of who I was, what I built, who I loved, what I learned, and what I believed — preserved year by year as the world enters the AI age.

> **I was here. I witnessed this era. I wondered what came next.**

---

## ⏳ The Timeline

| Year | Signal | Record |
|---|---|---|
{timeline}

Every year, GitHub Actions adds another capsule to this archive.

No one needs to remember.  
No one needs to maintain it.

If everything works, another year will simply appear here.

And another.

And another.

---

## 🧭 What Each Year Contains

Each annual capsule is a snapshot of a human life at one point in time:

- 👨‍👩‍👧 **Family** — people I love, memories, and things worth passing on
- 💼 **Work & Craft** — what I built, learned, failed at, and became proud of
- 🧠 **Lessons** — what changed my mind and what I still don't understand
- ❤️ **People & Moments** — ordinary things that may become extraordinary with time
- 🤖 **The AI Era** — what technology changed and what I believed about it
- 🎯 **Looking Forward** — hopes, goals, and things worth protecting
- ✉️ **Letter to Future Me** — a message written across time

The machine keeps the clock.  
**The human provides the meaning.**

---

## 📡 Transmission Protocol

**First transmission:** {min((y for y, _ in entries), default="—")}  
**Latest transmission:** {max((y for y, _ in entries), default="—")}  
**Capsules recorded:** {len(entries)}  
**Frequency:** Once per year  
**Origin:** Earth  
**Destination:** The future  
**Maintained by:** GitHub Actions + one stubborn human

---

## ∞

> *Time does not remember us.*  
> *But sometimes, we leave something behind for it to find.*

If you are reading this decades from now:

**Hello from 2026.**

---

<sub>Started in 2026 · An intentionally small archive of one human life</sub>
'''

README.write_text(content, encoding="utf-8")
print(f"Generated README from {len(entries)} annual capsule(s).")
