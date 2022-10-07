import { IHttp, IModify, IPersistence, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from "@rocket.chat/apps-engine/definition/api";

export class WebhookEndpoint extends ApiEndpoint {
    public path: string = "webhook";

    public async post(request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<IApiResponse> {

        const sender = await read.getUserReader().getById('rocket.cat')
        // const sender = await read.getUserReader().getByUsername('dnouv')

        const room = await read.getRoomReader().getById('GENERAL')

        if(request.headers['x-github-event'] !== 'push') {
            return this.success()
        }
        if (!room) {
            throw new Error("No room is configured for the message")
        }

        let payload: any;

        if (request.headers['content-type'] === 'application/x-www-form-urlencoded') {
            payload = JSON.parse(request.content.payload)
        } else {
            payload = request.content
        }
        const message = modify.getCreator().startMessage({
            room,
            sender,
            avatarUrl: payload.sender.avatar_url,
            alias: payload.sender.login,
            text: `[${payload.sender.login}](${payload.sender.html_url}) just pushed ${
                payload.commits.length
            } commits to [${payload.repository.full_name}](${payload.repository.html_url})`
        })
        
        modify.getCreator().finish(message);
        return this.success()

    }
}