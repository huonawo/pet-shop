import re

files = [
    'src/views/HistoryView.vue',
    'src/views/LoginView.vue',
    'src/views/CouponsView.vue',
    'src/views/OrderDetailView.vue'
]

# Mapping of corrupted text to correct Chinese
repairs = {
    '锟?': '吗？',  # common corruption
    '纭瀹氳佹竻': '确定要清',
    '烘墍鏈夋祻': '空所有浏览',
    '瑙堣冻杩瑰悧': '足迹吗？',
    '璁叠菇': '密码至',
    '灏戞暟': '少4位',
    '璇蜂唤': '请输',
    '鍏ㄥ': '全',
    '淇℃': '信息',
    '閿欒': '错误',
    '鎴愬姛': '成功',
    '澶辫触': '失败',
    '鏀惰': '收',
    '鍏朵腑': '中',
    '鏈': '',
}

for f in files:
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as rf:
            content = rf.read()
        
        # Fix common patterns
        for wrong, right in repairs.items():
            content = content.replace(wrong, right)
        
        # Remove any remaining replacement chars
        content = content.replace('\ufffd', '')
        
        # Fix specific issues
        content = re.sub(r"'\|[^']*\|'", lambda m: "'" + m.group(0).replace('|', '').replace('锟', '吗').replace('?', '？') + "'", content)
        
        with open(f, 'w', encoding='utf-8') as wf:
            wf.write(content)
        print(f'Repaired: {f}')
    except Exception as e:
        print(f'Error {f}: {e}')