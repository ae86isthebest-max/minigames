/* 主線資料（第 4–51 集；第 11–20 集另有 before 開場生活小場景，第 2–20 集全部固定在露天咖啡店「海風咖啡」外面座位，scene 請做 cafe）—— 劇透，由「主線」thread 產生。載入順序：arc.js 之後、各集 case 檔之前。
   1) ARC.defineCast：固定班底。幕間 cast 用這些 id；案件中出場也可以 look:ARC.look("xu")。
   2) ARC.define：主線旗標的標題和筆記內容。ARC_SETS 寫明哪一集的哪樣東西要加 arc:旗標；下一集的 arcRecap 對這些旗標寫 text/miss。
   3) ARC_INTER[集數].after：貼到該集 C.after。scene 只用 PX.SCENES 現有的；sceneWanted＝建議新做的場景（麵攤、高鐵、安全屋、告別式），做好之前只有對話。
   幕間只聊天、埋伏筆，不放破案線索。
   4) 選擇（arc.js 第 7 點格式）：c_ep5_vow（第 5 集）、c_xu_overnight（第 8 集，許知夏羈絆）、c_zhao_promise（第 12 集，第 15 集幕間會用到）。第 18 集 c_wedding_speech、第 19 集 c_told_xu。全部不影響破案；之後的季度和結局會讀這些旗標，見 劇透_主線聖經.md「選擇旗標表」。 */
ARC.defineCast({
 "wu": {
  "name": "吳子豪",
  "look": {
   "skin": "#e8c09a",
   "hair": "#2a2a2a",
   "hairStyle": "short",
   "top": "#f4f6f6",
   "coat": "#f4f6f6",
   "bottom": "#3a4050",
   "glasses": true
  }
 },
 "xu": {
  "name": "許知夏",
  "look": {
   "skin": "#ecc8a6",
   "hair": "#1e1a18",
   "hairStyle": "bob",
   "top": "#3d6fa8",
   "bottom": "#3d6fa8"
  }
 },
 "zhou": {
  "name": "周振邦",
  "look": {
   "age": "old",
   "skin": "#d8a880",
   "hair": "#6a6a66",
   "hairStyle": "slick",
   "top": "#e9e4da",
   "coat": "#62666e",
   "bottom": "#2a2f3a",
   "tie": "#3a4a6a"
  }
 },
 "ye": {
  "name": "葉晴",
  "look": {
   "skin": "#f0d0b4",
   "hair": "#1e1a18",
   "hairStyle": "pony",
   "top": "#f4f4f0",
   "coat": "#6a6e74",
   "bottom": "#6a6e74",
   "skirt": true
  }
 },
 "ayue": {
  "name": "阿月姨",
  "look": {
   "age": "old",
   "skin": "#d8a880",
   "hair": "#4a4440",
   "hairStyle": "bob",
   "top": "#c84a4a",
   "apron": "#e8e0cc",
   "bottom": "#3a3a44"
  }
 },
 "qian": {
  "name": "錢文德",
  "look": {
   "age": "old",
   "skin": "#e0b48c",
   "hair": "#b8b8b0",
   "hairStyle": "balding",
   "top": "#f4f6f6",
   "coat": "#f4f6f6",
   "bottom": "#2a2a30",
   "glasses": true
  }
 },
 "he": {
  "name": "何沛恩",
  "look": {
   "skin": "#e0b48c",
   "hair": "#3a2a20",
   "hairStyle": "short",
   "top": "#7a8a5a",
   "bottom": "#3a4a6a",
   "hat": "cap",
   "capColor": "#2a3a5a"
  }
 },
 "zhao": {
  "name": "趙德安",
  "look": {
   "age": "old",
   "skin": "#c9a080",
   "hair": "#5a5a56",
   "hairStyle": "short",
   "top": "#3a5a8a",
   "bottom": "#2a3a5a"
  }
 },
 "heimao": {
  "name": "黑貓（老范）",
  "look": {
   "age": "old",
   "skin": "#c9a080",
   "hair": "#2a2a2a",
   "hairStyle": "slick",
   "top": "#1e1e22",
   "bottom": "#2a2a30"
  }
 },
 "li": {
  "name": "黎光耀",
  "look": {
   "skin": "#e8c09a",
   "hair": "#1e1e1e",
   "hairStyle": "slick",
   "top": "#ffffff",
   "bottom": "#1e2230"
  }
 },
 "xuzy": {
  "name": "許振業",
  "look": {
   "age": "old",
   "skin": "#d0a080",
   "hair": "#8a8a84",
   "hairStyle": "balding",
   "top": "#6a5a4a",
   "bottom": "#3a3430",
   "beard": true
  }
 },
 "han": {
  "name": "韓守義",
  "look": {
   "age": "old",
   "skin": "#e0b48c",
   "hair": "#9a9a92",
   "hairStyle": "slick",
   "top": "#e9e4da",
   "coat": "#2a3a5a",
   "bottom": "#2a3a5a",
   "glasses": true
  }
 },
 "longshu": {
  "name": "龍叔",
  "look": {
   "age": "old",
   "skin": "#c08a60",
   "hair": "#d8d8d0",
   "hairStyle": "short",
   "top": "#f4f4f0",
   "bottom": "#3a3a3a"
  }
 },
 "dengta": {
  "name": "司機",
  "look": {
   "skin": "#d8a880",
   "hair": "#1e1e1e",
   "hairStyle": "short",
   "top": "#1e1e22",
   "bottom": "#1e1e22"
  }
 },
 "doufa": {
  "name": "豆花",
  "note": "拉布拉多鑑識犬，需要新做狗的 sprite"
 },
 "kui": {
  "name": "陳葵",
  "look": {
   "skin": "#f0d0b4",
   "hair": "#5a3a2a",
   "hairStyle": "bob",
   "top": "#3d6fa8",
   "bottom": "#3d6fa8"
  }
 },
 "xiaoying": {
  "name": "吳小瑩",
  "look": {
   "skin": "#ecc8a6",
   "hair": "#2a2a2a",
   "hairStyle": "long",
   "top": "#e8a0b0",
   "bottom": "#4a5a8a",
   "skirt": true
  }
 },
 "barista": {
  "name": "咖啡店老闆",
  "look": {
   "skin": "#d8a880",
   "hair": "#3a2a20",
   "hairStyle": "short",
   "top": "#f4f0e6",
   "apron": "#6a4a2a",
   "bottom": "#3a3430",
   "beard": true
  }
 },
 "su": {
  "name": "蘇律師",
  "look": {
   "skin": "#e8c09a",
   "hair": "#2a2a2a",
   "hairStyle": "slick",
   "top": "#f4f6f6",
   "coat": "#1e2a4a",
   "bottom": "#1e2a4a",
   "tie": "#8a2a2a",
   "glasses": true
  }
 },
 "abin": {
  "name": "阿彬",
  "look": {
   "skin": "#d8a880",
   "hair": "#2a2a2a",
   "hairStyle": "short",
   "top": "#e85a3a",
   "bottom": "#3a4a6a",
   "hat": "cap",
   "capColor": "#2a2a2a"
  }
 },
 "cai": {
  "name": "蔡明宏",
  "note": "外觀用第 14 集的 cai"
 },
 "zhaosi": {
  "name": "趙思妤",
  "look": {
   "skin": "#ecc8a6",
   "hair": "#1e1a18",
   "hairStyle": "long",
   "top": "#5a7a5a",
   "bottom": "#3a4050"
  }
 },
 "weiguo": {
  "name": "魏國良",
  "look": {
   "age": "old",
   "skin": "#d8a880",
   "hair": "#9a9a92",
   "hairStyle": "balding",
   "top": "#c8c0a8",
   "bottom": "#3a3a3a",
   "glasses": true
  }
 },
 "ajun": {
  "name": "阿駿",
  "look": {
   "skin": "#c9a080",
   "hair": "#2a2a2a",
   "hairStyle": "short",
   "top": "#e9e4da",
   "bottom": "#2a3a5a"
  }
 },
 "abinmom": {
  "name": "阿彬媽媽",
  "look": {
   "age": "old",
   "skin": "#d8a880",
   "hair": "#4a4440",
   "hairStyle": "bob",
   "top": "#7a9a7a",
   "bottom": "#3a3a44"
  }
 },
 "deng": {
  "name": "鄧志強",
  "look": {
   "age": "old",
   "skin": "#d8a880",
   "hair": "#4a4a46",
   "hairStyle": "short",
   "top": "#2a2a30",
   "bottom": "#2a2a30"
  }
 },
 "fang": {
  "name": "方以誠",
  "look": {
   "skin": "#e8c09a",
   "hair": "#2a2a2a",
   "hairStyle": "short",
   "top": "#f4f6f6",
   "coat": "#2a2a30",
   "bottom": "#2a2a30",
   "glasses": true
  }
 },
 "jinshui": {
  "name": "黃金水",
  "look": {
   "age": "old",
   "skin": "#d8a880",
   "hair": "#8a8a84",
   "hairStyle": "short",
   "top": "#e9e4da",
   "bottom": "#3a3a3a"
  }
 },
 "zhouyiqing": {
  "name": "周昀安",
  "look": {
   "age": "young",
   "skin": "#f0d0b0",
   "hair": "#1e1a18",
   "hairStyle": "long",
   "top": "#ffffff",
   "bottom": "#2e3a5a"
  }
 },
 "heigou": {
  "name": "黑狗",
  "look": {
   "age": "adult",
   "skin": "#c89870",
   "hair": "#141414",
   "hairStyle": "short",
   "top": "#1e1e1e",
   "bottom": "#3a3a3a"
  }
 }
});

