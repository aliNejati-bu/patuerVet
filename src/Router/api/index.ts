import {Router} from "express";
import v1 from "./v1";
import axios from "axios";
import * as path from "path";

const router = Router();

router.use("/v1", v1);
router.post('/test', async (req, res) => {
        try {
            console.log("here")
            console.log(req.body);
            if (req.body.event == "message") {
                let phone = req.body.payload.from;
                let realphone = phone.split("@")[0];
                let body = req.body.payload.body;
                let name = req.body.payload._data.notifyName;
                if (!req.body.payload.hasMedia && !req.body.payload.fromMe) {
                    console.log({
                        chatId: phone,
                        text: `پیام از طرف ${realphone} در یافت شد.
نام فرستنده: ${name}
متن پیام:
${body}
                `,
                        session: "default"
                    });
                    await axios.post('http://103.75.199.220:3000/api/sendText', {
                        chatId: phone,
                        text: `پیام از طرف ${realphone} در یافت شد.
نام فرستنده: ${name}
متن پیام:
${body}
                `,
                        session: "default"
                    })
                }
            }
            res.send("okkkkk");
        } catch (e) {
            console.log("-------------------------------------------------------------------")
            console.log(e)
            console.log("********************************************************************")
            res.send("ok");
        }
    }
)
;
router.post('/panel', (req, res) => {
    return res.sendFile(path.join(__dirname, '../../../../public/index.html'))
});
let ersals: Array<{
    numbers: Array<{
        mobile: number,
        isStart: boolean,
        isSend: boolean
    }>,
    msg: string,
    id: string,
    rest: number
}> = [];
router.get('/app', (req, res) => {
    let r = ersals.find(x => x.id == (req.query as any).id);
    if (!r) {
        return res.status(404).send('وجود ندارد.');
    }
    let result = ``;
    r.numbers.forEach(e => {
        if (e.isStart) {
            if (e.isSend) {
                result += `${e.mobile} => ارسال  شده <br>`
            } else {
                result += `${e.mobile} => ارسال نشده <br>`
            }
        } else {
            result += `${e.mobile} => شروع نشده <br>`
        }
    });
    return res.send(result);
});


router.post('/startBroadcast', (req, res) => {
    let id = Date.now();
    ersals.push({
        numbers: req.body.numbers.map(e => {
            return {
                mobile: e,
                isStart: false,
                isSend: false
            }
        }),
        msg: req.body.msg,
        rest: req.body.rest,
        id: "" + id
    });
    let send = async function () {
        console.log("start")
        console.log(this)
        if (this.i >= this.numbers.length) {
            return;
        }
        let number = this.numbers[this.i];
        let inStorage = ersals.find(e => e.id == this.id);
        let numberObject = inStorage.numbers.find(n => n.mobile == number);
        numberObject.isStart = true;
        try {
            await axios.post('http://103.75.199.220:3000/api/sendText', {
                chatId: `98${number}@c.us`,
                text: this.msg,
                session: "default"
            });
            console.log("here");
            numberObject.isSend = true;
        } catch (e) {
            numberObject.isSend = false;
        }
        this.i++;
        setTimeout(send.bind({
            ...this
        }), this.rest * 1000);
    };
    (send.bind({
        ...req.body,
        i: 0,
        id: id
    }))();
    return res.send({
        id
    });
});


export default router;