# Read raw bytes
with open('src/views/HistoryView.vue', 'rb') as f:
    data = f.read()

# Find the position of the confirm line
search = b"if (confirm('"
pos = data.find(search)
print('Position of confirm line:', pos)

# Show bytes around it
context = data[pos:pos+100]
print('Raw bytes:', context)
print()
print('As hex:', context.hex())

# Try fixing with GBK
gbk_content = data.decode('utf-8', errors='ignore')
gbk_fixed = gbk_content.replace("确定要清绌空所有浏览足迹吗？吗？", "确定要清空所有浏览足迹吗？")
with open('src/views/HistoryView.vue', 'w', encoding='utf-8') as f:
    f.write(gbk_fixed)
print('Fixed HistoryView.vue')