ARC.define({
 "xu_met": {
  "title": "台北的鑑識員",
  "text": "台北飯店案的鑑識員許知夏，說話很衝，但每次都對。",
  "ep": 4
 },
 "evroom_rumor": {
  "title": "「東西進去不一定出得來」",
  "text": "台北飯店保全主任鄧志強（前澄港警察）說：澄港那邊的證物室，東西進去不一定出得來。",
  "ep": 4
 },
 "tipoff_call": {
  "title": "通風報信的電話",
  "text": "綁架案交贖金時，有人用隱藏號碼打給綁匪，說「第二台是警察」。是誰打的？",
  "ep": 5
 },
 "flood_writeoff": {
  "title": "倉庫淹水報廢",
  "text": "2023 年颱風，分局倉庫淹水，一批裝備報廢。記者何沛恩問：報廢了幾把槍？",
  "ep": 6
 },
 "zhao_sidearm": {
  "title": "趙德安的配槍",
  "text": "巡佐趙德安說他的配槍「早就交回去了」，一提到就轉開話題。",
  "ep": 7
 },
 "prop_gun": {
  "title": "道具倉裡的真槍",
  "text": "密室逃脫工作室的道具倉裡有一把序號被磨掉的真警槍，老闆說是向一個戴帽子的男人買的。",
  "ep": 8
 },
 "gun_zhao": {
  "title": "槍的主人",
  "text": "序號還原：那把槍是趙德安的配槍，登記為 2023 年淹水報廢。周隊長說交給督察組。",
  "ep": 9
 },
 "shen_reaction": {
  "title": "許振業的反應",
  "text": "許知夏的父親、前鑑識組長許振業，聽到你姓沈時愣住了。",
  "ep": 10
 },
 "uncle_shen": {
  "title": "舅舅沈國棟",
  "text": "你的舅舅沈國棟也是警察，15 年前在分局「擦槍走火」死亡，3 天就結案。",
  "ep": 10
 },
 "second_gun": {
  "title": "第二把報廢槍",
  "text": "銀樓搶匪用的槍是第二把「淹水報廢」的警槍，也是向漁港戴帽男人買的。不是一個人倒楣，是有人在賣。",
  "ep": 11
 },
 "zhao_confess": {
  "title": "「上面的人」",
  "text": "趙德安承認為了還賭債賣了槍：「上面的人說報淹水就沒事。」他不肯說是誰，被送進安全屋。",
  "ep": 12
 },
 "evroom_drugs": {
  "title": "證物室的毒品",
  "text": "KTV 案的毒品袋上有證物室防盜標記染料。檢察官葉晴的弟弟吸了同一批毒品過量。",
  "ep": 13
 },
 "notebook_y": {
  "title": "老鄭的筆記本",
  "text": "證物室管理員老鄭偷偷盤點，筆記本列出對不上的報廢品，頁邊寫著「Y」。",
  "ep": 14
 },
 "ext_4417": {
  "title": "分機 4417",
  "text": "趙德安死前接到一通播他女兒聲音的電話，來自局內分機 4417，和綁架案通風報信是同一條總機線路。",
  "ep": 15
 },
 "harbour_crate": {
  "title": "空的魷魚貨箱",
  "text": "漁港冷凍庫角落有一個貨單寫「海龍漁業」的空貨箱，豆花嗅到槍油味。龍叔說是別人寄放的。",
  "ep": 16
 },
 "third_gun": {
  "title": "第三把報廢槍",
  "text": "廟會槍殺案用的是第三把「淹水報廢」警槍。槍被丟進海裡，沒找到。",
  "ep": 17
 },
 "xuzy_wants_meet": {
  "title": "許振業想見你",
  "text": "許知夏說她父親想見你一面，沒說為甚麼。",
  "ep": 18
 },
 "xuzy_slip": {
  "title": "「沈組長那件事」",
  "text": "許振業喝醉時說漏：「當年沈組長那件事……葛仔有拍照……」沈組長，就是你舅舅沈國棟。",
  "ep": 19
 },
 "photo_box_2011": {
  "title": "空的底片格",
  "text": "退休攝影師葛振民的底片箱，標著「2011」的那一格是空的。不是兇手拿的。",
  "ep": 19
 },
 "he_usb": {
  "title": "何沛恩的隨身碟",
  "text": "記者何沛恩被人跟蹤，把一支加密的隨身碟交給你：「如果我出事就打開。」密碼打不開。",
  "ep": 20
 },
 "shen_photo": {
  "title": "被刮掉的臉",
  "text": "有人把一張 2011 年的舊照片留給你：分局門口，舅舅和三個同事，其中一人的臉被刮掉。",
  "ep": 21
 },
 "duty_roster": {
  "title": "2011 年值班表影本",
  "text": "舅舅死的那晚，分局值班表上有周振邦、證物室的蔡明宏（當時是工讀生）和兩位已退休的人。",
  "ep": 22
 },
 "roster_torn": {
  "title": "被撕掉的那一頁",
  "text": "舊醫院檔案庫裡的值班表原件，那一晚的頁被撕掉了。",
  "ep": 23
 },
 "hat_man_seen": {
  "title": "阿帽",
  "text": "把你們鎖在地下室的，是賣槍的「阿帽」。他跑了。",
  "ep": 23
 },
 "xuzy_confess": {
  "title": "許振業的告白",
  "text": "2011 年，上面的人要許振業把彈道報告改成「與沈國棟配槍相符」。其實不相符。",
  "ep": 24
 },
 "shen_murder": {
  "title": "他殺",
  "text": "沈國棟不是擦槍走火。殺他的子彈，來自第 17 集廟會案那把「報廢槍」。那把槍 2011 年就已經在外面。",
  "ep": 25
 },
 "zhou_taken": {
  "title": "周振邦被帶走",
  "text": "因為值班表上有他，周振邦被督察組帶回調查。",
  "ep": 25
 },
 "y_payphone": {
  "title": "漁港的公共電話",
  "text": "黑貓說：Y 不用手機，用漁港冰店旁邊那支公共電話。",
  "ep": 26
 },
 "ye_task_force": {
  "title": "專案小組",
  "text": "檢察官葉晴和你組成專案小組。",
  "ep": 27
 },
 "harbour_route": {
  "title": "海龍會的碼頭",
  "text": "灰燼的貨從海龍會碼頭運出去。龍叔交出了船長，說自己只賣魚。",
  "ep": 28
 },
 "he_takedown": {
  "title": "被下架的影片",
  "text": "何沛恩揭發報廢槍的影片被「應警方要求」下架。",
  "ep": 29
 },
 "y_writes_zheng": {
  "title": "「証物」",
  "text": "何沛恩的匿名線人每次都寫「証物」，不寫「證物」。",
  "ep": 29
 },
 "kidnap_leak": {
  "title": "誰說出去的？",
  "text": "綁匪知道指揮所改了計畫。有人把消息傳了出去。",
  "ep": 30
 },
 "kidnap_saved": {
  "title": "小瑩獲救",
  "text": "小瑩在漁船「海順 3 號」的冰艙裡被救出。綁匪是阿帽和冰店店員阿駿。",
  "ep": 31
 },
 "blackcat_exposed": {
  "title": "黑貓的電話",
  "text": "黑貓在天亮前打電話告訴你小瑩在哪裡。這通電話讓所有人知道他在幫警察。",
  "ep": 31
 },
 "su_rep_hat": {
  "title": "那麼快的律師",
  "text": "阿帽被捕後一句話都不說。咖啡店隔壁桌的蘇律師一早就來當他的辯護人。",
  "ep": 31
 },
 "blackcat_notes": {
  "title": "鴿舍裡的小冊子",
  "text": "黑貓的小冊子最後一頁：「Y 有証物室的鑰匙。Y 每個月 15 號去漁港打電話。」",
  "ep": 32
 },
 "compartment_found": {
  "title": "C 區的夾層",
  "text": "證物室 C 區鐵架下的夾層裡有三個空的警槍盒，序號對上三把「報廢槍」。",
  "ep": 33
 },
 "y_print": {
  "title": "半枚指紋",
  "text": "夾層裡的手寫取用紀錄寫著「証」，紙上有半枚指紋。",
  "ep": 33
 },
 "y_deduced": {
  "title": "只剩一個人",
  "text": "指紋、筆跡、電話時間、鑰匙、誰知道指揮所位置……只剩一個人。",
  "ep": 34
 },
 "cafe_knows": {
  "title": "老闆怎麼會知道？",
  "text": "彈頭要送台北的假消息只在局裡講過。咖啡店老闆卻問你：「聽說彈頭要送台北？」",
  "ep": 34
 },
 "y_revealed": {
  "title": "Y",
  "text": "局內線人是證物室副管理員蔡明宏。他說：「我十九歲那年，就沒得選了。」",
  "ep": 35
 },
 "y_dead": {
  "title": "「海……」",
  "text": "蔡明宏在押送途中被狙擊。死前只說了一個字：「海……」",
  "ep": 35
 },
 "barista_arrested": {
  "title": "海風咖啡的老闆",
  "text": "咖啡店老闆梁文海承認收錢把警察在店裡說的話傳出去。蘇律師當他的辯護人。",
  "ep": 35
 },
 "x_outside": {
  "title": "X 還在外面",
  "text": "黎光耀：「Y 死了，X 還在外面。」",
  "ep": 35
 },
 "shen_framed": {
  "title": "你的配槍",
  "text": "殺死林正雄的子彈，來自你的配槍。你被停職。",
  "ep": 36
 },
 "lin_executed": {
  "title": "不是搶劫",
  "text": "林正雄是被處決的，收銀機是事後才撬開的。他死前說：「有人叫我閉嘴。」",
  "ep": 36
 },
 "gun_swapped": {
  "title": "21:31 的刷卡",
  "text": "有人用複製的員警卡在 21:31 把你的配槍領出去，22:48 還回來。身高約 172 公分。",
  "ep": 37
 },
 "raincoat_again": {
  "title": "又是雨衣",
  "text": "槍械室走廊的人穿著連帽雨衣。和 2011 年那晚拖洗台階的人一樣。",
  "ep": 37
 },
 "home_bugged": {
  "title": "煙霧偵測器",
  "text": "你家的煙霧偵測器裡有竊聽器。裝的人假扮瓦斯檢查員，手臂上有黑狗的刺青。",
  "ep": 38
 },
 "cafe_skimmer": {
  "title": "櫃台下的小盒子",
  "text": "你的員警卡是在咖啡店被複製的。讀卡器是舊老闆裝的。",
  "ep": 38
 },
 "deng_tip": {
  "title": "黃金水的新車",
  "text": "鄧志強說：2011 年值班表上的黃金水，最近換了一台進口車。",
  "ep": 39
 },
 "bail_granted": {
  "title": "交保",
  "text": "法官駁回羈押。你交保，但停職繼續。",
  "ep": 40
 },
 "he_article_good": {
  "title": "〈被陷害的刑警〉",
  "text": "何沛恩寫了一篇替你說話的報導。",
  "ep": 40
 },
 "he_article_bad": {
  "title": "〈停職刑警與消失的證物〉",
  "text": "何沛恩寫了一篇對你不利的報導。",
  "ep": 40
 },
 "he_article_neutral": {
  "title": "何沛恩的報導",
  "text": "何沛恩寫了一篇中立的報導。",
  "ep": 40
 },
 "ayue_collector": {
  "title": "收保護費的人",
  "text": "阿月姨說：以後保護費交給一個退休的警察管。圓臉、開新車、戴金錶。",
  "ep": 41
 },
 "shen_last_case": {
  "title": "舅舅最後的案子",
  "text": "舅舅最後在查 2010 年 12 月 24 日漁港失蹤的 8 歲男孩陳小安。筆記最後一頁：「小安看到的東西，就是那些槍。」",
  "ep": 42
 },
 "boy_alive": {
  "title": "3 號冰攤",
  "text": "陳小安那晚沒有死。他被魚市 3 號冰攤的「莊太太」帶走了。",
  "ep": 42
 },
 "shelter_escaped": {
  "title": "防空洞",
  "text": "有人打開防潮閘門想淹死你們。管理亭裡有黑狗的菸蒂。",
  "ep": 43
 },
 "abin_is_xiaoan": {
  "title": "陳小安",
  "text": "指紋卡比對：咖啡店的阿彬，就是陳小安。",
  "ep": 43
 },
 "nine_fingers": {
  "title": "少一根手指",
  "text": "阿彬記得：雨衣、冰櫃，還有一個左手少了一根手指的人。",
  "ep": 43
 },
 "executor_caught": {
  "title": "一隻手",
  "text": "黃金水承認用複製卡領槍、殺林正雄、嫁禍給你。他說：「上面的人叫我做的。我只是一隻手。」",
  "ep": 44
 },
 "not_x": {
  "title": "不是他",
  "text": "黃金水左手五根手指都在。他不是阿彬記得的那個人。",
  "ep": 44
 },
 "executor_dead": {
  "title": "看守所的早晨",
  "text": "黃金水翻供後死在看守所。心肌梗塞，自然死亡。",
  "ep": 45
 },
 "shen_indicted": {
  "title": "起訴",
  "text": "方以誠檢察官起訴了你。",
  "ep": 45
 },
 "xu_to_taipei": {
  "title": "調回台北",
  "text": "許知夏被調回台北。",
  "ep": 45
 },
 "team_split": {
  "title": "只剩一個人",
  "text": "周振邦調去交通大隊。團隊散了。",
  "ep": 45
 },
 "xu_flashlight": {
  "title": "鑑識手電筒",
  "text": "許知夏臨走前把她的鑑識手電筒留給你。",
  "ep": 45
 },
 "zhou_traffic_help": {
  "title": "交通大隊的監視器",
  "text": "周振邦說：交通大隊也有很多監視器。",
  "ep": 45
 },
 "tuna_heavy": {
  "title": "太重的貨箱",
  "text": "海龍漁業幾箱冷凍鮪魚，每箱比標示重 4 到 6 公斤。你記下了貨箱編號和進港日期。",
  "ep": 46
 },
 "accountant_code": {
  "title": "頁邊的數字",
  "text": "周昀安給你一本《小王子》，頁邊有她媽媽用鉛筆寫的數字。",
  "ep": 47
 },
 "money_trail": {
  "title": "錢去了哪裡",
  "text": "海龍漁業 → 鼎盛海運 → 三家人頭公司 → 台北華晟投資顧問。三年約 3.2 億元。",
  "ep": 48
 },
 "huasheng": {
  "title": "同一層樓",
  "text": "華晟投資顧問的地址，和一家律師事務所在同一棟大樓、同一層。",
  "ep": 48
 },
 "alibi_proven": {
  "title": "22:14:52",
  "text": "外送員在 22:14:52 拍到你開門。槍聲在 22:15:40。你不可能開那一槍。",
  "ep": 49
 },
 "xu_back": {
  "title": "一週的假",
  "text": "許知夏請假，自己出錢從台北回來。",
  "ep": 49
 },
 "witness_saved": {
  "title": "船屋",
  "text": "你從船屋把受傷的黑狗救了出來。他願意作證。",
  "ep": 50
 },
 "shen_reinstated": {
  "title": "配槍",
  "text": "起訴撤回。你復職了，配槍還給了你。",
  "ep": 50
 },
 "su_arrested": {
  "title": "最右邊那桌",
  "text": "蘇明哲律師以幫助犯罪、洗錢被捕。",
  "ep": 50
 },
 "taipei_network": {
  "title": "台北",
  "text": "華晟在台北，蘇的事務所在台北也有分所。他們在台北也有人。",
  "ep": 50
 }
});

var ARC_SETS = {
 "xu_met": "第 4 集：許知夏第一次出場的問題或事件",
 "evroom_rumor": "第 4 集：鄧志強說證物室那句的問題",
 "tipoff_call": "第 5 集：綁匪供詞「有人打來說第二台是警察」",
 "flood_writeoff": "第 6 集：牆上報紙物件／何沛恩的問題",
 "zhao_sidearm": "第 7 集：問趙德安配槍的問題",
 "prop_gun": "第 8 集：道具倉真槍物件",
 "gun_zhao": "第 9 集：化驗電話（event 或 report）",
 "shen_reaction": "第 10 集：許振業愣住的場面",
 "uncle_shen": "第 10 集：ARC_INTER[10].after 看完時設定（已寫好）",
 "second_gun": "第 11 集：彈道報告",
 "zhao_confess": "第 12 集：趙德安的供詞",
 "evroom_drugs": "第 13 集：紫外光毒品袋化驗",
 "notebook_y": "第 14 集：老鄭筆記本物件",
 "ext_4417": "第 15 集：電信回覆或市話錄音",
 "harbour_crate": "第 16 集：豆花嗅貨箱（物件或動作）",
 "third_gun": "第 17 集：彈道報告",
 "xuzy_wants_meet": "第 18 集：after 幕間（已寫在 ARC_INTER[18].after，可加 arc 欄位）",
 "xuzy_slip": "第 19 集：問許振業時說漏的那一題",
 "photo_box_2011": "第 19 集：書房底片箱物件",
 "he_usb": "第 20 集：何沛恩交隨身碟的事件",
 "shen_photo": "第 21 集 after（已寫，arc 欄位）",
 "duty_roster": "第 22 集：垃圾袋裡的值班表影本物件",
 "roster_torn": "第 23 集：撕掉的頁物件",
 "hat_man_seen": "第 23 集：監視器／機車胎痕推出阿帽",
 "xuzy_confess": "第 24 集：許振業告白",
 "shen_murder": "第 25 集：推理全對或揭曉",
 "zhou_taken": "第 25 集結尾事件",
 "y_payphone": "第 26 集 after（已寫）",
 "ye_task_force": "第 27 集結尾",
 "harbour_route": "第 28 集：碼頭夜間影像",
 "he_takedown": "第 29 集：何沛恩的問題",
 "y_writes_zheng": "第 29 集：簡訊物件",
 "kidnap_leak": "第 30 集結尾事件",
 "kidnap_saved": "第 31 集結案",
 "blackcat_exposed": "第 31 集 05:10 黑貓來電事件",
 "su_rep_hat": "第 31 集結尾事件",
 "blackcat_notes": "第 32 集鴿舍小冊子物件",
 "compartment_found": "第 33 集豆花嗅到夾層",
 "y_print": "第 33 集取用紀錄物件",
 "y_deduced": "第 34 集推理全對",
 "cafe_knows": "第 34 集咖啡店老闆那句（after 已寫，arc 欄位）",
 "y_revealed": "第 35 集逮捕",
 "y_dead": "第 35 集押送事件",
 "barista_arrested": "第 35 集結尾",
 "x_outside": "第 35 集 after（已寫）",
 "shen_framed": "第 36 集結尾彈道報告",
 "lin_executed": "第 36 集推理全對",
 "gun_swapped": "第 37 集推理全對",
 "raincoat_again": "第 37 集（只在 arc:shen_murder 時，走廊監視器物件）",
 "home_bugged": "第 38 集竊聽器物件",
 "cafe_skimmer": "第 38 集讀卡器物件",
 "deng_tip": "第 39 集 after（已寫）",
 "bail_granted": "第 40 集判決",
 "he_article_good": "第 40 集結尾（依 c_help_he / c_help_he2）",
 "he_article_bad": "第 40 集結尾（c_usb_li 且無 c_help_he）",
 "he_article_neutral": "第 40 集結尾（其他）",
 "ayue_collector": "第 41 集 after（已寫）",
 "shen_last_case": "第 42 集筆記本物件",
 "boy_alive": "第 42 集推理全對",
 "shelter_escaped": "第 43 集逃出",
 "abin_is_xiaoan": "第 43 集 after（已寫）",
 "nine_fingers": "第 43 集 after（已寫，第二個 arc）",
 "executor_caught": "第 44 集結案",
 "not_x": "第 44 集觀察題（需 arc:nine_fingers）",
 "executor_dead": "第 45 集推理全對或揭曉",
 "shen_indicted": "第 45 集結尾",
 "xu_to_taipei": "第 45 集結尾",
 "team_split": "第 45 集 after（已寫）",
 "xu_flashlight": "第 45 集結尾（c_thank_xu、c_xu_overnight、c_told_xu 任兩個）",
 "zhou_traffic_help": "第 45 集結尾（c_roster_zhou）",
 "tuna_heavy": "第 46 集過磅台物件（記下編號）",
 "accountant_code": "第 47 集結案（after 已寫，arc 欄位）",
 "money_trail": "第 48 集推理全對或揭曉",
 "huasheng": "第 48 集大樓住戶名牌",
 "alibi_proven": "第 49 集結案",
 "xu_back": "第 49 集 before（已寫，arc 欄位）",
 "witness_saved": "第 50 集救出黑狗",
 "shen_reinstated": "第 50 集結尾",
 "su_arrested": "第 50 集結尾",
 "taipei_network": "第 50 集 after（已寫，arc 欄位）"
};

