import { BaseTokenPayload } from "./BaseTokenPayload";

export class AdminTokenPayload implements BaseTokenPayload {
    public _id: string;
    public scope: string[];
    public mobile: string;

    constructor(id: string, scope: string[], number: string) {
        this._id = id;
        this.scope = scope;
        this.mobile = number;
    }

    toPlainObject(): object {
        return {
            _id: this._id,
            scope: this.scope,
            mobile: this.mobile
        }
    }
}

