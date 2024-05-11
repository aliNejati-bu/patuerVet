import * as express from "express"
import router from "./Router";
import * as path from "path";
import * as cors from "cors";


const app = express();
export const run = async (PORT: number, HOST: string) => {
    app.use(cors());
    app.options('*', cors());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));


    app.use('/', express.static(path.join(__dirname, '../public')))

    router.init(app);


    app.listen(PORT, HOST, () => {
        console.log(`Server running on http://${HOST}:${PORT}`);
    });
}