var ARC_INTER = {
 "2": {
  "before": {
   "title": "傍晚・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   },
   "cast": [
    {
     "id": "barista",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（局對面轉角的露天咖啡店「海風咖啡」。你和小吳坐在外面，風有點大，遮雨棚啪啪作響。）"
    },
    {
     "who": "barista",
     "text": "颱風好像要轉過來了。今天早點收店。"
    },
    {
     "who": "wu",
     "text": "學長，你颱風天都在幹嘛？"
    },
    {
     "who": "you",
     "text": "睡覺。"
    },
    {
     "who": "wu",
     "text": "真好……我每次颱風天都會被叫回去加班。"
    },
    {
     "who": "barista",
     "text": "沈先生，照舊美式不加糖？"
    },
    {
     "who": "you",
     "text": "嗯。"
    },
    {
     "who": "narr",
     "text": "（你們不知道，今晚的颱風夜會很長。）"
    }
   ]
  }
 },
 "3": {
  "before": {
   "title": "早上・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   },
   "cast": [
    {
     "id": "barista",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "barista",
     "text": "聽說你們上個案子熬了一整晚？"
    },
    {
     "who": "wu",
     "text": "老闆你怎麼什麼都知道？"
    },
    {
     "who": "barista",
     "text": "警察喝咖啡的時候話很多。"
    },
    {
     "who": "narr",
     "text": "（他擦著杯子，像是隨口問。）"
    },
    {
     "who": "barista",
     "text": "那個案子，最後是誰做的？"
    },
    {
     "who": "barista",
     "text": "那個案子，最後是誰做的？",
     "id": "ep3_tell",
     "choices": [
      {
       "text": "「結案了。」",
       "say": [
        {
         "who": "barista",
         "text": "……好，好，不問。"
        }
       ]
      },
      {
       "text": "跟他講個大概",
       "set": "m_leak_cafe_3",
       "say": [
        {
         "who": "barista",
         "text": "原來如此……你們真辛苦。"
        },
        {
         "who": "narr",
         "text": "（他聽得很專心，連杯子都忘了擦。）"
        }
       ]
      }
     ]
    }
   ]
  }
 },
 "4": {
  "after": {
   "title": "回程高鐵",
   "cast": [
    {
     "id": "wu",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "wu",
     "text": "那個鑑識員好兇，說我手套戴反了。"
    },
    {
     "who": "you",
     "text": "你是戴反了。"
    },
    {
     "who": "wu",
     "text": "（滑手機）她叫許知夏……欸，她申請調來我們這邊耶。"
    },
    {
     "who": "you",
     "text": "……"
    },
    {
     "who": "wu",
     "text": "學長你剛剛是不是笑了？"
    }
   ],
   "arc": "xu_met_talk",
   "sceneWanted": "train"
  },
  "before": {
   "title": "早上・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   },
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "barista",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（小吳拖著一個登機箱來。）"
    },
    {
     "who": "wu",
     "text": "學長，你行李呢？"
    },
    {
     "who": "you",
     "text": "背包。"
    },
    {
     "who": "wu",
     "text": "你出差只帶一個背包？"
    },
    {
     "who": "barista",
     "text": "要出遠門？外帶兩杯？"
    },
    {
     "who": "wu",
     "text": "老闆你又知道了！"
    },
    {
     "who": "barista",
     "text": "行李箱很好認。"
    }
   ]
  }
 },
 "5": {
  "after": {
   "title": "收工之後・阿月姨麵攤",
   "cast": [
    {
     "id": "ayue",
     "x": 40
    },
    {
     "id": "wu",
     "x": 80
    },
    {
     "id": "zhou",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "ayue",
     "text": "周隊長，又帶小朋友來吃宵夜喔？"
    },
    {
     "who": "wu",
     "text": "隊長，綁匪說有人打電話告訴他第二台是警察。會不會是他亂講？"
    },
    {
     "who": "zhou",
     "text": "吃麵。案子破了，孩子平安，就好。"
    },
    {
     "who": "you",
     "text": "（要不要說出你的想法？）",
     "id": "ep5_vow",
     "choices": [
      {
       "text": "「那通電話，我會查到是誰打的。」",
       "set": "c_ep5_vow",
       "say": [
        {
         "who": "zhou",
         "text": "……先把麵吃完再說。"
        }
       ]
      },
      {
       "text": "（不說話，低頭吃麵）",
       "say": "你把話吞了回去。"
      }
     ]
    },
    {
     "who": "ayue",
     "text": "你們這些警察，連吃飯都在講案子。"
    },
    {
     "who": "narr",
     "text": "（沈岳看著湯，沒動筷子。）"
    }
   ],
   "arc": "noodle_first",
   "sceneWanted": "noodle"
  },
  "before": {
   "title": "早上・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   },
   "cast": [
    {
     "id": "zhou",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（一個頭髮梳得整齊的中年男人在你們桌邊坐下。他是你的上司，大隊長周振邦。）"
    },
    {
     "who": "zhou",
     "text": "台北的事辦得不錯。那邊有人打電話來誇你們。"
    },
    {
     "who": "wu",
     "text": "是誰？是不是那個很兇的鑑識員？"
    },
    {
     "who": "zhou",
     "text": "你很在意？"
    },
    {
     "who": "wu",
     "text": "沒有！"
    },
    {
     "who": "narr",
     "text": "（周振邦的手機響。他看了一眼號碼，起身走到街角才接。）"
    },
    {
     "who": "wu",
     "text": "隊長每次接電話都要走那麼遠。"
    },
    {
     "who": "you",
     "text": "嗯。"
    }
   ]
  }
 },
 "6": {
  "after": {
   "title": "新同事報到",
   "cast": [
    {
     "id": "he",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    },
    {
     "id": "xu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（許知夏抱著一箱器材來報到。何沛恩在門口堵住沈岳。）"
    },
    {
     "who": "he",
     "text": "沈警官，你知道分局倉庫淹水，報廢了幾把槍嗎？"
    },
    {
     "who": "you",
     "text": "不知道。"
    },
    {
     "who": "he",
     "text": "我也不知道。這才是問題。"
    },
    {
     "who": "xu",
     "text": "那個人是誰？"
    },
    {
     "who": "you",
     "text": "記者。離他遠一點。"
    },
    {
     "who": "xu",
     "text": "你自己剛剛跟他講了三句話。"
    }
   ],
   "arc": "reporter_he",
   "scene": "police"
  },
  "before": {
   "title": "早上・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   },
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "barista",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "wu",
     "text": "學長，我聽說那個台北的鑑識員，真的申請調來我們這裡了。"
    },
    {
     "who": "you",
     "text": "你聽誰說的？"
    },
    {
     "who": "wu",
     "text": "人事室的阿姨。她說調令下來了，這幾天就報到。"
    },
    {
     "who": "barista",
     "text": "是女生嗎？要不要我先準備一杯熱拿鐵歡迎她？"
    },
    {
     "who": "wu",
     "text": "她看起來是喝黑咖啡的人。"
    },
    {
     "who": "you",
     "text": "她喝茶。"
    },
    {
     "who": "narr",
     "text": "（小吳和老闆同時轉頭看你。）"
    },
    {
     "who": "wu",
     "text": "……學長你怎麼知道？"
    }
   ]
  }
 },
 "7": {
  "after": {
   "title": "頂樓抽菸區",
   "cast": [
    {
     "id": "zhao",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（趙德安手抖，打火機點不著。沈岳把自己的打火機遞過去。）"
    },
    {
     "who": "zhao",
     "text": "謝啦。你是三隊那個……沈什麼的。"
    },
    {
     "who": "you",
     "text": "沈岳。"
    },
    {
     "who": "zhao",
     "text": "年輕人，不要太拚。拚到最後，什麼都要交回去。"
    },
    {
     "who": "narr",
     "text": "（他把煙按熄，走了。）"
    }
   ],
   "arc": "zhao_smoke",
   "scene": "police"
  },
  "before": {
   "title": "中午・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "noon"
   },
   "cast": [
    {
     "id": "barista",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    },
    {
     "id": "_you",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（許知夏第一次和你們一起坐在外面。她點了一壺烏龍茶。）"
    },
    {
     "who": "barista",
     "text": "咖啡店點茶，很有個性。"
    },
    {
     "who": "xu",
     "text": "咖啡因讓我手抖，採證不能手抖。"
    },
    {
     "who": "wu",
     "text": "所以妳之前在台北……"
    },
    {
     "who": "xu",
     "text": "我不想聊台北。"
    },
    {
     "who": "narr",
     "text": "（她把茶杯轉了半圈，看著街對面的警局。）"
    },
    {
     "who": "xu",
     "text": "這裡的人，都會在這間店講案子？"
    },
    {
     "who": "you",
     "text": "講得太多的，老闆都記得。"
    },
    {
     "who": "barista",
     "text": "我只記得誰沒付錢。"
    }
   ]
  }
 },
 "8": {
  "after": {
   "title": "鑑識室",
   "cast": [
    {
     "id": "xu",
     "x": 40
    },
    {
     "id": "wu",
     "x": 80
    },
    {
     "id": "qian",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "xu",
     "text": "序號磨掉了，用酸蝕法可以還原，要兩天。"
    },
    {
     "who": "wu",
     "text": "可是這不是我們的案子耶。"
    },
    {
     "who": "xu",
     "text": "警槍在外面，就是我們的案子。"
    },
    {
     "who": "qian",
     "text": "（探頭）誰要鳳梨酥？我太太烤太多了。"
    },
    {
     "who": "xu",
     "text": "酸蝕要有人整晚顧著。你要回家睡覺嗎？",
     "id": "ep8_stay",
     "choices": [
      {
       "text": "「我留下來陪妳顧。」",
       "set": "c_xu_overnight",
       "say": [
        {
         "who": "xu",
         "text": "……隨便你。咖啡自己泡。"
        }
       ]
      },
      {
       "text": "「明天見。」",
       "say": [
        {
         "who": "xu",
         "text": "嗯，明天見。"
        }
       ]
      }
     ]
    }
   ],
   "arc": "gun_lab_sent",
   "scene": "lab"
  },
  "before": {
   "title": "下午・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "noon"
   },
   "cast": [
    {
     "id": "barista",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    },
    {
     "id": "wu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（你把筆記本放在桌上，去櫃台拿三明治。回來時，老闆正站在你的位子旁邊，低頭看著打開的筆記本。）"
    },
    {
     "who": "barista",
     "text": "啊，抱歉，你的杯子快被風吹倒了，我幫你扶一下。"
    },
    {
     "who": "you",
     "text": "……"
    },
    {
     "who": "xu",
     "text": "（小聲）他剛剛在看你的筆記。"
    },
    {
     "who": "wu",
     "text": "老闆人很好的啦。"
    },
    {
     "who": "xu",
     "text": "人很好的人，最會看別人的筆記。"
    },
    {
     "who": "you",
     "text": "（要不要說他？）",
     "id": "ep8_note",
     "choices": [
      {
       "text": "「老闆，下次別碰我的筆記。」",
       "set": "c_warn_barista",
       "say": [
        {
         "who": "barista",
         "text": "是是是，對不起。"
        }
       ]
      },
      {
       "text": "（算了，不說）",
       "set": "m_leak_cafe_8",
       "say": {
        "who": "narr",
        "text": "（你把筆記本收進外套。老闆笑著走回櫃台。）"
       }
      }
     ]
    }
   ]
  }
 },
 "9": {
  "after": {
   "title": "回程車上",
   "cast": [
    {
     "id": "wu",
     "x": 40
    },
    {
     "id": "xu",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "wu",
     "text": "那把槍是趙巡佐的……他在大樓那邊說，配槍早就交回去了。"
    },
    {
     "who": "xu",
     "text": "交回去，然後「淹水」了。"
    },
    {
     "who": "narr",
     "text": "（沈岳的手機響。周振邦：這件事交給督察組，你們不要碰。）"
    },
    {
     "who": "narr",
     "text": "（沈岳掛掉電話，看著窗外的雨。）"
    }
   ],
   "arc": "gun_call",
   "scene": "road"
  },
  "before": {
   "title": "早上・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   },
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "qian",
     "x": 90
    },
    {
     "id": "barista",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（星期六早上。大家難得不穿制服，坐在外面等小吳開車來。）"
    },
    {
     "who": "xu",
     "text": "我第一次跟同事出去玩。"
    },
    {
     "who": "you",
     "text": "我也是。"
    },
    {
     "who": "qian",
     "text": "你們兩個這樣講話，聽起來很可憐。"
    },
    {
     "who": "barista",
     "text": "玩得開心，不要又遇到案子。"
    },
    {
     "who": "qian",
     "text": "說這種話會帶衰的！"
    },
    {
     "who": "narr",
     "text": "（小吳的車在路邊按了兩聲喇叭。）"
    }
   ]
  }
 },
 "10": {
  "after": {
   "title": "台北月台",
   "cast": [
    {
     "id": "xu",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "xu",
     "text": "我爸……他平常不是那樣。"
    },
    {
     "who": "you",
     "text": "他認識我舅舅。"
    },
    {
     "who": "xu",
     "text": "你舅舅？"
    },
    {
     "who": "you",
     "text": "沈國棟。十五年前走的，也是警察。"
    },
    {
     "who": "narr",
     "text": "（許知夏沒說話。火車進站。）"
    }
   ],
   "arc": "uncle_shen",
   "scene": "taipei"
  },
  "before": {
   "title": "晚上・海風咖啡",
   "sceneWanted": "cafe",
   "opt": {
    "time": "night"
   },
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "barista",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（快打烊了，外面只剩你們這一桌。）"
    },
    {
     "who": "xu",
     "text": "下禮拜我想請一天假，回台北一趟。"
    },
    {
     "who": "wu",
     "text": "妳家人在台北？"
    },
    {
     "who": "xu",
     "text": "我爸。"
    },
    {
     "who": "narr",
     "text": "（她沒有再說下去。老闆把椅子一張張疊起來，故意疊得很慢。）"
    },
    {
     "who": "barista",
     "text": "慢慢來，我不趕。"
    }
   ]
  }
 },
 "11": {
  "after": {
   "title": "彈道室",
   "cast": [
    {
     "id": "xu",
     "x": 40
    },
    {
     "id": "wu",
     "x": 80
    },
    {
     "id": "_you",
     "x": 120
    },
    {
     "id": "li",
     "x": 160
    }
   ],
   "lines": [
    {
     "who": "xu",
     "text": "第二把了，同一批報廢。"
    },
    {
     "who": "wu",
     "text": "一把是人倒楣，兩把是……"
    },
    {
     "who": "you",
     "text": "是有人在賣。"
    },
    {
     "who": "li",
     "text": "（站在門口）這句話，不要在走廊上說。"
    }
   ],
   "arc": "ring_suspected",
   "scene": "lab"
  },
  "before": {
   "title": "早上・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（局對面轉角的露天咖啡店「海風咖啡」。你們坐在外面的鐵椅上，星期一早上八點。小吳桌上堆著升等考試的書。）"
    },
    {
     "who": "wu",
     "text": "學長，「刑事訴訟法第 88 條之 1」是什麼？"
    },
    {
     "who": "you",
     "text": "逕行拘提。"
    },
    {
     "who": "wu",
     "text": "你怎麼連這個都記得……"
    },
    {
     "who": "xu",
     "text": "他連你上個月欠我一杯珍奶都記得。"
    },
    {
     "who": "wu",
     "text": "那是半杯！"
    },
    {
     "who": "narr",
     "text": "（小吳的手機響了。他看到你在看，馬上掛掉，把手機螢幕朝下。）"
    },
    {
     "who": "wu",
     "text": "沒、沒事！詐騙電話！"
    }
   ],
   "opt": {
    "time": "morning"
   }
  }
 },
 "12": {
  "after": {
   "title": "安全屋門口",
   "cast": [
    {
     "id": "zhao",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "zhao",
     "text": "我女兒今年考大學。幫我跟她說，爸爸不是壞人。"
    },
    {
     "who": "you",
     "text": "（他看著你，等你回答。）",
     "id": "ep12_promise",
     "choices": [
      {
       "text": "「好，我答應你。」",
       "set": "c_zhao_promise",
       "say": [
        {
         "who": "zhao",
         "text": "謝謝。"
        }
       ]
      },
      {
       "text": "「你自己跟她說。」",
       "say": [
        {
         "who": "zhao",
         "text": "……好。"
        }
       ]
      }
     ]
    },
    {
     "who": "zhao",
     "text": "（壓低聲音）我可以告訴你那個戴帽子的人在漁港叫什麼外號。條件是，你把我銀行那筆三十萬從報告裡拿掉。我女兒不能知道。",
     "id": "ep12_deal",
     "choices": [
      {
       "text": "答應",
       "set": [
        "m_rule_minus_12",
        "c_zhao_deal"
       ],
       "say": [
        {
         "who": "zhao",
         "text": "……「阿帽」。大家都這樣叫他。"
        },
        {
         "who": "narr",
         "text": "（你在筆記本上寫下兩個字，然後把報告的那一頁折起來。）"
        }
       ]
      },
      {
       "text": "拒絕：「報告不能改。」",
       "set": "m_rule_plus_12",
       "say": [
        {
         "who": "zhao",
         "text": "……我就知道。你跟你舅舅一樣。"
        }
       ]
      }
     ]
    },
    {
     "who": "narr",
     "text": "（門關上。）"
    }
   ],
   "arc": "zhao_promise",
   "sceneWanted": "safehouse"
  },
  "before": {
   "title": "早上・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "barista",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    },
    {
     "id": "su",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "barista",
     "text": "沈先生照舊，美式不加糖、一個火腿蛋三明治。"
    },
    {
     "who": "wu",
     "text": "我也要一樣的！"
    },
    {
     "who": "xu",
     "text": "你不是說要減肥？"
    },
    {
     "who": "wu",
     "text": "那是下禮拜的我的事。"
    },
    {
     "who": "narr",
     "text": "（店裡的電視正在播：巡佐失聯，家屬報案。外面桌的你們同時放下杯子。）"
    },
    {
     "who": "su",
     "text": "（隔壁桌的男人放下報紙，客氣地笑）巡佐失聯？這年頭當警察真不容易。我姓蘇，在對面事務所上班，常來。"
    }
   ],
   "opt": {
    "time": "morning"
   }
  }
 },
 "13": {
  "after": {
   "title": "醫院走廊",
   "cast": [
    {
     "id": "ye",
     "x": 40
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（葉晴的弟弟在加護病房。）"
    },
    {
     "who": "ye",
     "text": "我起訴過三百多個毒販，從來沒想過，他們的貨是從我們自己的櫃子出去的。"
    },
    {
     "who": "narr",
     "text": "（沈岳遞給她一杯自動販賣機的咖啡。）"
    },
    {
     "who": "ye",
     "text": "……謝謝，沈岳。"
    },
    {
     "who": "narr",
     "text": "（第一次叫他名字，不是「沈警官」。）"
    },
    {
     "who": "ye",
     "text": "沈岳……那份案件報告，可不可以不要寫我弟弟的名字？只寫「另一名送醫者」。",
     "id": "ep13_ye",
     "choices": [
      {
       "text": "「好。」",
       "set": [
        "m_rule_minus_13",
        "c_cover_ye"
       ],
       "say": [
        {
         "who": "ye",
         "text": "……我欠你一次。"
        }
       ]
      },
      {
       "text": "「我不能。但我會寫得很小心。」",
       "set": "m_rule_plus_13",
       "say": [
        {
         "who": "ye",
         "text": "……我知道。是我不該問。"
        }
       ]
      }
     ]
    }
   ],
   "arc": "ye_first_name",
   "scene": "hospital"
  },
  "before": {
   "title": "午休・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "qian",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（許知夏帶了一盆多肉植物來，放在桌上曬太陽。名牌寫「證物 A」。）"
    },
    {
     "who": "wu",
     "text": "妳把植物取名叫證物 A？"
    },
    {
     "who": "xu",
     "text": "它很耐活，比你們都耐。"
    },
    {
     "who": "qian",
     "text": "我太太說多肉一週澆一次水就好。"
    },
    {
     "who": "xu",
     "text": "我知道。我有做紀錄表。"
    },
    {
     "who": "narr",
     "text": "（她從包包拿紀錄表時，掉出一個牛皮紙袋，角落寫著「2011」。她很快撿起來塞回去。）"
    },
    {
     "who": "xu",
     "text": "看什麼？午休時間禁止參觀。"
    }
   ],
   "opt": {
    "time": "noon"
   }
  }
 },
 "14": {
  "after": {
   "title": "告別式外",
   "cast": [
    {
     "id": "wu",
     "x": 40
    },
    {
     "id": "xu",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（豆花趴在沈岳腳邊。）"
    },
    {
     "who": "wu",
     "text": "牠以後跟我們了？"
    },
    {
     "who": "xu",
     "text": "牠找證物比你厲害。"
    },
    {
     "who": "wu",
     "text": "喂！"
    },
    {
     "who": "narr",
     "text": "（大家笑了一下。沈岳低頭看老鄭的筆記本，最後一頁寫著一個字母：Y。）"
    }
   ],
   "arc": "dog_joins",
   "sceneWanted": "funeral"
  },
  "before": {
   "title": "下班後・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "barista",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（下雨了。你們躲在咖啡店的遮雨棚下。小吳的機車停在路邊，發不動。）"
    },
    {
     "who": "wu",
     "text": "學長，等一下可以載我一程嗎……"
    },
    {
     "who": "you",
     "text": "嗯。"
    },
    {
     "who": "wu",
     "text": "你又只點咖啡。你都不吃正餐嗎？"
    },
    {
     "who": "you",
     "text": "……"
    },
    {
     "who": "barista",
     "text": "他每天只吃我的三明治。"
    },
    {
     "who": "wu",
     "text": "明天我帶我媽做的滷肉飯給你。不准拒絕。"
    },
    {
     "who": "wu",
     "text": "學長……那個……你可以借我三萬嗎？下個月就還。",
     "id": "ep14_loan",
     "choices": [
      {
       "text": "「好。」不問原因",
       "set": "c_lend_wu",
       "say": [
        {
         "who": "wu",
         "text": "……謝謝學長。真的。"
        }
       ]
      },
      {
       "text": "「先告訴我要做什麼。」",
       "set": "c_ask_wu",
       "say": [
        {
         "who": "wu",
         "text": "……沒事啦，我自己想辦法。"
        },
        {
         "who": "narr",
         "text": "（他笑了一下，但沒有再看你。）"
        }
       ]
      }
     ]
    }
   ],
   "opt": {
    "time": "dusk",
    "rain": true
   }
  }
 },
 "15": {
  "after": {
   "title": "雨夜麵攤（第一季完）",
   "cast": [
    {
     "id": "ayue",
     "x": 40
    },
    {
     "id": "li",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（大家都沒動筷子。阿月姨多煮了一碗麵，放在角落那個空位 —— 趙德安以前常坐那裡。）"
    },
    {
     "who": "ayue",
     "text": "他每次都點乾麵加蛋。"
    },
    {
     "who": "narr",
     "text": "（你想起安全屋門口，你答應過他的事。）",
     "when": "arc:c_zhao_promise"
    },
    {
     "who": "narr",
     "text": "（黎光耀撐傘走進來。）"
    },
    {
     "who": "li",
     "text": "沈岳。明天早上九點，督察組。"
    },
    {
     "who": "narr",
     "text": "（畫面黑。「第一季 完」）"
    }
   ],
   "arc": "season1_end",
   "sceneWanted": "noodle（雨夜）"
  },
  "before": {
   "title": "傍晚・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "ye",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abin",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "abin",
     "text": "老闆，咖啡豆放門口喔！（看到葉晴，聲音一下子變小）啊……你們在談正事，我先走。"
    },
    {
     "who": "narr",
     "text": "（葉晴約你在咖啡店外面坐。她的手機桌布是弟弟小時候的照片。）"
    },
    {
     "who": "ye",
     "text": "他醒了。醫生說要戒，至少半年。"
    },
    {
     "who": "you",
     "text": "妳呢？"
    },
    {
     "who": "ye",
     "text": "我？我還有十七件案子要起訴。"
    },
    {
     "who": "narr",
     "text": "（她把手機翻過去，又翻回來。）"
    },
    {
     "who": "ye",
     "text": "……謝謝你那天的咖啡。很難喝。這裡的比較好。"
    }
   ],
   "opt": {
    "time": "dusk"
   }
  }
 },
 "16": {
  "before": {
   "title": "早上・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "li",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "zhou",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（趙德安過世一週。你一個人坐在外面，黎光耀拿著一杯熱茶在你對面坐下。）"
    },
    {
     "who": "li",
     "text": "不是約談。只是喝茶。"
    },
    {
     "who": "li",
     "text": "安全屋的地址，你告訴過誰？"
    },
    {
     "who": "you",
     "text": "沒有。"
    },
    {
     "who": "li",
     "text": "你的隊長、你的助手、你的鑑識員，都說沒有。那就是有人說謊，或是有人在偷聽。"
    },
    {
     "who": "narr",
     "text": "（他在本子上寫了一行字，你看不到。）"
    },
    {
     "who": "li",
     "text": "你的隊長有沒有叫你們不要碰這件事？",
     "id": "ep16_li",
     "choices": [
      {
       "text": "照實說：「他說過交給督察組。」",
       "set": "c_told_li_zhou",
       "say": [
        {
         "who": "li",
         "text": "謝謝。這樣比較省事。"
        }
       ]
      },
      {
       "text": "「沒有。」",
       "set": [
        "m_rule_minus_16",
        "c_cover_zhou"
       ],
       "say": [
        {
         "who": "li",
         "text": "……好。"
        },
        {
         "who": "narr",
         "text": "（他看了你很久。）"
        }
       ]
      }
     ]
    },
    {
     "who": "zhou",
     "text": "（走過來）黎督察，喝茶要不要也叫上我？我的人要去漁港查案了。"
    }
   ],
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "漁港碼頭・黃昏",
   "cast": [
    {
     "id": "xu",
     "x": 40
    },
    {
     "id": "wu",
     "x": 80
    },
    {
     "id": "_you",
     "x": 120
    },
    {
     "id": "qian",
     "x": 160
    }
   ],
   "lines": [
    {
     "who": "xu",
     "text": "那個空箱子，槍油味很重。"
    },
    {
     "who": "wu",
     "text": "「海龍漁業」……是那個龍叔的公司？"
    },
    {
     "who": "you",
     "text": "他說是別人寄放的。"
    },
    {
     "who": "xu",
     "text": "你信？"
    },
    {
     "who": "you",
     "text": "我信他知道是誰寄放的。"
    },
    {
     "who": "narr",
     "text": "（豆花對著一艘漁船叫了兩聲，船上沒有人。）"
    },
    {
     "who": "qian",
     "text": "（收拾解剖刀）沈國棟……你是他外甥吧。"
    },
    {
     "who": "you",
     "text": "您認識他？"
    },
    {
     "who": "qian",
     "text": "……以前見過。我老了，記不清了。"
    }
   ],
   "sceneWanted": "harbour"
  }
 },
 "17": {
  "before": {
   "title": "中午・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "ayue",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（阿月姨提著外送的麵來咖啡店，老闆讓她在外面桌放下。）"
    },
    {
     "who": "ayue",
     "text": "欸，那個女鑑識，妳太瘦了，多吃一顆滷蛋。"
    },
    {
     "who": "xu",
     "text": "我不吃滷蛋。"
    },
    {
     "who": "ayue",
     "text": "那豆干。"
    },
    {
     "who": "xu",
     "text": "……好。"
    },
    {
     "who": "wu",
     "text": "（小聲）學長，她從來不跟人說「好」的。"
    },
    {
     "who": "narr",
     "text": "（一個穿雨鞋的男人經過，阿月姨塞給他一個信封。他點點頭就走了。）"
    },
    {
     "who": "ayue",
     "text": "看什麼看，麵要糊了。明天廟會遶境，你們要不要來看？"
    }
   ],
   "opt": {
    "time": "noon"
   }
  },
  "after": {
   "title": "廟埕・遶境散場",
   "cast": [
    {
     "id": "he",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（地上都是鞭炮紙。阿月姨的攤子還亮著。）"
    },
    {
     "who": "he",
     "text": "三把了。你們局裡還要裝多久？"
    },
    {
     "who": "you",
     "text": "你寫這篇，會有人找你麻煩。"
    },
    {
     "who": "he",
     "text": "已經有了。我的機車輪胎上禮拜被割破。"
    },
    {
     "who": "he",
     "text": "沈警官，我不是在問你要新聞。我是在問你，你站哪一邊。"
    },
    {
     "who": "he",
     "text": "給我彈道報告的照片就好。我不寫你的名字。",
     "id": "ep17_he",
     "choices": [
      {
       "text": "給他",
       "set": [
        "m_rule_minus_17",
        "c_help_he"
       ],
       "say": [
        {
         "who": "he",
         "text": "……謝了。你會知道你沒有選錯邊。"
        }
       ]
      },
      {
       "text": "不給",
       "set": "m_rule_plus_17",
       "say": [
        {
         "who": "he",
         "text": "好。那我自己挖。"
        }
       ]
      }
     ]
    },
    {
     "who": "narr",
     "text": "（他走進散場的人群裡。）"
    }
   ],
   "sceneWanted": "temple"
  }
 },
 "18": {
  "before": {
   "title": "下午・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "xiaoying",
     "x": 90
    },
    {
     "id": "barista",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（小吳穿著太緊的西裝，坐在外面對著手機鏡頭打領帶，打了五次。妹妹小瑩坐在旁邊喝奶茶。）"
    },
    {
     "who": "wu",
     "text": "學長，你會打領帶嗎？"
    },
    {
     "who": "you",
     "text": "過來。"
    },
    {
     "who": "narr",
     "text": "（你幫他打好。小瑩笑到彎腰。）"
    },
    {
     "who": "xiaoying",
     "text": "哥，你看起來像賣保險的。"
    },
    {
     "who": "wu",
     "text": "吳小瑩！"
    },
    {
     "who": "barista",
     "text": "新郎是你嗎？"
    },
    {
     "who": "wu",
     "text": "是我表哥啦！"
    }
   ],
   "opt": {
    "time": "noon"
   }
  },
  "after": {
   "title": "喜宴散場",
   "cast": [
    {
     "id": "kui",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    },
    {
     "id": "xu",
     "x": 120
    },
    {
     "id": "wu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（新郎新娘在門口送客。小吳喝醉了，抱著豆花說話。）"
    },
    {
     "who": "narr",
     "text": "（新郎阿翔把你拉到一邊，塞給你一個紅包。）「沈警官，志偉是我從小的兄弟，錢都回來了，可不可以不要報警？這是一點心意。」",
     "id": "ep18_deal",
     "choices": [
      {
       "text": "「依法處理。」把紅包推回去",
       "set": "m_rule_plus_18",
       "say": {
        "who": "narr",
        "text": "（阿翔低下頭。小吳不敢看你。）"
       }
      },
      {
       "text": "不報警，紅包推回去",
       "set": "m_rule_minus_18",
       "say": {
        "who": "narr",
        "text": "（阿翔一直鞠躬。志偉站在遠處，眼睛紅了。）"
       }
      },
      {
       "text": "不報警，收下紅包",
       "set": [
        "m_rule_minus_18",
        "m_greed_18"
       ],
       "say": {
        "who": "narr",
        "text": "（紅包很厚。你把它放進西裝內袋。）"
       }
      }
     ]
    },
    {
     "who": "kui",
     "text": "許前輩，下禮拜我就去鑑識科報到了，請多指教！"
    },
    {
     "who": "you",
     "text": "（新郎硬把麥克風塞給你。）",
     "id": "ep18_speech",
     "choices": [
      {
       "text": "認真致詞",
       "set": "c_wedding_speech",
       "say": [
        {
         "who": "narr",
         "text": "你說了三句話。全場安靜，然後新娘哭了。小吳說那是他聽過最好的致詞。"
        }
       ]
      },
      {
       "text": "把麥克風塞給小吳",
       "say": [
        {
         "who": "wu",
         "text": "咦？我？呃……祝表哥早生貴子！"
        }
       ]
      }
     ]
    },
    {
     "who": "xu",
     "text": "先把蜜粉擦乾淨。採完指紋要寫紀錄。"
    },
    {
     "who": "kui",
     "text": "是！"
    },
    {
     "who": "xu",
     "text": "（對你）……我爸說，想見你一面。"
    },
    {
     "who": "you",
     "text": "為什麼？"
    },
    {
     "who": "xu",
     "text": "他沒說。他很少想見誰。"
    }
   ],
   "sceneWanted": "banquet",
   "arc": "xuzy_wants_meet"
  }
 },
 "19": {
  "before": {
   "title": "晚上・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "xuzy",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（許知夏約她爸在這裡見你。許振業點了一杯熱咖啡，偷偷從外套拿出小酒瓶倒了一點進去。）"
    },
    {
     "who": "xuzy",
     "text": "你就是沈岳。……長得跟你舅舅有點像。"
    },
    {
     "who": "you",
     "text": "您認識我舅舅？"
    },
    {
     "who": "xuzy",
     "text": "以前一起辦過案。很久以前了。"
    },
    {
     "who": "xu",
     "text": "爸。"
    },
    {
     "who": "xuzy",
     "text": "最後一點。"
    }
   ],
   "opt": {
    "time": "night"
   }
  },
  "after": {
   "title": "許振業家樓下・深夜",
   "cast": [
    {
     "id": "xu",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    }
   ],
   "lines": [
    {
     "who": "xu",
     "text": "他喝醉會亂講話。你不要放在心上。"
    },
    {
     "who": "you",
     "text": "「沈組長」是我舅舅。"
    },
    {
     "who": "narr",
     "text": "（許知夏停下腳步。）"
    },
    {
     "who": "xu",
     "text": "我會去問他。等他清醒的時候。"
    },
    {
     "who": "you",
     "text": "葛振民的底片箱，2011 那一格是空的。"
    },
    {
     "who": "xu",
     "text": "我知道。我也看到了。"
    },
    {
     "who": "xu",
     "text": "他到底說了什麼？你要告訴我嗎？",
     "id": "ep19_tell",
     "choices": [
      {
       "text": "全部告訴她",
       "set": "c_told_xu",
       "say": [
        {
         "who": "xu",
         "text": "……謝謝你沒有瞞我。"
        }
       ]
      },
      {
       "text": "「等妳問過他再說。」",
       "say": [
        {
         "who": "xu",
         "text": "嗯。"
        }
       ]
      }
     ]
    }
   ],
   "sceneWanted": "street_night"
  }
 },
 "20": {
  "before": {
   "title": "下班後・海風咖啡",
   "sceneWanted": "cafe",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "qian",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（案子還沒來。你們難得準時下班，在咖啡店外面坐著，討論等一下去夜市吃什麼。）"
    },
    {
     "who": "wu",
     "text": "我要吃大腸包小腸、蚵仔煎、地瓜球……"
    },
    {
     "who": "xu",
     "text": "你的升等考試呢？"
    },
    {
     "who": "wu",
     "text": "吃飽才有力氣讀書。"
    },
    {
     "who": "qian",
     "text": "我推薦那攤杏仁豆腐，三十年老店。"
    },
    {
     "who": "narr",
     "text": "（那時候沒人知道，兩天後那攤會上新聞。）"
    },
    {
     "who": "barista",
     "text": "（擦著桌子，很隨意地）對了，那個常來的記者，最近在查什麼？",
     "when": [
      "arc:m_leak_cafe_3",
      "arc:m_leak_cafe_8"
     ]
    }
   ],
   "opt": {
    "time": "dusk"
   }
  },
  "after": {
   "title": "何沛恩被翻亂的租屋處",
   "cast": [
    {
     "id": "he",
     "x": 40
    },
    {
     "id": "wu",
     "x": 80
    },
    {
     "id": "li",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（抽屜全被拉出來，筆電不見了。何沛恩坐在地上，手上貼著 OK 繃。）"
    },
    {
     "who": "he",
     "text": "還好我不在家。"
    },
    {
     "who": "wu",
     "text": "你那支隨身碟……"
    },
    {
     "who": "he",
     "text": "在你們學長那裡。最安全的地方。"
    },
    {
     "who": "he",
     "text": "密碼我也記不住。我設了一個只有我女朋友知道的。"
    },
    {
     "who": "wu",
     "text": "你有女朋友？"
    },
    {
     "who": "he",
     "text": "……上個月分了。"
    },
    {
     "who": "he",
     "text": "老實說，我的消息有一半是局裡的人傳給我的。隱藏號碼，每次都說得很準。"
    },
    {
     "who": "you",
     "text": "誰？"
    },
    {
     "who": "he",
     "text": "我也想知道。"
    },
    {
     "who": "you",
     "text": "（何沛恩的隨身碟在你口袋裡。）",
     "id": "ep20_usb",
     "choices": [
      {
       "text": "交給督察組黎光耀",
       "set": [
        "m_rule_plus_20",
        "c_usb_li"
       ],
       "say": {
        "who": "narr",
        "text": "（黎光耀接過隨身碟，只說了一句：「明智。」）"
       }
      },
      {
       "text": "自己留著",
       "set": "c_usb_keep",
       "say": {
        "who": "narr",
        "text": "（你把它鎖進家裡的抽屜。）"
       }
      }
     ]
    }
   ],
   "sceneWanted": "apartment"
  }
 },
 "21": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "kui",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    },
    {
     "id": "barista",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（陳葵第一次跟大家坐在外面，背包上掛了七八個吊飾。）"
    },
    {
     "who": "kui",
     "text": "許前輩，我今天開始正式跟現場了！"
    },
    {
     "who": "xu",
     "text": "吊飾拿下來。會掉在現場變成證物。"
    },
    {
     "who": "kui",
     "text": "……全部？"
    },
    {
     "who": "xu",
     "text": "全部。"
    },
    {
     "who": "wu",
     "text": "我以前也被她這樣罵過。妳習慣就好。"
    },
    {
     "who": "barista",
     "text": "新面孔？第一杯我請。"
    },
    {
     "who": "kui",
     "text": "老闆人好好！"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "收工後・海風咖啡外",
   "cast": [
    {
     "id": "barista",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    },
    {
     "id": "zhaosi",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（你回到咖啡店拿外套。老闆遞給你一個牛皮紙信封。）"
    },
    {
     "who": "barista",
     "text": "剛剛有人放在桌上，寫著你的名字。我沒看到是誰。"
    },
    {
     "who": "narr",
     "text": "（信封裡是一張舊照片：2011 年，分局門口，你的舅舅和三個同事。其中一個人的臉被刮掉了。）"
    },
    {
     "who": "xu",
     "text": "這是底片沖出來的。……2011。"
    },
    {
     "who": "you",
     "text": "葛振民的底片箱。"
    },
    {
     "who": "zhaosi",
     "text": "（從街角走過來）沈警官……我爸以前說過你。謝謝你今天沒有讓大家亂猜。",
     "when": "arc:c_zhao_promise"
    }
   ],
   "sceneWanted": "cafe",
   "arc": "shen_photo"
  }
 },
 "22": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "cai",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "su",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（一個穿袖套的瘦男人在櫃台買外帶。他是證物室的蔡明宏。）"
    },
    {
     "who": "cai",
     "text": "老闆，兩杯美式，帶走。"
    },
    {
     "who": "wu",
     "text": "明宏哥早！"
    },
    {
     "who": "cai",
     "text": "早。你們又要出去？"
    },
    {
     "who": "narr",
     "text": "（他拿了咖啡就走，沒有坐下。）"
    },
    {
     "who": "su",
     "text": "（翻報紙）沈警官，最近氣色不錯。喝喜酒的紅包，都還夠用吧？",
     "when": "arc:m_greed_18"
    },
    {
     "who": "su",
     "text": "（翻報紙）沈警官早。今天風很大。",
     "unless": "arc:m_greed_18"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "收工後・合作社後巷",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "xu",
     "text": "值班表上有周隊長的名字。"
    },
    {
     "who": "wu",
     "text": "還有證物室的明宏哥？他那時候才十九歲吧。"
    },
    {
     "who": "you",
     "text": "工讀生。"
    },
    {
     "who": "xu",
     "text": "你要先給誰看？",
     "id": "ep22_roster",
     "choices": [
      {
       "text": "先拿給周振邦",
       "set": "c_roster_zhou",
       "say": [
        {
         "who": "narr",
         "text": "（周振邦看了很久，只說：「那天晚上，我有出勤。」）"
        }
       ]
      },
      {
       "text": "先交給督察組黎光耀",
       "set": "c_roster_li",
       "say": [
        {
         "who": "narr",
         "text": "（黎光耀把影本收進資料夾：「謝謝。周振邦的部分，我會自己問。」）"
        }
       ]
      }
     ]
    }
   ],
   "sceneWanted": "alley"
  }
 },
 "23": {
  "before": {
   "title": "傍晚・海風咖啡",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "kui",
     "x": 90
    },
    {
     "id": "barista",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "xu",
     "text": "舊醫院的地下室，我小時候去過一次。那時候還是醫院。"
    },
    {
     "who": "wu",
     "text": "妳生病？"
    },
    {
     "who": "xu",
     "text": "我爸帶我去看人。他沒說是誰。"
    },
    {
     "who": "kui",
     "text": "聽說那裡晚上有聲音……"
    },
    {
     "who": "wu",
     "text": "陳葵！"
    },
    {
     "who": "barista",
     "text": "（擦杯子）你們晚上要去舊醫院？小心一點，那裡很久沒人去了。"
    },
    {
     "who": "narr",
     "text": "（你沒有回答。老闆繼續擦杯子。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   }
  },
  "after": {
   "title": "逃出來之後・舊醫院門口",
   "cast": [
    {
     "id": "kui",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    },
    {
     "id": "wu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（三個人坐在台階上，全身灰。小吳的手被玻璃割傷。）"
    },
    {
     "who": "kui",
     "text": "（跑過來）前輩！你們沒事吧！"
    },
    {
     "who": "xu",
     "text": "那一頁被撕掉了。"
    },
    {
     "who": "you",
     "text": "有人比我們先知道。"
    },
    {
     "who": "wu",
     "text": "誰會知道我們今天晚上要來？"
    },
    {
     "who": "narr",
     "text": "（沒有人回答。你想起今天下午在咖啡店說過的話。）",
     "when": [
      "arc:m_leak_cafe_3",
      "arc:m_leak_cafe_8"
     ]
    }
   ],
   "sceneWanted": "hospital_old"
  }
 },
 "24": {
  "before": {
   "title": "中午・海風咖啡",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abin",
     "x": 90
    },
    {
     "id": "wu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（許知夏拿出一張護理之家的訪客單。）"
    },
    {
     "who": "xu",
     "text": "我奶奶住在安和護理之家。我爸每個禮拜三去看她。"
    },
    {
     "who": "you",
     "text": "今天禮拜三。"
    },
    {
     "who": "xu",
     "text": "嗯。所以他今天應該是清醒的。"
    },
    {
     "who": "abin",
     "text": "（停機車）老闆，豆子！欸，小吳，你上次說的那一關我過了！"
    },
    {
     "who": "wu",
     "text": "真的假的？"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "noon"
   }
  },
  "after": {
   "title": "護理之家走廊",
   "cast": [
    {
     "id": "xuzy",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "xuzy",
     "text": "那顆彈頭，跟你舅舅的配槍對不上。"
    },
    {
     "who": "xuzy",
     "text": "上面叫我寫「相符」。我寫了。"
    },
    {
     "who": "you",
     "text": "上面是誰？"
    },
    {
     "who": "xuzy",
     "text": "……我還有一個女兒。"
    },
    {
     "who": "xu",
     "text": "（站在走廊盡頭）爸。",
     "when": "arc:c_told_xu"
    },
    {
     "who": "you",
     "text": "（報告要怎麼寫？）",
     "id": "ep24_mercy",
     "choices": [
      {
       "text": "建議葉晴考慮緩起訴",
       "set": "c_mercy_24",
       "say": [
        {
         "who": "narr",
         "text": "（何美玲在走廊另一頭向你深深鞠躬。）"
        }
       ]
      },
      {
       "text": "照實寫，交給檢察官決定",
       "say": [
        {
         "who": "narr",
         "text": "（何美玲點點頭，沒有哭。）"
        }
       ]
      }
     ]
    }
   ],
   "sceneWanted": "nursing_home"
  }
 },
 "25": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "zhou",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "qian",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（周振邦坐在你們這一桌，桌上攤著那張舊照片。）"
    },
    {
     "who": "zhou",
     "text": "照片上這三個人，我都認識。你舅舅、我、還有一個已經過世的學長。"
    },
    {
     "who": "you",
     "text": "被刮掉的那一個呢？"
    },
    {
     "who": "zhou",
     "text": "……我不知道。我那天不在照片裡，是我拍的。"
    },
    {
     "who": "qian",
     "text": "（走過來，臉色很差）沈岳，我有東西要給你看。在我的教學室。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "雨夜・海風咖啡",
   "cast": [
    {
     "id": "qian",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "ye",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（大家都在。只有周振邦的位子空著。）"
    },
    {
     "who": "qian",
     "text": "那顆彈頭，我留了十五年。我每年都拿出來看一次。"
    },
    {
     "who": "qian",
     "text": "對不起。"
    },
    {
     "who": "you",
     "text": "謝謝你留著它。"
    },
    {
     "who": "ye",
     "text": "從今天起，這是他殺案。"
    },
    {
     "who": "narr",
     "text": "（電視上，韓副局長在記者會說：「重啟調查，絕不護短。」老闆把電視音量調大了一點。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "night",
    "rain": true
   }
  }
 },
 "26": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "li",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（周振邦停職。黎光耀坐在他平常的位子，喝熱茶。）"
    },
    {
     "who": "li",
     "text": "在督察組查完之前，我暫時督導你們。"
    },
    {
     "who": "wu",
     "text": "（小聲）好尷尬……"
    },
    {
     "who": "li",
     "text": "我聽得到。"
    },
    {
     "who": "xu",
     "text": "黎督察，你喝的是這裡的茶？"
    },
    {
     "who": "li",
     "text": "我自己帶的茶包。這裡的東西，我不喝。"
    },
    {
     "who": "narr",
     "text": "（老闆在櫃台後面笑了一下。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning",
    "rain": true
   }
  },
  "after": {
   "title": "漁港公共電話旁",
   "cast": [
    {
     "id": "heimao",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "heimao",
     "text": "Y 不用手機。用那一支。"
    },
    {
     "who": "narr",
     "text": "（漁港冰店旁邊，一支漆都掉光的公共電話。）"
    },
    {
     "who": "heimao",
     "text": "我只知道這麼多。再多，我就沒命了。"
    },
    {
     "who": "you",
     "text": "你要多少？"
    },
    {
     "who": "heimao",
     "text": "這次免費。你舅舅以前請我吃過飯。"
    }
   ],
   "sceneWanted": "harbour",
   "arc": "y_payphone"
  }
 },
 "27": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "ye",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "barista",
     "x": 90
    },
    {
     "id": "wu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（葉晴第一次在咖啡店開會，帶著一疊卷宗。）"
    },
    {
     "who": "ye",
     "text": "從今天開始，專案小組每天早上八點在這裡集合。"
    },
    {
     "who": "xu",
     "text": "為什麼不在局裡？"
    },
    {
     "who": "ye",
     "text": "局裡有人聽。"
    },
    {
     "who": "narr",
     "text": "（老闆端咖啡過來，大家同時停止說話。）"
    },
    {
     "who": "barista",
     "text": "慢用。"
    },
    {
     "who": "ye",
     "text": "……也許這裡也有。明天換地方。"
    },
    {
     "who": "wu",
     "text": "可是這裡的三明治很好吃……"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "收工後・咖啡店（葉晴說明天換地方之前）",
   "cast": [
    {
     "id": "ye",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "ye",
     "text": "我弟弟的上家，叫「阿東」，在漁港。",
     "when": "arc:c_cover_ye"
    },
    {
     "who": "ye",
     "text": "你上次沒幫我瞞。所以我信你。",
     "when": "arc:m_rule_plus_13"
    },
    {
     "who": "ye",
     "text": "專案小組，正式成立。"
    },
    {
     "who": "xu",
     "text": "葉檢，妳剛剛說「這裡也許也有人聽」……"
    },
    {
     "who": "ye",
     "text": "我是說說而已。"
    },
    {
     "who": "narr",
     "text": "（她把卷宗收好，看了櫃台一眼。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   }
  }
 },
 "28": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "zhou",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "li",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（周振邦回來了，鬍子沒刮，但笑得很大聲。）"
    },
    {
     "who": "zhou",
     "text": "督察組查了兩週，查不到東西。我回來了。"
    },
    {
     "who": "wu",
     "text": "隊長！"
    },
    {
     "who": "zhou",
     "text": "黎光耀那小子，臨走前還請我喝了一杯茶。他自己帶的茶包。"
    },
    {
     "who": "li",
     "text": "（隔壁桌）是好茶。"
    },
    {
     "who": "zhou",
     "text": "你怎麼還在？"
    },
    {
     "who": "li",
     "text": "我喜歡這裡的位子。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "碼頭・夜",
   "cast": [
    {
     "id": "longshu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（警車帶走船長洪阿福。龍叔站在碼頭邊抽菸，旁邊是那個從不說話的司機。）"
    },
    {
     "who": "longshu",
     "text": "我的人做錯事，我交給你們。這樣大家都好做事。"
    },
    {
     "who": "you",
     "text": "貨呢？"
    },
    {
     "who": "longshu",
     "text": "什麼貨？我只賣魚。"
    },
    {
     "who": "narr",
     "text": "（司機看了你一眼。很短的一眼。然後打開車門讓龍叔上車。）"
    }
   ],
   "sceneWanted": "harbour"
  }
 },
 "29": {
  "before": {
   "title": "晚上・海風咖啡",
   "cast": [
    {
     "id": "he",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "barista",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（快打烊。何沛恩一個人坐在外面，盯著手機。）"
    },
    {
     "who": "he",
     "text": "我的影片被下架了。「應警方要求」。"
    },
    {
     "who": "you",
     "text": "哪個警方？"
    },
    {
     "who": "he",
     "text": "這就是我想問你的。"
    },
    {
     "who": "barista",
     "text": "要打烊囉，最後一杯？"
    },
    {
     "who": "he",
     "text": "不用了，謝謝。（小聲）我不在這裡講。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "night"
   }
  },
  "after": {
   "title": "收工後・何沛恩的車上",
   "cast": [
    {
     "id": "he",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "he",
     "text": "你看，每一則都寫「証物」。不是「證物」。"
    },
    {
     "who": "you",
     "text": "很多人這樣寫。"
    },
    {
     "who": "he",
     "text": "警察寫公文不會。除非他從小就這樣寫，改不掉。"
    },
    {
     "who": "he",
     "text": "我要把簡訊整理成新影片。你幫不幫我？",
     "id": "ep29_he",
     "choices": [
      {
       "text": "幫他：用你的身分證實這些簡訊是真的",
       "set": [
        "m_rule_minus_29",
        "c_help_he2"
       ],
       "say": [
        {
         "who": "he",
         "text": "……謝謝。這次換我欠你。"
        }
       ]
      },
      {
       "text": "「先別發。等我查到是誰。」",
       "set": "c_wait_he",
       "say": [
        {
         "who": "he",
         "text": "好。我等你一週。"
        }
       ]
      }
     ]
    }
   ],
   "sceneWanted": "car_night"
  }
 },
 "30": {
  "before": {
   "title": "傍晚・海風咖啡",
   "cast": [
    {
     "id": "xiaoying",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（難得的週五傍晚。小瑩來找哥哥，背著大學的書包。）"
    },
    {
     "who": "xiaoying",
     "text": "哥，我今天晚上要去同學家做報告，不用等我吃飯。"
    },
    {
     "who": "wu",
     "text": "幾點回來？"
    },
    {
     "who": "xiaoying",
     "text": "十點吧。你好囉嗦。"
    },
    {
     "who": "xiaoying",
     "text": "（對你）沈大哥，我哥說你很厲害。是真的嗎？"
    },
    {
     "who": "you",
     "text": "他亂講。"
    },
    {
     "who": "narr",
     "text": "（小瑩笑著揮手離開。那是你們那天最後一次看到她笑。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   }
  },
  "after": {
   "title": "凌晨・指揮所",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（凌晨三點。地圖上，舊漁會倉庫被圈起來。攻堅小組準備好了。）"
    },
    {
     "who": "wu",
     "text": "（手在抖）學長，她會沒事吧？"
    },
    {
     "who": "you",
     "text": "會。"
    },
    {
     "who": "narr",
     "text": "（小吳的手機響了。隱藏號碼。）"
    },
    {
     "who": "narr",
     "text": "綁匪：「你們改了計畫。我知道。」"
    },
    {
     "who": "narr",
     "text": "（電話掛斷。所有人看著彼此。待續。）"
    }
   ],
   "sceneWanted": "command_post"
  }
 },
 "31": {
  "before": {
   "title": "凌晨・海風咖啡（打烊後）",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "kui",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（03:00。你們借了咖啡店外面的桌子當臨時集合點，店裡沒開燈。小吳一直盯著手機。）"
    },
    {
     "who": "xu",
     "text": "喝一點。"
    },
    {
     "who": "wu",
     "text": "……不想喝。"
    },
    {
     "who": "kui",
     "text": "前輩，倉庫那邊的攻堅組回報了。"
    },
    {
     "who": "narr",
     "text": "（陳葵的臉色告訴你們答案：倉庫裡沒有人。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "night"
   }
  },
  "after": {
   "title": "清晨・漁港 7 號碼頭",
   "cast": [
    {
     "id": "xiaoying",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（小瑩裹著毯子坐在救護車後面。小吳抱著她，一句話都說不出來。）"
    },
    {
     "who": "xiaoying",
     "text": "哥……你眼鏡歪了。"
    },
    {
     "who": "wu",
     "text": "……閉嘴。"
    },
    {
     "who": "you",
     "text": "（綁匪拿到的彈頭碎片——你交出去的是哪一個？）",
     "id": "ep31_bullet",
     "choices": [
      {
       "text": "真的那顆",
       "set": "c_gave_real",
       "say": [
        {
         "who": "narr",
         "text": "（老錢早就拍照建檔、留了切片。證物還在，只是少了一顆實物。）"
        }
       ]
      },
      {
       "text": "老錢準備的假碎片",
       "set": "c_gave_fake",
       "say": [
        {
         "who": "narr",
         "text": "（老錢在電話裡笑了一聲：「三十年法醫，做個假彈頭還不簡單。」）"
        }
       ]
      }
     ]
    },
    {
     "who": "wu",
     "text": "學長……謝謝你。",
     "when": "arc:c_lend_wu"
    },
    {
     "who": "wu",
     "text": "學長，之前借錢的事……其實是小瑩的學費。對不起，我那時候沒說。",
     "when": "arc:c_ask_wu"
    }
   ],
   "sceneWanted": "harbour",
   "opt": {
    "time": "morning"
   }
  }
 },
 "32": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "barista",
     "x": 90
    },
    {
     "id": "xu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "wu",
     "text": "（推眼鏡）小瑩說，她記得冰艙裡很冷，但有人把一件外套丟進來給她。"
    },
    {
     "who": "you",
     "text": "誰？"
    },
    {
     "who": "wu",
     "text": "她沒看到臉。"
    },
    {
     "who": "barista",
     "text": "她沒事就好。這杯我請。"
    },
    {
     "who": "xu",
     "text": "……謝謝。"
    },
    {
     "who": "narr",
     "text": "（老闆轉身時，許知夏看著他的背影很久。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "黑貓的告別式外",
   "cast": [
    {
     "id": "ayue",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（來的人很少。阿月姨哭得最大聲。）"
    },
    {
     "who": "ayue",
     "text": "他每次都多給我五十塊……說是買我的八卦，其實是怕我付不出那個錢。"
    },
    {
     "who": "you",
     "text": "哪個錢？"
    },
    {
     "who": "ayue",
     "text": "……你們警察不懂啦。"
    },
    {
     "who": "narr",
     "text": "（她把一包滷味放在黑貓的照片前面。）"
    }
   ],
   "sceneWanted": "funeral",
   "arc": "blackcat_notes"
  }
 },
 "33": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "cai",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（蔡明宏照例來買外帶，兩杯美式。）"
    },
    {
     "who": "cai",
     "text": "今天盤點，你們也要來？"
    },
    {
     "who": "you",
     "text": "督察組要求的。"
    },
    {
     "who": "cai",
     "text": "好啊，人多比較快。C 區很亂，十幾年沒人整理了。"
    },
    {
     "who": "narr",
     "text": "（他拿了咖啡就走。豆花對著他的背影搖了搖尾巴。）"
    },
    {
     "who": "wu",
     "text": "明宏哥人真的很好。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "收工後・證物室門口",
   "cast": [
    {
     "id": "kui",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    },
    {
     "id": "li",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "kui",
     "text": "指紋要明天才出來。"
    },
    {
     "who": "xu",
     "text": "字是「証」。"
    },
    {
     "who": "wu",
     "text": "很多人這樣寫啦……"
    },
    {
     "who": "narr",
     "text": "（你想起早上蔡明宏手上那張盤點單。你沒有說出來。）"
    },
    {
     "who": "li",
     "text": "這件事，今晚之前不要在任何地方講。任何地方。"
    }
   ],
   "sceneWanted": "police"
  }
 },
 "34": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "li",
     "x": 30
    },
    {
     "id": "ye",
     "x": 60
    },
    {
     "id": "barista",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "li",
     "text": "（坐下，放下茶包）指紋比對回來了。三個人。"
    },
    {
     "who": "ye",
     "text": "今天不在這裡講。去督察組。"
    },
    {
     "who": "li",
     "text": "同意。"
    },
    {
     "who": "barista",
     "text": "兩位今天不坐？"
    },
    {
     "who": "li",
     "text": "不坐。"
    },
    {
     "who": "narr",
     "text": "（他們走了。老闆把擦好的杯子放回架上，放得很慢。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning",
    "rain": true
   }
  },
  "after": {
   "title": "傍晚・海風咖啡",
   "cast": [
    {
     "id": "barista",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（你一個人回咖啡店拿外套。老闆一邊收椅子一邊跟你聊天。）"
    },
    {
     "who": "barista",
     "text": "聽說彈頭要送台北重驗？辛苦了。"
    },
    {
     "who": "narr",
     "text": "（那個消息，是黎光耀兩小時前在督察組會議室故意說的假消息。只在那裡說過。）"
    },
    {
     "who": "you",
     "text": "（要怎麼回答？）",
     "id": "ep34_cafe",
     "choices": [
      {
       "text": "「嗯，明天送。」若無其事",
       "set": "c_play_along",
       "say": [
        {
         "who": "barista",
         "text": "路上小心。"
        }
       ]
      },
      {
       "text": "「你聽誰說的？」",
       "set": "c_press_barista",
       "say": [
        {
         "who": "barista",
         "text": "……客人說的吧。我忘了。"
        }
       ]
      }
     ]
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   },
   "arc": "cafe_knows"
  }
 },
 "35": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "li",
     "x": 30
    },
    {
     "id": "barista",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（押送前一小時。黎光耀打電話來。）"
    },
    {
     "who": "li",
     "text": "押送前集合。照原定，在咖啡店外面？",
     "when": "arc:cafe_knows",
     "id": "ep35_meet",
     "choices": [
      {
       "text": "「改在局裡。只派小吳去買咖啡。」",
       "set": "c_moved_meeting",
       "say": [
        {
         "who": "li",
         "text": "……好。理由你之後告訴我。"
        }
       ]
      },
      {
       "text": "「照原定。」",
       "say": [
        {
         "who": "li",
         "text": "好。"
        }
       ]
      }
     ]
    },
    {
     "who": "narr",
     "text": "（你們照原定在咖啡店外面集合。）",
     "unless": "arc:c_moved_meeting"
    },
    {
     "who": "narr",
     "text": "（小吳一個人來買咖啡。）",
     "when": "arc:c_moved_meeting"
    },
    {
     "who": "barista",
     "text": "今天這麼早？要出任務？"
    },
    {
     "who": "wu",
     "text": "呃……沒有啦，例行公事。"
    },
    {
     "who": "barista",
     "text": "路上小心。港濱路那邊在修路。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "夜・督察組",
   "cast": [
    {
     "id": "li",
     "x": 30
    },
    {
     "id": "ye",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    },
    {
     "id": "_you",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "li",
     "text": "Y 死了。X 還在外面。"
    },
    {
     "who": "ye",
     "text": "咖啡店老闆不說上家。蘇律師已經到了。"
    },
    {
     "who": "xu",
     "text": "又是蘇律師。"
    },
    {
     "who": "li",
     "text": "律師替誰辯護，不犯法。"
    },
    {
     "who": "you",
     "text": "他說了一個字。「海」。"
    },
    {
     "who": "li",
     "text": "海龍會。海風咖啡。海巡。港濱路叫海濱路的時候……這個城市什麼都叫海。"
    },
    {
     "who": "narr",
     "text": "（窗外在下雨。沒有人再說話。）"
    }
   ],
   "sceneWanted": "police",
   "arc": "x_outside"
  }
 },
 "36": {
  "before": {
   "title": "早上・海風咖啡（換老闆了）",
   "cast": [
    {
     "id": "abin",
     "x": 30
    },
    {
     "id": "abinmom",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    },
    {
     "id": "su",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（暫停營業一週後，咖啡店又開了。櫃台後面是送貨員阿彬和他媽媽。）"
    },
    {
     "who": "abin",
     "text": "沈哥！以後是我顧店了。我媽說豆子我最熟。"
    },
    {
     "who": "abinmom",
     "text": "我只會煮咖啡和滷蛋。你們不要嫌棄。"
    },
    {
     "who": "wu",
     "text": "滷蛋配咖啡？"
    },
    {
     "who": "abinmom",
     "text": "好吃啦。"
    },
    {
     "who": "narr",
     "text": "（店名還是「海風咖啡」。最右邊那一桌，蘇律師照常在看報紙。）"
    },
    {
     "who": "su",
     "text": "（翻報紙）換老闆了？咖啡的味道倒是沒變。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "深夜・你家樓下",
   "cast": [
    {
     "id": "zhou",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（周振邦開車送你回家。他沒有熄火。）"
    },
    {
     "who": "zhou",
     "text": "我信你。",
     "when": "arc:c_roster_zhou"
    },
    {
     "who": "zhou",
     "text": "程序就是程序。我會盯著。",
     "unless": "arc:c_roster_zhou"
    },
    {
     "who": "zhou",
     "text": "這段時間，不要碰案子。不要去找任何人。"
    },
    {
     "who": "you",
     "text": "林正雄說，有人叫他閉嘴。"
    },
    {
     "who": "zhou",
     "text": "……所以他死了。你明白嗎？"
    },
    {
     "who": "narr",
     "text": "（車子開走了。你站在樓下，抬頭看自己家的窗戶，第一次覺得那裡不安全。）"
    }
   ],
   "opt": {
    "time": "night"
   },
   "arc": "shen_framed"
  }
 },
 "37": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abinmom",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（你停職了。每天早上還是來這裡，坐同一個位子。許知夏在你對面坐下。）"
    },
    {
     "who": "xu",
     "text": "我今天要去槍械室。你不能來。"
    },
    {
     "who": "you",
     "text": "我知道。"
    },
    {
     "who": "xu",
     "text": "有什麼要我看的？"
    },
    {
     "who": "you",
     "text": "簽名。我簽名最後一筆會往上勾。"
    },
    {
     "who": "abinmom",
     "text": "（端來一盤滷蛋）吃一點。停職也要吃飯。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "收工後・海風咖啡",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "xu",
     "text": "不是你。"
    },
    {
     "who": "you",
     "text": "我知道。"
    },
    {
     "who": "xu",
     "text": "我是說——我證明了。"
    },
    {
     "who": "xu",
     "text": "走廊上的人穿雨衣。"
    },
    {
     "who": "xu",
     "text": "……阿桃姨說的那個人，也穿雨衣。",
     "when": "arc:shen_murder"
    },
    {
     "who": "you",
     "text": "（要怎麼回她？）",
     "id": "ep37_thanks",
     "choices": [
      {
       "text": "「謝謝妳。」",
       "set": "c_thank_xu",
       "say": [
        {
         "who": "xu",
         "text": "……不客氣。茶錢你付。"
        }
       ]
      },
      {
       "text": "「還不夠。」",
       "say": [
        {
         "who": "xu",
         "text": "我知道還不夠。所以明天繼續。"
        }
       ]
      }
     ]
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   }
  }
 },
 "38": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abin",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "wu",
     "text": "學長，我今天要去你家。許前輩說我要自己查。"
    },
    {
     "who": "you",
     "text": "鑰匙。"
    },
    {
     "who": "wu",
     "text": "你家……有什麼我不能看的嗎？"
    },
    {
     "who": "you",
     "text": "冰箱。"
    },
    {
     "who": "abin",
     "text": "（擦櫃台）欸，對了，重新裝修的時候，櫃台下面拆出一個奇怪的小盒子，我丟在後巷回收箱了。"
    },
    {
     "who": "wu",
     "text": "……什麼樣的盒子？"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "收工後・你家",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（小吳把拆下來的煙霧偵測器放在證物袋裡，坐在你家的沙發上。）"
    },
    {
     "who": "wu",
     "text": "學長……你家真的好空。"
    },
    {
     "who": "wu",
     "text": "牆上那張照片，是你舅舅？"
    },
    {
     "who": "you",
     "text": "嗯。"
    },
    {
     "who": "wu",
     "text": "你笑起來跟他有點像。"
    },
    {
     "who": "you",
     "text": "我沒有笑。"
    },
    {
     "who": "wu",
     "text": "剛剛有。一下下。"
    }
   ],
   "sceneWanted": "apartment",
   "opt": {
    "time": "night"
   }
  }
 },
 "39": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "deng",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "su",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（一個穿黑西裝的中年男人在你旁邊坐下。你認得他。）",
     "when": "arcfound:evroom_rumor"
    },
    {
     "who": "narr",
     "text": "（一個穿黑西裝的中年男人在你旁邊坐下。）",
     "unless": "arcfound:evroom_rumor"
    },
    {
     "who": "deng",
     "text": "沈先生？我姓鄧，以前在澄港當過警察，現在做保全。聽說你最近……有空。"
    },
    {
     "who": "you",
     "text": "停職。"
    },
    {
     "who": "deng",
     "text": "我有個展覽，需要一個看得懂現場的人。不用警證，用眼睛就好。"
    },
    {
     "who": "su",
     "text": "（翻報紙，頭也不抬）停職的人接私活，要小心喔。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "傍晚・海風咖啡",
   "cast": [
    {
     "id": "deng",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "deng",
     "text": "我以前也常來這裡。舊老闆煮的咖啡比較苦。"
    },
    {
     "who": "deng",
     "text": "台北那次你很年輕。",
     "when": "arcfound:evroom_rumor"
    },
    {
     "who": "deng",
     "text": "跟你說一件事。2011 年值班表上那個黃金水，最近換了一台新的進口車。"
    },
    {
     "who": "deng",
     "text": "以前他騎一台破野狼，騎了十幾年。"
    },
    {
     "who": "deng",
     "text": "車牌是 ……我寫給你。",
     "when": "arcfound:evroom_rumor"
    },
    {
     "who": "deng",
     "text": "退休警察，哪來的錢？"
    },
    {
     "who": "you",
     "text": "你為什麼告訴我？"
    },
    {
     "who": "deng",
     "text": "因為我當年什麼都沒說。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   },
   "arc": "deng_tip"
  }
 },
 "40": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "ye",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "zhou",
     "x": 90
    },
    {
     "id": "kui",
     "x": 120
    },
    {
     "id": "xu",
     "x": 150
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（羈押庭開庭前。大家都來了，沒有人說話。）"
    },
    {
     "who": "ye",
     "text": "我不能當你的檢察官。我只能當證人。"
    },
    {
     "who": "you",
     "text": "我知道。"
    },
    {
     "who": "ye",
     "text": "方以誠檢察官是個公正的人。這是好消息，也是壞消息。"
    },
    {
     "who": "zhou",
     "text": "（把一把傘放在你旁邊）走吧。我開車。"
    },
    {
     "who": "kui",
     "text": "前輩！加油！"
    },
    {
     "who": "xu",
     "text": "……別輸。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning",
    "rain": true
   }
  },
  "after": {
   "title": "法院外",
   "cast": [
    {
     "id": "he",
     "x": 30
    },
    {
     "id": "zhou",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    },
    {
     "id": "wu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（你走出法院。外面有記者，有閃光燈。）"
    },
    {
     "who": "he",
     "text": "（擠過來）沈警官！我寫的那篇，你看了嗎？",
     "when": [
      "arc:c_help_he",
      "arc:c_help_he2"
     ]
    },
    {
     "who": "he",
     "text": "（站在記者群後面，沒有過來）",
     "unless": [
      "arc:c_help_he",
      "arc:c_help_he2"
     ]
    },
    {
     "who": "narr",
     "text": "（電視牆上，韓副局長在記者會說：「警方會依法處理，不護短，也不冤枉任何一個同仁。」）"
    },
    {
     "who": "zhou",
     "text": "回家吧。明天開始，你還是停職。"
    },
    {
     "who": "xu",
     "text": "但你可以喝咖啡。"
    },
    {
     "who": "wu",
     "text": "我請！"
    }
   ],
   "opt": {
    "time": "dusk"
   },
   "arc": "bail_granted"
  }
 },
 "41": {
  "before": {
   "title": "傍晚・海風咖啡",
   "cast": [
    {
     "id": "ayue",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abinmom",
     "x": 90
    },
    {
     "id": "wu",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "ayue",
     "text": "（提著一大袋菜）今晚六點，我家。全部都要來。停職的也要來。"
    },
    {
     "who": "you",
     "text": "我……"
    },
    {
     "who": "ayue",
     "text": "你不來我就把滷蛋全部倒掉。"
    },
    {
     "who": "abinmom",
     "text": "我也去！我帶咖啡凍。"
    },
    {
     "who": "wu",
     "text": "颱風要來了耶，阿姨。"
    },
    {
     "who": "ayue",
     "text": "颱風又不會吃火鍋。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   }
  },
  "after": {
   "title": "深夜・阿月姨家後院",
   "cast": [
    {
     "id": "ayue",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（大家都沒事。救護車走了。阿月姨坐在後院台階上。）"
    },
    {
     "who": "ayue",
     "text": "我每個月交錢給海龍會，三十年了。"
    },
    {
     "who": "ayue",
     "text": "以前是黑貓的朋友來收。黑貓的小冊子，你們找到了吧？",
     "when": "arc:blackcat_notes"
    },
    {
     "who": "ayue",
     "text": "上個月他們說，以後交給一個退休的警察管。"
    },
    {
     "who": "you",
     "text": "你看過他嗎？"
    },
    {
     "who": "ayue",
     "text": "一次。圓臉，開新車，手上戴金錶。笑起來很客氣。"
    }
   ],
   "opt": {
    "time": "night"
   },
   "arc": "ayue_collector"
  }
 },
 "42": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "abin",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（你帶著一個舊紙箱來咖啡店。箱子上寫著「國棟」。）"
    },
    {
     "who": "abin",
     "text": "沈哥，那是什麼？"
    },
    {
     "who": "you",
     "text": "我舅舅的東西。十六年沒打開。"
    },
    {
     "who": "abin",
     "text": "……要不要我幫你泡一杯熱的？"
    },
    {
     "who": "narr",
     "text": "（你打開箱子。最上面是一本黑色筆記本。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning",
    "rain": true
   }
  },
  "after": {
   "title": "深夜・你家",
   "cast": [
    {
     "id": "_you",
     "x": 30
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（筆記本攤在桌上。最後一頁的字很潦草。）"
    },
    {
     "who": "narr",
     "text": "「小安看到的東西，就是那些槍。」"
    },
    {
     "who": "you",
     "text": "……你一直在找他。"
    },
    {
     "who": "narr",
     "text": "（窗外，有人在樓下抽菸。你拉上窗簾。）"
    }
   ],
   "sceneWanted": "apartment",
   "opt": {
    "time": "night"
   }
  }
 },
 "43": {
  "before": {
   "title": "晚上・海風咖啡",
   "cast": [
    {
     "id": "wu",
     "x": 30
    },
    {
     "id": "xu",
     "x": 60
    },
    {
     "id": "abin",
     "x": 90
    },
    {
     "id": "_you",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "wu",
     "text": "防空洞……我不會游泳耶。"
    },
    {
     "who": "xu",
     "text": "我們是去找檔案，不是去游泳。"
    },
    {
     "who": "abin",
     "text": "（端來三杯外帶）你們要去找的那個小孩……找到了，跟我說一聲好不好？"
    },
    {
     "who": "you",
     "text": "為什麼？"
    },
    {
     "who": "abin",
     "text": "不知道。就是……想知道他後來好不好。"
    },
    {
     "who": "narr",
     "text": "（阿彬媽媽在櫃台後面，把杯子擦了一遍又一遍。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "night"
   }
  },
  "after": {
   "title": "凌晨・海風咖啡（打烊後）",
   "cast": [
    {
     "id": "abinmom",
     "x": 30
    },
    {
     "id": "abin",
     "x": 60
    },
    {
     "id": "_you",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（指紋卡和阿彬的指紋，一模一樣。）"
    },
    {
     "who": "abinmom",
     "text": "那天晚上好冷……他躲在我的冰櫃後面，嘴唇都紫了。我兒子剛走半年……我就……"
    },
    {
     "who": "abin",
     "text": "媽。"
    },
    {
     "who": "abin",
     "text": "我記得雨衣。很多雨衣。還有一個人……左手少了一根手指。"
    },
    {
     "who": "you",
     "text": "（莊太太當年沒有報警。現在要怎麼處理？）",
     "id": "ep43_mom",
     "choices": [
      {
       "text": "依法通報，但幫她寫陳情書",
       "set": "c_report_mom",
       "say": [
        {
         "who": "abinmom",
         "text": "……好。我早就該去了。"
        }
       ]
      },
      {
       "text": "「明天去不去自首，妳自己決定。」",
       "set": "c_let_mom_choose",
       "say": [
        {
         "who": "abinmom",
         "text": "謝謝你……我會去的。"
        },
        {
         "who": "narr",
         "text": "（隔天，她自己去了派出所。）"
        }
       ]
      }
     ]
    },
    {
     "who": "abin",
     "text": "沈哥……我還是阿彬，對吧？"
    },
    {
     "who": "you",
     "text": "對。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "night"
   },
   "arc": [
    "abin_is_xiaoan",
    "nine_fingers"
   ]
  }
 },
 "44": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "abinmom",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "ye",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（阿彬今天沒來顧店。只有他媽媽，眼睛還是腫的。）"
    },
    {
     "who": "abinmom",
     "text": "他說要休息一天。"
    },
    {
     "who": "you",
     "text": "你們……"
    },
    {
     "who": "abinmom",
     "text": "沈先生，你要抓我，我不會跑。"
    },
    {
     "who": "ye",
     "text": "（坐下）今天不談這個。今天我們去抓另一個人。"
    },
    {
     "who": "ye",
     "text": "方檢主辦，我協辦。你，只是證人。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "夜・黃金水家門口",
   "cast": [
    {
     "id": "jinshui",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（黃金水被帶上警車前，回頭看了你一眼。）"
    },
    {
     "who": "jinshui",
     "text": "你跟你舅舅一樣。不聽話。"
    },
    {
     "who": "you",
     "text": "是誰？"
    },
    {
     "who": "jinshui",
     "text": "我只是一隻手。手不知道頭在想什麼。"
    },
    {
     "who": "narr",
     "text": "（他的左手抓著車門。五根手指。）",
     "when": "arc:nine_fingers"
    }
   ],
   "opt": {
    "time": "night"
   }
  }
 },
 "45": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "kui",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    },
    {
     "id": "xu",
     "x": 90
    },
    {
     "id": "su",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "kui",
     "text": "前輩！黃金水認了！"
    },
    {
     "who": "wu",
     "text": "這樣學長就沒事了吧？"
    },
    {
     "who": "xu",
     "text": "還要等檢察官。"
    },
    {
     "who": "su",
     "text": "（翻報紙）認罪的人，有時候也會改口喔。"
    },
    {
     "who": "narr",
     "text": "（大家轉頭看他。他已經又低頭看報紙了。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "雨夜・海風咖啡",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "zhou",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    },
    {
     "id": "kui",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（許知夏的行李箱靠在桌邊。周振邦的調令放在桌上。）"
    },
    {
     "who": "xu",
     "text": "台北的鑑識中心。下週一報到。"
    },
    {
     "who": "xu",
     "text": "這個給你。（她把鑑識手電筒放在桌上）不要弄丟。",
     "when": "arc:xu_flashlight"
    },
    {
     "who": "zhou",
     "text": "交通大隊。我這把年紀，去指揮交通。"
    },
    {
     "who": "zhou",
     "text": "交通大隊也有很多監視器。",
     "when": "arc:zhou_traffic_help"
    },
    {
     "who": "wu",
     "text": "我還在！我不會走！"
    },
    {
     "who": "kui",
     "text": "我也是！"
    },
    {
     "who": "narr",
     "text": "（但第二天早上，咖啡店外面只剩你和豆花。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "night",
    "rain": true
   },
   "arc": "team_split"
  }
 },
 "46": {
  "before": {
   "title": "清晨・海風咖啡",
   "cast": [
    {
     "id": "abin",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（只有你一個人。豆花趴在你腳邊。）"
    },
    {
     "who": "abin",
     "text": "沈哥，今天要不要也來一個三明治？"
    },
    {
     "who": "you",
     "text": "嗯。"
    },
    {
     "who": "abin",
     "text": "……我媽說，你那天讓她自己決定要不要自首。謝謝你。",
     "when": "arc:c_let_mom_choose"
    },
    {
     "who": "abin",
     "text": "我媽去做筆錄了。她說，她早就該去。",
     "when": "arc:c_report_mom"
    },
    {
     "who": "abin",
     "text": "漁港的魚市在徵臨時工。你有興趣嗎？我認識老闆。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "凌晨・魚市過磅台",
   "cast": [
    {
     "id": "_you",
     "x": 30
    },
    {
     "id": "abinmom",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（夜班快結束了。老包被帶走，魚市的人都在看你。）"
    },
    {
     "who": "you",
     "text": "（海龍漁業的貨箱……每一箱都比標示重四到六公斤。）",
     "when": "arc:tuna_heavy"
    },
    {
     "who": "you",
     "text": "（又是海龍。）",
     "when": "arc:harbour_route"
    },
    {
     "who": "narr",
     "text": "（你把貨箱編號抄在手背上。豆花打了一個噴嚏。）",
     "when": "arc:tuna_heavy"
    },
    {
     "who": "abinmom",
     "text": "（打電話來）沈先生，夜班冷，我煮了薑茶放在店門口。",
     "when": "arc:c_let_mom_choose"
    },
    {
     "who": "abinmom",
     "text": "（打電話來）沈先生，我做完筆錄了。店門口有薑茶。",
     "when": "arc:c_report_mom"
    }
   ],
   "opt": {
    "time": "night"
   }
  }
 },
 "47": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "abin",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abinmom",
     "x": 90
    },
    {
     "id": "su",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（你剛下夜班，身上還有冰塊的味道。豆花在聞你的褲管。）"
    },
    {
     "who": "abin",
     "text": "沈哥，魚市的工作還可以嗎？"
    },
    {
     "who": "you",
     "text": "老闆說我過磅很準。"
    },
    {
     "who": "abinmom",
     "text": "（端來熱湯）夜班的人要喝熱的。"
    },
    {
     "who": "abin",
     "text": "對了……魚市的人在講，海邊停車場那邊一早來了很多警車。"
    },
    {
     "who": "su",
     "text": "（翻報紙）停職的人，就別去湊熱鬧了吧。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  },
  "after": {
   "title": "夜・海邊停車場外",
   "cast": [
    {
     "id": "zhouyiqing",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（封鎖線拆了。周昀安抱著豆花，坐在路邊。）"
    },
    {
     "who": "zhouyiqing",
     "text": "媽媽說，她把手機清乾淨了，他們找不到我。"
    },
    {
     "who": "you",
     "text": "妳媽媽很勇敢。"
    },
    {
     "who": "you",
     "text": "妳可以哭。哭多久都可以。",
     "when": "arc:c_mercy_24"
    },
    {
     "who": "zhouyiqing",
     "text": "……遺書最後一行，說帳在我小時候最愛的那本書裡。"
    },
    {
     "who": "narr",
     "text": "（她從書包裡拿出一本舊舊的《小王子》，放在你手上。）"
    },
    {
     "who": "zhouyiqing",
     "text": "你會讓他們付出代價嗎？"
    },
    {
     "who": "you",
     "text": "會。"
    }
   ],
   "opt": {
    "time": "night"
   },
   "arc": "accountant_code"
  }
 },
 "48": {
  "before": {
   "title": "深夜・海風咖啡（打烊後）",
   "cast": [
    {
     "id": "kui",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abin",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（咖啡店打烊了。阿彬留了一盞燈給你。桌上攤著那本《小王子》。）"
    },
    {
     "who": "kui",
     "text": "（拉開椅子）下班時間，誰也管不著我。"
    },
    {
     "who": "you",
     "text": "妳會被記過。"
    },
    {
     "who": "kui",
     "text": "前輩以前也被記過啊。"
    },
    {
     "who": "abin",
     "text": "（放下兩杯熱可可）我不在喔。我什麼都沒看到。"
    },
    {
     "who": "narr",
     "text": "（豆花趴在《小王子》旁邊，好像在守著它。）"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "night",
    "rain": true
   }
  },
  "after": {
   "title": "凌晨・你家",
   "cast": [
    {
     "id": "kui",
     "x": 30
    },
    {
     "id": "wu",
     "x": 60
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（牆上貼滿了紙條。箭頭從「海龍漁業」一路畫到「台北」。）"
    },
    {
     "who": "kui",
     "text": "三年，三億兩千萬。"
    },
    {
     "who": "kui",
     "text": "前輩……這個華晟，跟一家律師事務所在同一層樓。",
     "when": "arc:huasheng"
    },
    {
     "who": "wu",
     "text": "（在門口，提著兩袋宵夜）我只是剛好路過。剛好買太多。",
     "when": "arc:c_lend_wu"
    },
    {
     "who": "wu",
     "text": "（在門口，提著兩袋宵夜）我只是剛好路過。剛好買太多。",
     "when": "arc:c_ask_wu",
     "unless": "arc:c_lend_wu"
    },
    {
     "who": "narr",
     "text": "（窗外的路燈閃了一下。樓下沒有人在抽菸了。）"
    }
   ],
   "sceneWanted": "apartment",
   "opt": {
    "time": "night"
   }
  }
 },
 "49": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（最外面那張桌子，有人比你早到。一個行李箱，一個鑑識工具箱。）"
    },
    {
     "who": "xu",
     "text": "我請了一週的假。"
    },
    {
     "who": "you",
     "text": "妳……"
    },
    {
     "who": "xu",
     "text": "機票我自己出的，不用謝。"
    },
    {
     "who": "xu",
     "text": "手電筒呢？我說過不要弄丟。",
     "when": "arc:xu_flashlight"
    },
    {
     "who": "you",
     "text": "（從口袋拿出來）在這裡。",
     "when": "arc:xu_flashlight"
    },
    {
     "who": "xu",
     "text": "上次是你陪我熬夜。這次換我。",
     "when": "arc:c_xu_overnight"
    },
    {
     "who": "wu",
     "text": "（跑過來）許前輩！妳怎麼——"
    },
    {
     "who": "xu",
     "text": "小吳，你沒看到我。"
    },
    {
     "who": "wu",
     "text": "……我什麼都沒看到。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   },
   "arc": "xu_back"
  },
  "after": {
   "title": "深夜・海風咖啡",
   "cast": [
    {
     "id": "xu",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abinmom",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（很晚的晚餐。只有你和許知夏坐在外面。）"
    },
    {
     "who": "xu",
     "text": "22:14:52，你在家門口簽收一碗牛肉麵。"
    },
    {
     "who": "you",
     "text": "我自己都忘了。"
    },
    {
     "who": "xu",
     "text": "所以才需要證據，不是記憶。"
    },
    {
     "who": "abinmom",
     "text": "（多放了兩顆滷蛋）這兩顆是慶祝的。"
    },
    {
     "who": "xu",
     "text": "我下週一要回台北。"
    },
    {
     "who": "xu",
     "text": "但這次，我是回去查台北那一半的。",
     "when": "arc:money_trail"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "night"
   }
  }
 },
 "50": {
  "before": {
   "title": "傍晚・海風咖啡",
   "cast": [
    {
     "id": "ayue",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "abin",
     "x": 90
    }
   ],
   "lines": [
    {
     "who": "ayue",
     "text": "（氣喘吁吁）黑狗的房子昨晚燒了，人不見了。"
    },
    {
     "who": "ayue",
     "text": "魚市的人說，他躲在舊漁會倉庫後面的船屋。今晚有人要去找他。"
    },
    {
     "who": "you",
     "text": "誰？"
    },
    {
     "who": "ayue",
     "text": "還能有誰。"
    },
    {
     "who": "narr",
     "text": "（最右邊那張桌子空著。報紙攤在桌上，沒有人翻。）"
    },
    {
     "who": "abin",
     "text": "蘇律師今天沒來耶。他從來不缺席的。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "dusk"
   }
  },
  "after": {
   "title": "夜・局裡門口",
   "cast": [
    {
     "id": "_you",
     "x": 30
    },
    {
     "id": "he",
     "x": 60
    },
    {
     "id": "han",
     "x": 90
    },
    {
     "id": "zhou",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（黑狗在醫院，有人二十四小時看守。蘇明哲被帶上車時，回頭看了一眼局裡的大樓。）"
    },
    {
     "who": "you",
     "text": "（左手少一根手指的人……黑狗不敢說。）",
     "when": "arc:nine_fingers"
    },
    {
     "who": "he",
     "text": "沈警官，第一篇報導，我寫你回來了。",
     "when": "arc:he_article_good"
    },
    {
     "who": "he",
     "text": "沈警官……之前那篇，對不起。",
     "when": "arc:he_article_bad"
    },
    {
     "who": "han",
     "text": "（從大樓走出來，伸出手）沈岳。歡迎回來。這段時間辛苦你了。"
    },
    {
     "who": "you",
     "text": "謝謝局長。"
    },
    {
     "who": "narr",
     "text": "（握手。很溫暖，很有力。）"
    },
    {
     "who": "zhou",
     "text": "（電話裡）華晟在台北，蘇的事務所在台北也有分所。"
    },
    {
     "who": "zhou",
     "text": "這張網，比我們以為的還大。"
    }
   ],
   "opt": {
    "time": "night"
   },
   "arc": "taipei_network"
  }
 },
 "51": {
  "before": {
   "title": "早上・海風咖啡",
   "cast": [
    {
     "id": "abin",
     "x": 30
    },
    {
     "id": "_you",
     "x": 60
    },
    {
     "id": "wu",
     "x": 90
    },
    {
     "id": "kui",
     "x": 120
    },
    {
     "id": "abinmom",
     "x": 150
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（你的警證又回到口袋裡了。阿彬在擦最右邊那張桌子，擦得特別久。）"
    },
    {
     "who": "abin",
     "text": "沈哥，這張桌子……以後要留給誰？"
    },
    {
     "who": "you",
     "text": "留給想坐的人。"
    },
    {
     "who": "wu",
     "text": "學長！今天開始我可以光明正大跟你辦案了！"
    },
    {
     "who": "kui",
     "text": "我一直都很光明正大啊。"
    },
    {
     "who": "abinmom",
     "text": "今天全部免費。滷蛋也是。"
    }
   ],
   "sceneWanted": "cafe",
   "opt": {
    "time": "morning"
   }
  }
 }
};
