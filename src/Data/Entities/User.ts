import * as mongoose from "mongoose";

export class User {
    constructor(
        public _id: mongoose.Types.ObjectId,
        public addrs: string,
        public area: string,
        public ecocode: string,
        public faaliat: string,
        public IDU: number,
        public mobile: string,
        public name: string,
        public phone: string,
        public tozihat: string,
        public vet: string,
        public wtsapp: string
    ) {
    }
}