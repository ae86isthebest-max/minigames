# 把遊戲打包成一個 HTML（給試玩預覽用）：python3 tools/bundle.py 輸出路徑 [標題]
import re, sys, os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; title = sys.argv[2] if len(sys.argv) > 2 else "偵探檔案"
s = open(os.path.join(D, "index.html"), encoding="utf-8").read()
s = re.sub(r'<script src="([^"]+)"></script>', lambda m: "<script>\n" + open(os.path.join(D, m.group(1)), encoding="utf-8").read().replace("</script", "<\\/script") + "\n</script>", s)
s = re.sub(r'<link rel="(manifest|apple-touch-icon)"[^>]*>\n?', "", s)
s = s.replace('if ("serviceWorker" in navigator) {', 'if (false) {')
s = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*', '', s, flags=re.I)
s = re.sub(r'</head>\s*<body>', '', s); s = re.sub(r'</body>\s*</html>\s*$', '', s)
s = re.sub(r'<title>.*?</title>', '<title>' + title + '</title>', s, count=1)
open(out, "w", encoding="utf-8").write(s)
print(out, len(s.encode()) // 1024, "KB")
