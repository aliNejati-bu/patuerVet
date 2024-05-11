import {Controller} from "../../index";
import {NextFunction, Request, Response} from "express";
import {container} from "../../../Container";
import {baseResponse, notFoundedResponse, serverErrorResponse, unAuth} from "../../../helpers/functions";
import {addContentToBody, wrapValidatorToMiddleware} from "../../../Middleware/general";
import {Ai} from "../../../App/Logic/Ai";
import {AiValidator} from "../../../Middleware/Validators/AiValidator";
import {verifyClientToken} from "../../../Middleware/userMiddlewares";
import {ReportApp} from "../../../App/Logic/ReportApp";


class AiController extends Controller {

    constructor(
        public _ai: Ai,
        public _validator: AiValidator
    ) {
        super("/ai");
    }

    async tweeterPostByContent(req: Request, res: Response, next?: NextFunction) {
        const result = await this._ai.generateTweeterPostByContent(
            req.body.withEmoji,
            req.body.withHashtag,
            req.body.word,
            req.body.content,
            req.body.toneOfVoice,
            req.body.httpContext,
            req.body.user._id,
            req.body.profile,
            req.body.userName,
            req.body.tweeterID,
            req.body.numberOf
        );
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }
        return baseResponse(res, result.result);
    }

    async linkedinPostByContent(req: Request, res: Response, next?: NextFunction) {
        const result = await this._ai.generateLinkedinPostByContent(
            req.body.withEmoji,
            req.body.withHashtag,
            req.body.word,
            req.body.content,
            req.body.toneOfVoice,
            req.body.httpContext,
            req.body.user._id,
            req.body.profile,
            req.body.userName,
            req.body.tweeterID,
            req.body.numberOf
        );
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }

        return baseResponse(res, result.result);
    }

    async tweeterThreadByContent(req: Request, res: Response, next?: NextFunction) {
        console.log(req.body)
        const result = await this._ai.generateTweeterThreadByContent(
            req.body.withEmoji,
            req.body.withHashtag,
            req.body.word,
            req.body.content,
            req.body.toneOfVoice,
            req.body.httpContext,
            req.body.user._id,
            req.body.profile,
            req.body.userName,
            req.body.tweeterID,
            req.body.numberOf
        );
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }

        return baseResponse(res, result.result);
    }

    async tweeterPostByContents(req: Request, res: Response, next?: NextFunction) {
        const result = await this._ai.generateTweetByContents(
            req.body.withEmoji,
            req.body.withHashtag,
            req.body.contents,
            req.body.toneOfVoice,
            req.body.httpContext,
            req.body.user._id,
            req.body.profile,
            req.body.userName,
            req.body.tweeterID,
            req.body.numberOf
        );
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }

        return baseResponse(res, result.result);
    }

    async tweeterThreadByContents(req: Request, res: Response, next?: NextFunction) {
        const result = await this._ai.generateTweeterThreadByContents(
            req.body.withEmoji,
            req.body.withHashtag,
            req.body.contents,
            req.body.toneOfVoice,
            req.body.httpContext,
            req.body.user._id,
            req.body.profile,
            req.body.userName,
            req.body.tweeterID,
            req.body.numberOf
        );
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }

        return baseResponse(res, result.result);
    }

    async linkedinPostByContents(req: Request, res: Response, next?: NextFunction) {
        const result = await this._ai.generateLinkedinPostByContents(
            req.body.withEmoji,
            req.body.withHashtag,
            req.body.contents,
            req.body.toneOfVoice,
            req.body.httpContext,
            req.body.user._id,
            req.body.profile,
            req.body.userName,
            req.body.tweeterID,
            req.body.numberOf
        );
        if (result.isError) {
            return serverErrorResponse(res, result.ResultStatus);
        }

        return baseResponse(res, result.result);
    }

}

export default function (): AiController {
    const controller = new AiController(
        container.get<Ai>(Ai),
        container.get<AiValidator>(AiValidator)
    );

    controller.addAction('/tweeter/post', 'post', controller.tweeterPostByContent, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.tweeterByContent)
    ]);

    controller.addAction('/linkedin/post', 'post', controller.linkedinPostByContent, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.linkedinByContent)
    ]);

    controller.addAction('/tweeter/thread', 'post', controller.tweeterThreadByContent, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.tweeterByContent)
    ]);

    controller.addAction('/tweeter/post/url', 'post', controller.tweeterPostByContent, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.postByUrl),
        addContentToBody
    ]);

    controller.addAction('/linkedin/post/url', 'post', controller.linkedinPostByContent, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.postByUrl),
        addContentToBody
    ]);

    controller.addAction('/tweeter/thread/url', 'post', controller.tweeterThreadByContent, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.postByUrl),
        addContentToBody
    ]);

    controller.addAction('/tweeter/post/contents', 'post', controller.tweeterPostByContents, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.postByContents)
    ]);

    controller.addAction('/linkedin/post/contents', 'post', controller.linkedinPostByContents, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.postByContents)
    ]);

    controller.addAction('/tweeter/thread/contents', 'post', controller.tweeterThreadByContents, [
        verifyClientToken,
        wrapValidatorToMiddleware(controller._validator.postByContents)
    ]);

    return controller;
}