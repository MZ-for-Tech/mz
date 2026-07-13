import sys

with open("app/page.tsx", "r") as f:
    lines = f.readlines()

# Extract blocks (0-indexed)
partners = lines[228:243]  # 229-243
work = lines[244:337]      # 245-337
products = lines[340:398]  # 341-398

# Modify comments to fix numbering
# Partners was 04, Products was 04. Work didn't have a number comment, but we'll add one or just leave it.
# Let's fix numbering:
# 03 is Services
# Products -> 04
# Work -> 05
# Partners -> 06
products[0] = products[0].replace("04 — Products", "04 — Products")
work.insert(0, "            {/* 05 — Work */}\n")
partners[0] = partners[0].replace("04 — Partners", "06 — Partners")

# Also need to fix Workshop (05 -> 07), TNH Portal (06 -> 08), CTA (07 -> 09)
for i in range(398, len(lines)):
    lines[i] = lines[i].replace("05 — Workshops", "07 — Workshops")
    lines[i] = lines[i].replace("06 — TNH Portal", "08 — TNH Portal")
    lines[i] = lines[i].replace("07 — CTA", "09 — CTA")

# Reassemble
new_lines = lines[:228] + products + ["\n\n"] + work + ["\n\n"] + partners + ["\n\n"] + lines[398:]

with open("app/page.tsx", "w") as f:
    f.writelines(new_lines)
