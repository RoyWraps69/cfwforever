#!/usr/bin/env python3
"""
Fix unescaped inch marks (") inside JSON-LD string values.
The pattern: a number followed by " (inch mark) inside a JSON string value.
Replace with the Unicode inch symbol ″ (U+2033) to avoid breaking JSON.
"""
import re, json, os

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
    filepath = p
    html = open(filepath).read()
    state = {'changed': False}
    
    def fix_json_ld(m):
        prefix = m.group(1)
        raw = m.group(2)
        suffix = m.group(3)
        
        try:
            json.loads(raw.strip())
            return m.group(0)  # Already valid
        except json.JSONDecodeError:
            pass
        
        # Replace inch marks: number followed by " followed by a non-JSON-structural char
        # Pattern: digit + " + (space, letter, or dash) — this is an inch mark, not a JSON delimiter
        fixed = re.sub(r'(\d)"(\s|[a-zA-Z\-–—])', r'\1″\2', raw)
        
        # Also handle: "side hustle" pattern — quotes used for emphasis inside JSON strings
        # These are harder — look for " followed by word, then word followed by "
        # Try iterative fixing
        attempts = 0
        while attempts < 10:
            try:
                json.loads(fixed.strip())
                state['changed'] = True
                print(f'  FIXED: {p}')
                return prefix + fixed + suffix
            except json.JSONDecodeError as e:
                pos = e.pos
                # Check what's around the error position
                context = fixed[max(0,pos-5):pos+5]
                # If it's a quote used for emphasis (like "side hustle"), replace with curly quotes
                if pos > 0 and pos < len(fixed):
                    # Check if this looks like an opening or closing emphasis quote
                    before = fixed[pos-1] if pos > 0 else ''
                    after = fixed[pos+1] if pos+1 < len(fixed) else ''
                    
                    if before == ' ' and after.isalpha():
                        # Opening quote: replace with left double quote
                        fixed = fixed[:pos] + '\u201c' + fixed[pos+1:]
                    elif before.isalpha() and (after == ' ' or after == ',' or after == '.'):
                        # Closing quote: replace with right double quote
                        fixed = fixed[:pos] + '\u201d' + fixed[pos+1:]
                    elif before.isalpha() and after == '"':
                        # Closing quote before JSON delimiter
                        fixed = fixed[:pos] + '\u201d' + fixed[pos+1:]
                    else:
                        # Unknown pattern — try replacing with single quote
                        fixed = fixed[:pos] + "'" + fixed[pos+1:]
                
                attempts += 1
        
        print(f'  FAILED to fix: {p}')
        return m.group(0)
    
    new_html = pattern.sub(fix_json_ld, html)
    
    if state['changed']:
        with open(filepath, 'w') as f:
            f.write(new_html)
        print(f'  Saved: {p}')

# Verify
print('\n=== VERIFICATION ===')
for p in pages:
    html = open(p).read()
    for m in pattern.finditer(html):
        raw = m.group(2).strip()
        try:
            json.loads(raw)
        except json.JSONDecodeError as e:
            print(f'  STILL BROKEN: {p.split("/")[1]} — {e.msg} at pos {e.pos}')
            break
    else:
        # Check if any JSON-LD was found
        if pattern.search(html):
            print(f'  OK: {p.split("/")[1]}')
        else:
            print(f'  NO JSON-LD: {p.split("/")[1]}')
