// 预设随机评价数据
const reviewPool = {
  1: [
    { user: '小猫咪的主人', rating: 5, date: '2026-03-15', content: '我家小猫特别爱吃！毛色也变亮了，会回购的。', helpful: 23 },
    { user: '铲屎官小李', rating: 5, date: '2026-03-10', content: '皇家品质值得信赖，颗粒大小适合幼猫，消化也很好。', helpful: 18 },
    { user: '猫咪控', rating: 4, date: '2026-03-08', content: '整体不错，就是价格有点贵，活动的时候买比较划算。', helpful: 12 },
    { user: '橘猫爸爸', rating: 5, date: '2026-03-05', content: '从断奶就开始吃这个，现在三个月了，长得很好！', helpful: 31 },
    { user: '布偶猫奴', rating: 5, date: '2026-02-28', content: '适口性很好，挑食怪也爱吃，便便也正常。', helpful: 15 },
  ],
  2: [
    { user: '柯基妈妈', rating: 5, date: '2026-03-14', content: '六种鱼配方太香了，我家柯基吃得停不下来！', helpful: 27 },
    { user: '金毛爸爸', rating: 5, date: '2026-03-12', content: '无谷物配方对过敏狗狗很友好，推荐！', helpful: 19 },
    { user: '二哈铲屎官', rating: 4, date: '2026-03-09', content: '品质很好，就是颗粒有点大，小型犬可能不太方便吃。', helpful: 8 },
    { user: '拉布拉多控', rating: 5, date: '2026-03-01', content: '吃了两个月，毛发明显变亮了，值得购买。', helpful: 22 },
  ],
  3: [
    { user: '猫咪游乐场', rating: 5, date: '2026-03-16', content: '5件套太值了！每个都不同，我家猫轮流玩。', helpful: 35 },
    { user: '喵星人铲屎官', rating: 4, date: '2026-03-11', content: '质量不错，就是羽毛棒用了几天就秃了。', helpful: 14 },
    { user: '蓝猫主人', rating: 5, date: '2026-03-06', content: '每天逗猫半小时，猫咪运动量够了！', helpful: 20 },
    { user: '奶猫奶爸', rating: 5, date: '2026-02-25', content: '便宜又好用，已经推荐给猫友群了。', helpful: 16 },
    { user: '暹罗猫奴', rating: 4, date: '2026-02-20', content: '铃铛声音有点大，晚上玩会吵，白天用很好。', helpful: 9 },
    { user: '美短控', rating: 5, date: '2026-02-15', content: '弹簧鼠是我家猫的最爱，每天都要叼着跑。', helpful: 11 },
  ],
  4: [
    { user: '静音控', rating: 5, date: '2026-03-13', content: '真的很静音！放在卧室也不影响睡觉。', helpful: 28 },
    { user: '布偶猫舍', rating: 4, date: '2026-03-07', content: '过滤效果不错，就是滤芯需要定期更换。', helpful: 13 },
    { user: '猫咪健康', rating: 5, date: '2026-03-02', content: '自从用了这个，猫咪喝水明显变多了！', helpful: 25 },
    { user: '波斯猫主人', rating: 5, date: '2026-02-22', content: '2L容量够用一周，清洗也方便。', helpful: 17 },
  ],
  5: [
    { user: '泰迪妈妈', rating: 5, date: '2026-03-15', content: '天然牛皮很安全，狗狗啃得开心我也放心。', helpful: 21 },
    { user: '柴犬爸爸', rating: 4, date: '2026-03-09', content: '洁齿效果还行，就是消耗有点快。', helpful: 10 },
    { user: '比熊控', rating: 5, date: '2026-03-03', content: '性价比超高！比宠物店的便宜多了。', helpful: 19 },
    { user: '萨摩耶家长', rating: 5, date: '2026-02-26', content: '狗狗超爱啃，一根能玩半天。', helpful: 14 },
  ],
  6: [
    { user: '除臭达人', rating: 5, date: '2026-03-14', content: '除臭效果很好！家里基本没什么异味了。', helpful: 32 },
    { user: '多猫家庭', rating: 4, date: '2026-03-08', content: '结团确实不错，就是消耗量有点大。', helpful: 15 },
    { user: '英短铲屎官', rating: 5, date: '2026-03-04', content: '低粉尘对鼻炎患者太友好了，终于不用戴口罩铲屎了。', helpful: 28 },
    { user: '加菲猫奴', rating: 5, date: '2026-02-27', content: '可冲马桶太方便了，懒人福音！', helpful: 22 },
    { user: '缅因猫家长', rating: 4, date: '2026-02-18', content: '总体满意，遇水溶解速度可以再快一点。', helpful: 8 },
    { user: '德文卷毛控', rating: 5, date: '2026-02-10', content: '环保材质，用着放心，会一直回购。', helpful: 13 },
  ],
  7: [
    { user: '出差达人', rating: 5, date: '2026-03-12', content: 'APP控制太方便了，出差也能按时喂食！', helpful: 30 },
    { user: '智能养宠', rating: 4, date: '2026-03-06', content: '功能很全，就是APP偶尔会断连。', helpful: 11 },
    { user: '双猫家庭', rating: 5, date: '2026-02-28', content: '3L容量两只猫够用两天，断电记忆很实用。', helpful: 24 },
    { user: '科技铲屎官', rating: 5, date: '2026-02-20', content: '红外检测防卡粮确实有效，用了两周没卡过。', helpful: 18 },
  ],
  8: [
    { user: '遛狗达人', rating: 5, date: '2026-03-11', content: '透气性很好，夏天用也不闷，反光条晚上很安全。', helpful: 22 },
    { user: '大型犬家长', rating: 4, date: '2026-03-05', content: '减压设计不错，狗狗不挣扎了，就是扣带有点紧。', helpful: 9 },
    { user: '柯基爱好者', rating: 5, date: '2026-02-25', content: '可调节设计很好，从小用到大。', helpful: 16 },
    { user: '哈士奇控', rating: 5, date: '2026-02-15', content: '二哈都挣不开的胸背带，质量杠杠的！', helpful: 26 },
  ],
  9: [
    { user: '营养专家', rating: 5, date: '2026-03-13', content: '成分很全面，术后恢复期必备！', helpful: 20 },
    { user: '老猫护理', rating: 5, date: '2026-03-07', content: '老年猫吃了精神好多了，食欲也增加了。', helpful: 17 },
    { user: '挑食克星', rating: 4, date: '2026-03-01', content: '确实能改善挑食，但价格有点高。', helpful: 12 },
    { user: '猫舍主人', rating: 5, date: '2026-02-22', content: '猫舍常备，新猫到家都会喂几天。', helpful: 23 },
  ],
  10: [
    { user: '香氛控', rating: 5, date: '2026-03-14', content: '洗完香香的，而且留香时间很长！', helpful: 25 },
    { user: '宠物美容师', rating: 4, date: '2026-03-08', content: '植物配方温和不刺激，就是起泡性一般。', helpful: 11 },
    { user: '金毛妈妈', rating: 5, date: '2026-03-02', content: '洗完毛发特别柔顺，不干燥。', helpful: 19 },
    { user: '比熊爸爸', rating: 5, date: '2026-02-24', content: '白色狗狗洗完更白了，没有发黄。', helpful: 15 },
  ],
  11: [
    { user: '猫别墅设计师', rating: 5, date: '2026-03-10', content: '多层设计太棒了！我家三只猫都有地方待。', helpful: 29 },
    { user: '猫爬架控', rating: 5, date: '2026-03-04', content: '剑麻柱很耐磨，用了两个月还是很结实。', helpful: 21 },
    { user: '高层养猫', rating: 4, date: '2026-02-26', content: '稳固性不错，但安装有点复杂。', helpful: 10 },
    { user: '布偶猫舍', rating: 5, date: '2026-02-18', content: '猫窝很软乎，猫咪一装好就钻进去睡了。', helpful: 18 },
  ],
  12: [
    { user: '清洁达人', rating: 5, date: '2026-03-15', content: '80抽超大包！一张能擦全身，性价比超高。', helpful: 33 },
    { user: '无香控', rating: 5, date: '2026-03-09', content: '无酒精无香精，对敏感肌宠物很友好。', helpful: 16 },
    { user: '日常护理', rating: 4, date: '2026-03-03', content: '日常擦爪子很方便，就是纸张可以再厚一点。', helpful: 9 },
    { user: '多宠家庭', rating: 5, date: '2026-02-25', content: '猫狗都能用，一包搞定！', helpful: 22 },
    { user: '洁癖铲屎官', rating: 5, date: '2026-02-16', content: '每次遛狗回来必擦，方便又卫生。', helpful: 14 },
  ],
  13: [
    { user: '冻干爱好者', rating: 5, date: '2026-03-14', content: '冻干工艺很棒，保留了食材原味，猫咪超爱吃！', helpful: 28 },
    { user: '英短家长', rating: 5, date: '2026-03-08', content: '颗粒大小刚好，一打开袋子猫咪就冲过来了。', helpful: 19 },
    { user: '多猫铲屎官', rating: 4, date: '2026-03-02', content: '品质不错，就是分量有点少，多猫家庭消耗快。', helpful: 11 },
    { user: '布偶控', rating: 5, date: '2026-02-25', content: '纯鲜肉做的，比淀粉类零食好太多了。', helpful: 22 },
    { user: '暹罗猫奴', rating: 5, date: '2026-02-18', content: '复水后喂给小猫，吃得津津有味。', helpful: 15 },
  ],
  14: [
    { user: '训犬师小王', rating: 5, date: '2026-03-12', content: '训练必备！小颗粒方便携带，狗狗很积极。', helpful: 24 },
    { user: '柯基训练生', rating: 4, date: '2026-03-06', content: '低热量配方不错，训练多了也不怕胖。', helpful: 13 },
    { user: '边牧家长', rating: 5, date: '2026-02-28', content: '边牧很挑食，这个居然爱吃，难得！', helpful: 18 },
    { user: '金毛训练', rating: 5, date: '2026-02-20', content: '一包能用很久，性价比很高。', helpful: 16 },
  ],
  15: [
    { user: '长毛猫家长', rating: 5, date: '2026-03-13', content: '一键除毛太方便了！再也不用手动清理梳子了。', helpful: 26 },
    { user: '萨摩耶妈妈', rating: 4, date: '2026-03-07', content: '梳得很干净，就是换毛季消耗有点大。', helpful: 12 },
    { user: '波斯猫舍', rating: 5, date: '2026-03-01', content: '圆钝梳齿不伤皮肤，敏感肌猫咪也能用。', helpful: 20 },
    { user: '德文卷毛', rating: 5, date: '2026-02-22', content: '短毛猫也能用，清理浮毛效果很好。', helpful: 14 },
  ],
  16: [
    { user: '除臭专家', rating: 5, date: '2026-03-11', content: '全封闭设计真的没味道了！客厅放着也不尴尬。', helpful: 31 },
    { user: '三猫家庭', rating: 5, date: '2026-03-05', content: '空间够大，胖猫进出也自由。', helpful: 22 },
    { user: '加菲猫奴', rating: 4, date: '2026-02-26', content: '带砂漏设计很好，就是清理时需要拆开来。', helpful: 10 },
    { user: '蓝猫家长', rating: 5, date: '2026-02-18', content: '比开放式好太多了，终于不用天天扫地了。', helpful: 17 },
  ],
  17: [
    { user: '拉布拉多控', rating: 5, date: '2026-03-14', content: '橡胶材质很安全，狗狗咬了几个月都没坏。', helpful: 23 },
    { user: '柴犬爸爸', rating: 4, date: '2026-03-08', content: '发声效果不错，就是声音有点大。', helpful: 11 },
    { user: '金毛妈妈', rating: 5, date: '2026-03-02', content: '不规则弹跳太有趣了，狗狗追着跑超开心。', helpful: 19 },
    { user: '哈士奇家长', rating: 5, date: '2026-02-24', content: '二哈终于有玩具能玩超过一周了！', helpful: 25 },
  ],
  18: [
    { user: '猫薄荷控', rating: 5, date: '2026-03-15', content: '我家猫闻到就疯了，抱着打滚超可爱！', helpful: 30 },
    { user: '橘猫爸爸', rating: 4, date: '2026-03-09', content: '猫薄荷味道很正，就是散得有点快。', helpful: 13 },
    { user: '美短铲屎官', rating: 5, date: '2026-03-03', content: '造型可爱，猫咪最喜欢小鱼那个。', helpful: 17 },
    { user: '布偶猫奴', rating: 5, date: '2026-02-25', content: '天然猫薄荷安全放心，多买几个换着用。', helpful: 21 },
    { user: '英短家长', rating: 4, date: '2026-02-16', content: '有些猫对猫薄荷不敏感，我家那只就没反应。', helpful: 8 },
  ],
  19: [
    { user: '肠胃护理', rating: 5, date: '2026-03-12', content: '吃了两周，软便明显改善！500亿活菌不是吹的。', helpful: 27 },
    { user: '老年猫护理', rating: 5, date: '2026-03-06', content: '老年猫肠胃弱，这个益生菌粉很温和。', helpful: 19 },
    { user: '幼猫家长', rating: 4, date: '2026-02-28', content: '拌在猫粮里吃，效果不错就是价格有点贵。', helpful: 11 },
    { user: '猫舍主人', rating: 5, date: '2026-02-20', content: '新猫到家必喂，减少应激引起的肠胃问题。', helpful: 23 },
  ],
  20: [
    { user: '户外遛狗', rating: 5, date: '2026-03-13', content: '一键出水太方便了！单手就能操作。', helpful: 24 },
    { user: '柯基户外', rating: 4, date: '2026-03-07', content: '容量够用，就是夏天遛狗时间长需要装两次。', helpful: 12 },
    { user: '边牧运动', rating: 5, date: '2026-03-01', content: '食品级材质放心，狗狗喝完也不拉肚子。', helpful: 18 },
    { user: '金毛户外', rating: 5, date: '2026-02-22', content: '挂在背包上很方便，爬山必备。', helpful: 15 },
  ],
  21: [
    { user: '猫咪睡眠', rating: 5, date: '2026-03-11', content: '半封闭式太有安全感了，猫咪一进去就不出来。', helpful: 28 },
    { user: '布偶猫窝', rating: 5, date: '2026-03-05', content: '加厚保暖棉很软，冬天用正好。', helpful: 20 },
    { user: '英短家长', rating: 4, date: '2026-02-26', content: '可拆洗设计好评，就是拆洗有点麻烦。', helpful: 10 },
    { user: '暹罗猫奴', rating: 5, date: '2026-02-18', content: '颜值很高，放在客厅也不突兀。', helpful: 16 },
  ],
  22: [
    { user: '口腔护理', rating: 5, date: '2026-03-14', content: 'U型设计很科学，狗狗啃的时候能全方位清洁。', helpful: 25 },
    { user: '泰迪家长', rating: 4, date: '2026-03-08', content: '薄荷味清新口气，就是消耗量有点大。', helpful: 12 },
    { user: '比熊口腔', rating: 5, date: '2026-03-02', content: '每天一根，牙结石确实少了。', helpful: 19 },
    { user: '萨摩耶妈妈', rating: 5, date: '2026-02-24', content: '比刷牙方便多了，狗狗也愿意接受。', helpful: 17 },
    { user: '柯基口腔', rating: 4, date: '2026-02-15', content: '小型犬啃起来有点费劲，建议出小颗粒版。', helpful: 8 },
  ],
  23: [
    { user: '宠物护理师', rating: 5, date: '2026-03-12', content: '安全限位设计很贴心，再也不怕剪出血了。', helpful: 22 },
    { user: '新手铲屎官', rating: 4, date: '2026-03-06', content: 'LED灯很实用，就是刀片需要定期更换。', helpful: 11 },
    { user: '长毛猫家长', rating: 5, date: '2026-02-28', content: '锋利耐用，用了半年还是很好用。', helpful: 18 },
    { user: '多宠家庭', rating: 5, date: '2026-02-20', content: '猫狗通用，一把搞定所有宠物的指甲。', helpful: 15 },
  ],
  24: [
    { user: '激光控', rating: 5, date: '2026-03-13', content: '自动模式太解放双手了！猫咪追着跑半小时。', helpful: 26 },
    { user: '上班族养猫', rating: 5, date: '2026-03-07', content: '上班前打开，下班回来猫咪运动量够了。', helpful: 20 },
    { user: '安全养宠', rating: 4, date: '2026-03-01', content: '低功率激光安全，定时关闭很贴心。', helpful: 13 },
    { user: '布偶猫奴', rating: 5, date: '2026-02-22', content: '随机模式猫咪不会腻，每天都玩得很开心。', helpful: 17 },
  ],
}

export function getReviews(productId) {
  return reviewPool[productId] || []
}

export function getAverageRating(productId) {
  const reviews = getReviews(productId)
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}
