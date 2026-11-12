/* 主線資料（第 4–15 集）—— 劇透，由「主線」thread 產生。載入順序：arc.js 之後、各集 case 檔之前。
   1) ARC.defineCast：固定班底。幕間 cast 用這些 id；案件中出場也可以 look:ARC.look("xu")。
   2) ARC.define：主線旗標的標題和筆記內容。ARC_SETS 寫明哪一集的哪樣東西要加 arc:旗標；下一集的 arcRecap 對這些旗標寫 text/miss。
   3) ARC_INTER[集數].after：貼到該集 C.after。scene 只用 PX.SCENES 現有的；sceneWanted＝建議新做的場景（麵攤、高鐵、安全屋、告別式），做好之前只有對話。
   幕間只聊天、埋伏筆，不放破案線索。 */
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
   "coat": "#3a3f4a",
   "bottom": "#2a2f3a"
  }
 },
 "ye": {
  "name": "葉晴",
  "look": {
   "skin": "#f0d0b4",
   "hair": "#1e1a18",
   "hairStyle": "long",
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
  "look": {"age": "old", "skin": "#e0b48c", "hair": "#9a9a92", "hairStyle": "slick", "top": "#e9e4da", "coat": "#2a3a5a", "bottom": "#2a3a5a", "glasses": true}
 },
 "longshu": {
  "name": "龍叔",
  "look": {"age": "old", "skin": "#c08a60", "hair": "#d8d8d0", "hairStyle": "short", "top": "#f4f4f0", "bottom": "#3a3a3a"}
 },
 "doufa": {
  "name": "豆花",
  "note": "拉布拉多鑑識犬，需要新做狗的 sprite"
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
 "ext_4417": "第 15 集：電信回覆或市話錄音"
};

var ARC_INTER = {
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
    }
   ],
   "arc": "gun_lab_sent",
   "scene": "lab"
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
     "text": "你自己跟她說。"
    },
    {
     "who": "zhao",
     "text": "……好。"
    },
    {
     "who": "narr",
     "text": "（門關上。）"
    }
   ],
   "arc": "zhao_promise",
   "sceneWanted": "safehouse"
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
    }
   ],
   "arc": "ye_first_name",
   "scene": "hospital"
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
  }
 }
};
