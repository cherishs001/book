import MarkdownIt = require('markdown-it');
import { parse } from './parse';
import { TokenStream } from './TokenStream';

// import { Parser } from './parse';

const source = `WTCD 1.0
declare [
    number money = 100
    number arousal = 0
    number sensitivity = 10
    number aphrodisiac = 0
    boolean vibrator = false
    boolean vaginalDildo = false
    boolean analDildo = false
    boolean chastityBelt = false
]

section initialShop
    then goto purchaseList

section shop
    then goto purchaseList

section purchaseList then selection [
    choice "购买春药（20 元）" money >= 20 ? goto purchaseAphrodisiac : null

    vibrator ? null
        : choice "购买跳蛋（15 元）" money >= 15 ? goto purchaseVibrator : null

    vaginalDildo ? null
        : choice "购买阴道按摩棒（20 元）" money >= 20 ? goto purchaseVaginalDildo : null

    analDildo ? null
        : choice "购买肛门按摩棒（20 元）" money >= 20 ? goto purchaseAnalDildo : null

    chastityBelt ? null
        : choice "购买贞操带（50 元）" money >= 50 ? goto purchaseChastityBelt : null

    choice "离开商店" goto exitShop
]

section purchaseAphrodisiac {
    money -= 20
    aphrodisiac += 1
    sensitivity += (aphrodisiac == 5)
        ? 50 // 第五瓶春药是内服的。
        : 10
} then goto shop

section purchaseVibrator {
    money -= 15
    vibrator = true
} then goto shop

section purchaseVaginalDildo {
    money -= 20
    vaginalDildo = true
} then goto shop

section purchaseAnalDildo {
    money -= 20
    analDildo = true
} then goto shop

section purchaseChastityBelt {
    money -= 50
    chastityBelt = true
} then goto shop

section exitShop then ((!vibrator) && (!vaginalDildo) && (!analDildo))
    ? (chastityBelt)
        ? goto beltedDry
        : goto dry
    : (chastityBelt)
        ? goto belted
        : goto unbelted

---<<< initialShop >>>---
你走进了琳的玩具店。货架上摆满了各式各样的玩具。你身上还有 <$ money $> 元钱。你想要买什么呢？

---<<< shop >>>---
你继续在琳的玩具店内闲逛着。你身上还有 <$ money $> 元钱。你想要买什么呢？

---<<< purchaseAphrodisiac@1 >>>---
你忐忑不安地从货架上取下了一个装着紫色液体的小瓶子。将其交给店员并支付了 10 元后，你迫不及待地走进了卫生间，将紫色的液体均匀地涂抹在了你的阴蒂上。顿时，一股清凉的瘙痒感传便了全身。

---<<< purchaseAphrodisiac@2 >>>---
显然，一瓶春药并不能满足你饥渴的身体。你又从货架上取下了一瓶春药，付钱后将其涂抹在了乳头上。你那早已挺立的乳头顿时变得更硬了。

---<<< purchaseAphrodisiac@3 >>>---
你买下了第 3 瓶春药，并将其抹在了手指上，并缓缓插入了下体。一种火辣辣的感觉从你的体内传出。

---<<< purchaseAphrodisiac@4 >>>---
然而你还是没有满足，你又买了一瓶春药。你熟练地打开了瓶盖，将春药涂在了自己微微收缩的菊花上。

---<<< purchaseAphrodisiac@5 >>>---
早已因为春药失去理性的你，用最后剩下的钱买了第 5 瓶春药。尽管瓶子上明确写着外敷使用，被快感冲昏了头脑的你拧开了盖子，一口气将瓶子内的紫色液体喝了个精光。刹那间，一股火热传遍了全身。尽管没有任何外界刺激，你情不自禁地叫出了声。

---<<< purchaseVibrator >>>---
你花了 15 元购买了货架上的粉红色跳蛋。你迫不及待地打开了跳蛋的塑料包装，然后将跳蛋安装在了自己的阴蒂上。然而，这个跳蛋

`;

const source2 = `
WTCD 1.0
section a then selection [ choice "asd" goto b ]
section b then null

---<<< a >>>---
A

---<<< b >>>---
B
`;

// const ts = new TokenStream(source);
// while (!ts.eof()) {
//   console.info(ts.next());
// }

export const test = parse(source, new MarkdownIt(), console);
