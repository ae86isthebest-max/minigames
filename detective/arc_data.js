/* 主線資料（第 4–20 集；第 11–20 集另有 before 開場生活小場景，第 2–20 集全部固定在露天咖啡店「海風咖啡」外面座位，scene 請做 cafe）—— 劇透，由「主線」thread 產生。載入順序：arc.js 之後、各集 case 檔之前。
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
   "coat": "#6a4a2a",
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
 "he_usb": "第 20 集：何沛恩交隨身碟的事件"
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
     "text": "老闆，咖啡豆放門口喔！（對小吳）欸，上次那關你過了沒？"
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
 }
};
