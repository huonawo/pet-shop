import re

# Read the corrupted file
with open('src/views/HistoryView.vue', 'rb') as f:
    raw = f.read()

# Find all unique 2-byte sequences after certain patterns
# The files were likely saved in GBK but read as UTF-8
# Try to find text like: confirm('...') where the content is corrupted

# Method: try different encodings
for encoding in ['gbk', 'gb2312', 'gb18030', 'cp1252']:
    try:
        decoded = raw.decode(encoding, errors='strict')
        print(f"Decoded with {encoding}")
        # Save as UTF-8
        with open('src/views/HistoryView.vue', 'w', encoding='utf-8') as f:
            f.write(decoded)
        break
    except Exception as e:
        print(f"Failed {encoding}: {e}")