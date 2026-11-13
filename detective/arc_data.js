/* 主線資料（第 4–20 集；第 11–20 集另有 before 開場生活小場景）—— 劇透，由「主線」thread 產生。載入順序：arc.js 之後、各集 case 檔之前。
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
  },
  "before": {
   "title": "早上・刑事大隊辦公室",
   "cast": [
    {
     "id": "wu",
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
     "text": "（星期一早上八點。小吳趴在桌上，桌上堆著升等考試的書。）"
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
    }
   ],
   "scene": "office"
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
     "who": "narr",
     "text": "（門關上。）"
    }
   ],
   "arc": "zhao_promise",
   "sceneWanted": "safehouse"
  },
  "before": {
   "title": "早餐店",
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
     "text": "（局對面的早餐店，老闆娘已經認得你們。）"
    },
    {
     "who": "narr",
     "text": "老闆娘：沈先生照舊，蘿蔔糕加蛋、冰豆漿。"
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
     "text": "（電視新聞正在播：巡佐失聯，家屬報案。大家同時放下筷子。）"
    }
   ],
   "sceneWanted": "breakfast"
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
  },
  "before": {
   "title": "鑑識室的午休",
   "cast": [
    {
     "id": "wu",
     "x": 40
    },
    {
     "id": "xu",
     "x": 80
    },
    {
     "id": "qian",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（許知夏的桌上多了一盆多肉植物，名牌寫「證物 A」。）"
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
     "text": "（牆上真的貼著一張澆水紀錄表，精確到分鐘。）"
    }
   ],
   "scene": "lab"
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
   "title": "下班後・小吳的機車",
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
     "who": "narr",
     "text": "（下雨。小吳的機車發不動。）"
    },
    {
     "who": "wu",
     "text": "學長，可以載我一程嗎……"
    },
    {
     "who": "you",
     "text": "上車。"
    },
    {
     "who": "wu",
     "text": "你車上怎麼都是便利商店的飯糰包裝？你都不吃正餐嗎？"
    },
    {
     "who": "you",
     "text": "……"
    },
    {
     "who": "wu",
     "text": "明天我帶我媽做的滷肉飯給你。不准拒絕。"
    }
   ],
   "scene": "road"
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
   "title": "葉晴的辦公室",
   "cast": [
    {
     "id": "ye",
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
     "text": "（檢察署。葉晴桌上有一張弟弟小時候的照片。）"
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
     "text": "（她把照片轉過去，又轉回來。）"
    },
    {
     "who": "ye",
     "text": "……謝謝你那天的咖啡。很難喝。"
    }
   ],
   "scene": "office"
  }
 },
 "16": {
  "before": {
   "title": "督察組約談室",
   "cast": [
    {
     "id": "li",
     "x": 40
    },
    {
     "id": "_you",
     "x": 80
    },
    {
     "id": "zhou",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（趙德安過世一週。督察組逐一約談。）"
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
     "text": "你的隊長、你的助手、你的鑑識員，都說沒有。"
    },
    {
     "who": "li",
     "text": "那就是你們當中有人說謊，或是有人在偷聽。"
    },
    {
     "who": "narr",
     "text": "（他在本子上寫了一行字，你看不到。）"
    },
    {
     "who": "zhou",
     "text": "（門外）好了，問完了吧？我的人要去漁港查案。"
    }
   ],
   "scene": "police"
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
    }
   ],
   "sceneWanted": "harbour"
  }
 },
 "17": {
  "before": {
   "title": "阿月姨麵攤・中午",
   "cast": [
    {
     "id": "ayue",
     "x": 40
    },
    {
     "id": "xu",
     "x": 80
    },
    {
     "id": "wu",
     "x": 120
    }
   ],
   "lines": [
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
     "who": "ayue",
     "text": "明天廟會遶境，你們要不要來看？我們這攤會擺到半夜。"
    }
   ],
   "sceneWanted": "noodle"
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
     "who": "narr",
     "text": "（他走進散場的人群裡。）"
    }
   ],
   "sceneWanted": "temple"
  }
 },
 "18": {
  "before": {
   "title": "小吳家・出發前",
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
     "who": "narr",
     "text": "（小吳穿著太緊的西裝，對著鏡子打領帶，打了五次。）"
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
     "text": "（你幫他打好。小吳的妹妹小瑩在旁邊笑到彎腰。）"
    },
    {
     "who": "narr",
     "text": "小瑩：哥，你看起來像賣保險的。"
    },
    {
     "who": "wu",
     "text": "吳小瑩！"
    },
    {
     "who": "narr",
     "text": "（小瑩是小吳的妹妹，讀大學二年級。）"
    }
   ],
   "sceneWanted": "home"
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
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（新郎新娘在門口送客。小吳喝醉了，抱著豆花說話。）"
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
   "title": "許振業的老公寓",
   "cast": [
    {
     "id": "xuzy",
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
     "text": "（許知夏帶你去見她爸。屋裡很乾淨，但桌上有三個空酒瓶。）"
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
     "who": "narr",
     "text": "（他倒了一杯茶給你，自己倒了一杯酒。）"
    },
    {
     "who": "xu",
     "text": "爸。"
    },
    {
     "who": "xuzy",
     "text": "最後一杯。"
    }
   ],
   "sceneWanted": "apartment"
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
   "title": "夜市・下班後",
   "cast": [
    {
     "id": "wu",
     "x": 40
    },
    {
     "id": "xu",
     "x": 80
    },
    {
     "id": "qian",
     "x": 120
    }
   ],
   "lines": [
    {
     "who": "narr",
     "text": "（案子還沒來。你們難得準時下班，一起逛夜市。）"
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
     "text": "（你們排了二十分鐘的隊。那時候沒人知道，兩天後那攤會上新聞。）"
    }
   ],
   "sceneWanted": "nightmarket"
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
    }
   ],
   "sceneWanted": "apartment"
  }
 }
};
