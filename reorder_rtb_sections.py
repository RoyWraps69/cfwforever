#!/usr/bin/env python3
"""Move the Bay Essentials (included) section to the top of the Rent the Bay page content."""
import re

with open('/home/ubuntu/cfwforever/public/rent-the-bay/index.html', encoding='utf-8') as f:
    html = f.read()

# We need to extract the included section and move it before the pricing section.
# Sections are bounded by <section ...> ... </section>

def extract_section(html, section_id):
    """Extract a full <section> block by id."""
    pattern = rf'(<section[^>]*id="{section_id}"[^>]*>.*?</section>)'
    m = re.search(pattern, html, re.DOTALL)
    if m:
        return m.group(1), m.start(), m.end()
    return None, -1, -1

# Extract the included section
included_block, inc_start, inc_end = extract_section(html, 'included')
if not included_block:
    print('ERROR: Could not find #included section')
    exit(1)
print(f'Found #included section: chars {inc_start}–{inc_end}')

# Find the pricing section start
pricing_match = re.search(r'<section[^>]*id="pricing"', html)
if not pricing_match:
    print('ERROR: Could not find #pricing section')
    exit(1)
pricing_start = pricing_match.start()
print(f'Found #pricing section at char {pricing_start}')

if inc_start < pricing_start:
    print('Included section is ALREADY before pricing — no reorder needed')
    exit(0)

# Remove the included section from its current position
html_without_included = html[:inc_start].rstrip() + '\n' + html[inc_end:].lstrip()

# Re-find pricing position after removal
pricing_match2 = re.search(r'<section[^>]*id="pricing"', html_without_included)
if not pricing_match2:
    print('ERROR: Could not find #pricing after removal')
    exit(1)
pricing_start2 = pricing_match2.start()

# Insert included section before pricing
html_reordered = (
    html_without_included[:pricing_start2]
    + included_block + '\n\n'
    + html_without_included[pricing_start2:]
)

with open('/home/ubuntu/cfwforever/public/rent-the-bay/index.html', 'w', encoding='utf-8') as f:
    f.write(html_reordered)

print(f'Done! New page size: {len(html_reordered)} chars')

# Verify new order
ids_in_order = re.findall(r'<section[^>]*id="([^"]+)"', html_reordered)
print('Section order:', ' → '.join(ids_in_order))
