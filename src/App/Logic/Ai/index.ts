import {inject, injectable} from "inversify";
import OpenAI from "openai";
import {BaseAppResult} from "../../Model/Result/BaseAppResult";
import {ResultStatus} from "../../Model/Result/ResultStatus";
import {UtilsTypes} from "../../../Utils/Interfaces/Types/UtilsTypes";
import {ILoggerService} from "../../../Utils/Interfaces/LoggeService/ILoggerService";
import cheerio from "cheerio";
import axios from "axios";
import {DataTypes} from "../../../Data/Interfaces/Types/DataTypes";
import {IReportRepository} from "../../../Data/Interfaces/Repositories/IReportRepository";
import {Report} from "../../../Data/Entities/Report";
import {TYPES} from "../../Interfaces/Types";
import {IIDService} from "../../Interfaces/IDService/IIDService";
import {HttpContext} from "../../Model/Param/HttpContext";

const openai = new OpenAI({
    apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});

@injectable()
export class Ai {
    @inject(UtilsTypes.ILoggerService) private readonly _loggerService: ILoggerService;

    @inject(DataTypes.IReportRepository) private readonly _reportRepository: IReportRepository;

    @inject(TYPES.IIDService) private readonly _idService: IIDService;

    getHashtagAndEmojiFillter(
        withEmoji: boolean, withHashtag: boolean) {
        if (withEmoji && withHashtag) {
            return 'Please use emojis and suggest 3 popular hashtags for each tweet.';
        } else if (withEmoji && !withHashtag) {
            return 'Use emojis and do not use "#" at all.';
        } else if (!withEmoji && withHashtag) {
            return 'Please suggest 3 popular hashtags for each tweet. Do not use emojis at all.';
        } else if (!withEmoji && !withHashtag) {
            return 'Do not use emojis or hashtags at all.';
        }
    }

