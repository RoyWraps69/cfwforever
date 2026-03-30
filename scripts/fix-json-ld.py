#!/usr/bin/env python3
import re, json

pages = [
    'public/ford-transit-high-roof-wrap-chicago/index.html',
    'public/ford-transit-wrap-chicago/index.html',
    'public/mercedes-sprinter-wrap-chicago/index.html',
    'public/ram-promaster-wrap-chicago/index.html',
    'public/sprinter-high-roof-wrap-chicago/index.html',
    'public/sprinter-van-wrap-cost/index.html',
    'public/vehicle-wraps-vs-magnetic-signs/index.html',
]

pattern = re.compile(r'(<script[^>]*type=["\']application/ld\+json["\'][^>]*>)([\s\S]*?)(</script>)', re.I)

for p in pages:
    html = open(p).read()
    for m in pattern.finditer(html):
        raw = m.group(2).strip()
        try:
            json.loads(raw)
        except json.JSONDecodeError as e:
            pos = e.pos
            start = max(0, pos - 100)
            end = min(len(raw), pos + 100)
            print(f'=== {p.split("/")[1]} ===')
            print(f'Error at pos {pos}: {e.msg}')
            context = raw[start:end]
            print(f'Context: ...{context}...')
            # Mark the error position
            marker_pos = pos - start
            print(' ' * (len('Context: ...') + marker_pos) + '^')
            print()
            break
