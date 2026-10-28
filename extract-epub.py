import zipfile, xml.etree.ElementTree as ET, re, json, os, html

epub_path = r"C:\Users\jonat\.gemini\antigravity\scratch\manga-site\novela\velztek.epub"
out_dir = r"C:\Users\jonat\.gemini\antigravity\scratch\manga-site\novela"

with zipfile.ZipFile(epub_path, "r") as z:
    nav_xml = z.read("EPUB/nav.xhtml").decode("utf-8", errors="ignore")
    # Extract ordered href -> title from nav.xhtml
    links = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', nav_xml, flags=re.S)
    print(f"Found {len(links)} items in nav.xhtml")

    # Remove old cap-*.txt
    for f in os.listdir(out_dir):
        if re.match(r"^cap-\d+\.txt$", f, re.I):
            os.remove(os.path.join(out_dir, f))

    chapters = []
    for idx, (href, raw_title) in enumerate(links, start=1):
        title = html.unescape(re.sub(r"<[^>]+>", "", raw_title)).strip()
        xhtml_path = "EPUB/" + href
        content = z.read(xhtml_path).decode("utf-8", errors="ignore")

        # Extract body
        m = re.search(r"<body[^>]*>(.*?)</body>", content, flags=re.S | re.I)
        body_html = m.group(1) if m else content
        # Remove headings that duplicate the title
        body_html = re.sub(r"<h[1-6][^>]*>.*?</h[1-6]>", "", body_html, flags=re.S | re.I)
        # Convert <br> to newline, </p> or </div> to double newline
        body_html = re.sub(r"<br\s*/?>", "\n", body_html, flags=re.I)
        body_html = re.sub(r"</(p|div|li|blockquote)>", "\n\n", body_html, flags=re.I)
        text = html.unescape(re.sub(r"<[^>]+>", "", body_html))

        # Clean paragraphs
        raw_paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        cleaned_paras = []
        dash_run = False
        for p in raw_paras:
            if re.match(r"^[-—–_\s*]+$", p):
                if not dash_run and cleaned_paras:
                    cleaned_paras.append("* * *")
                dash_run = True
            else:
                dash_run = False
                # Collapse internal single newlines into spaces unless dialogue
                lines = [ln.strip() for ln in p.splitlines() if ln.strip() and not re.match(r"^[-–_]+$", ln.strip())]
                if lines:
                    cleaned_paras.append("\n".join(lines))

        while cleaned_paras and cleaned_paras[-1] == "* * *":
            cleaned_paras.pop()

        body_text = "\n\n".join(cleaned_paras)
        words = len([w for w in re.split(r"\s+", body_text) if w and w != "*"])
        fname = f"cap-{idx:03d}.txt"
        with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
            f.write(title + "\n\n" + body_text + "\n")

        chapters.append({"n": idx, "title": title, "file": fname, "words": words})

manifest_path = os.path.join(out_dir, "manifest.json")
with open(manifest_path, "r", encoding="utf-8") as f:
    mf = json.load(f)

mf["chapters"] = chapters
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(mf, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(chapters)} chapters. First 5:")
for c in chapters[:5]:
    print(f"  #{c['n']}: {c['title']} ({c['words']} words)")