    async generateTweeterPostByContent(
        withEmoji: boolean,
        withHashtag: boolean,
        word: number = 50,
        content: string,
        toneOfVoice: "Fun" | "Expert" | "Inspirational" | "Formal" | "Humorous" | "Casual" | "Persuasive" | "Mysterious",
        httpContext: HttpContext,
        userID: string,
        profile: string,
        userName: string,
        tweeterID: string,
        numberOf: number = 5
    ) {
        try {
            let prompt = `Please give me ${numberOf} unique tweets based on the following content. Keep each tweet under ${word} words. ${this.getHashtagAndEmojiFillter(withEmoji, withHashtag)} Tone of voice: ${toneOfVoice}\n${content}`;
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    }
                ],
                model: 'gpt-3.5-turbo',
            });

            let result = completion.choices[0].message.content;
            let contents = this.prpareResult(result);

            await this._reportRepository.insert(new Report(
                this._idService.generate(),
                "generateTweet",
                httpContext.ip,
                userID,
                new Date,
                false,
                contents,
                true,
                profile,
                userName,
                tweeterID
            ));

            return new BaseAppResult(
                contents,
                false,
                "Success",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<{
                token: string;
                lifeTime: number
            } | null>(null, true, "Error creating user.", ResultStatus.Unknown)
        }
    }


    async generateLinkedinPostByContent(
        withEmoji: boolean,
        withHashtag: boolean,
        word: number = 50,
        content: string,
        toneOfVoice: "Fun" | "Expert" | "Inspirational" | "Formal" | "Humorous" | "Casual" | "Persuasive" | "Mysterious",
        httpContext: HttpContext,
        userID: string,
        profile: string,
        userName: string,
        tweeterID: string,
        numberOf: number = 5
    ) {
        try {
            const prompt = `Please give me ${numberOf} unique LinkedIn posts based on the following content. Keep each post under ${word} words. ${this.getHashtagAndEmojiFillter(withEmoji, withHashtag)} Tone of voice: ${toneOfVoice}\n${content}`;
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    }
                ],
                model: 'gpt-3.5-turbo',
            });

            let result = completion.choices[0].message.content;

            let contents = this.prpareResult(result);

            await this._reportRepository.insert(new Report(
                this._idService.generate(),
                "generateLinkedin",
                httpContext.ip,
                userID,
                new Date,
                false,
                contents,
                true,
                profile,
                userName,
                tweeterID
            ));

            return new BaseAppResult(
                contents,
                false,
                "Success",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<{
                token: string;
                lifeTime: number
            } | null>(null, true, "Error creating user.", ResultStatus.Unknown)
        }
    }

    async generateTweeterThreadByContent(
        withEmoji: boolean,
        withHashtag: boolean,
        word: number = 50,
        content: string,
        toneOfVoice: "Fun" | "Expert" | "Inspirational" | "Formal" | "Humorous" | "Casual" | "Persuasive" | "Mysterious",
        httpContext: HttpContext,
        userID: string,
        profile: string,
        userName: string,
        tweeterID: string,
        parts: number = 10
    ) {
        try {
            const prompt = `Please give me an under-${parts}-part Twitter thread based on the following content. keep each part under ${word} words . ${this.getHashtagAndEmojiFillter(withEmoji, withHashtag)} Tone of voice: ${toneOfVoice}\n${content}`;
            console.log(prompt);
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    }
                ],
                model: 'gpt-3.5-turbo',
            });

            let result = completion.choices[0].message.content;

            let contents = this.prpareResult(result);


            await this._reportRepository.insert(new Report(
                this._idService.generate(),
                "generateThead",
                httpContext.ip,
                userID,
                new Date,
                false,
                contents,
                true,
                profile,
                userName,
                tweeterID
            ));


            return new BaseAppResult(
                contents,
                false,
                "Success",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<{
                token: string;
                lifeTime: number
            } | null>(null, true, "Error creating user.", ResultStatus.Unknown)
        }
    }


    prpareResult(result: string) {
        let aResult = result.split('\n');
        aResult = aResult.filter((e) => {
            return e.length > 5;
        });
        aResult = aResult.map((e) => {
            return e
                .replace('1. ', '')
                .replace('2. ', '')
                .replace('3. ', '')
                .replace('4. ', '')
                .replace('5. ', '')
                .trim();
        });
        aResult = aResult.map((e) => {
            if (e[0] == "\"") {
                e = e.substring(1);
            }
            if (e[e.length - 1] == "\"") {
                e = e.substring(0, e.length - 1);
            }
            return e;
        });
        aResult = aResult.filter((e) => {
                return e.length > 20;
            }
        );
        return aResult;
    }


    /**
     * using axios and cheerio
     * @param url
     */
    async getContentFromUrl(url: string): Promise<BaseAppResult<string>> {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            let content = '';
            $('p').each(function (i: number, elem: any) {
                content += $(this).text() + ' ';
            });
            return new BaseAppResult(
                content,
                false,
                "Success",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<null>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


    async generateTweetByContents(
        withEmoji: boolean,
        withHashtag: boolean,
        contents: string[],
        toneOfVoice: "Fun" | "Expert" | "Inspirational" | "Formal" | "Humorous" | "Casual" | "Persuasive" | "Mysterious",
        httpContext: HttpContext,
        userID: string,
        profile: string,
        userName: string,
        tweeterID: string,
        numberOf: number = 5
    ) {
        try {
            let prompt = `Please give me ${numberOf} twitter post By inspiring from the following competitors Posts. ${this.getHashtagAndEmojiFillter(withEmoji, withHashtag)} Tone of voice: ${toneOfVoice}\n`;
            contents.forEach((e) => {
                prompt += e + '\n';
            });
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    }
                ],
                model: 'gpt-3.5-turbo',
            });

            let result = completion.choices[0].message.content;
            let cons = this.prpareResult(result);

            await this._reportRepository.insert(new Report(
                this._idService.generate(),
                "generateTweet",
                httpContext.ip,
                userID,
                new Date,
                false,
                cons,
                true,
                profile,
                userName,
                tweeterID
            ));

            return new BaseAppResult(
                contents,
                false,
                "Success",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<null>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


    async generateTweeterThreadByContents(
        withEmoji: boolean,
        withHashtag: boolean,
        contents: string[],
        toneOfVoice: "Fun" | "Expert" | "Inspirational" | "Formal" | "Humorous" | "Casual" | "Persuasive" | "Mysterious",
        httpContext: HttpContext,
        userID: string,
        profile: string,
        userName: string,
        tweeterID: string,
        parts: number = 10
    ) {
        try {
            let prompt = `Please give me an under-${parts}-part tweeter thread By inspiring from the following competitors Posts. ${this.getHashtagAndEmojiFillter(withEmoji, withHashtag)} Tone of voice: ${toneOfVoice}\n`;
            contents.forEach((e) => {
                prompt += e + '\n';
            });
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    }
                ],
                model: 'gpt-3.5-turbo',
            });

            let result = completion.choices[0].message.content;

            let cons = this.prpareResult(result);

            await this._reportRepository.insert(new Report(
                this._idService.generate(),
                "generateThead",
                httpContext.ip,
                userID,
                new Date,
                false,
                cons,
                true,
                profile,
                userName,
                tweeterID
            ));

            return new BaseAppResult(
                cons,
                false,
                "Success",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<null>(null, true, "Error.", ResultStatus.Unknown);
        }
    }

    async generateLinkedinPostByContents(
        withEmoji: boolean,
        withHashtag: boolean,
        contents: string[],
        toneOfVoice: "Fun" | "Expert" | "Inspirational" | "Formal" | "Humorous" | "Casual" | "Persuasive" | "Mysterious",
        httpContext: HttpContext,
        userID: string,
        profile: string,
        userName: string,
        tweeterID: string,
        numberOf: number = 5
    ) {
        try {
            let prompt = `Please give me ${numberOf} LinkedIn post By inspiring from the following competitors Posts. ${this.getHashtagAndEmojiFillter(withEmoji, withHashtag)} Tone of voice: ${toneOfVoice}\n`;
            contents.forEach((e) => {
                prompt += e + '\n';
            });
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    }
                ],
                model: 'gpt-3.5-turbo',
            });

            let result = completion.choices[0].message.content;

            let cons = this.prpareResult(result);
            await this._reportRepository.insert(new Report(
                this._idService.generate(),
                "generateLinkedin",
                httpContext.ip,
                userID,
                new Date,
                false,
                cons,
                true,
                profile,
                userName,
                tweeterID
            ));
            return new BaseAppResult(
                cons,
                false,
                "Success",
                ResultStatus.Success
            );
        } catch (e) {
            this._loggerService.error(e.originalError ? e.originalError : e);
            return new BaseAppResult<null>(null, true, "Error.", ResultStatus.Unknown);
        }
    }


}