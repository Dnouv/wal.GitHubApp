import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { ISlashCommand, SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";

export class GithubCommand implements ISlashCommand {

    constructor(private readonly app: App) {

    }
    
    public command: string = "github";
    public i18nDescription: string = "github command description";
    public i18nParamsExample: string = "github-command-example";
    public providesPreview: boolean = false;


    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const message = await modify.getCreator().startMessage()

        const sender = await read.getUserReader().getById('rocket.cat')
        // const sender = await read.getUserReader().getByUsername('dnouv')

        const room = context.getRoom()

        const usernamealias = await read.getEnvironmentReader().getSettings().getById("github-username-alias")

        if (!room) {
            throw new Error("No room is configured for the message")
        }
        message
        .setSender(sender)
        .setUsernameAlias(usernamealias.value)
        .setRoom(room)
        .setText("GitHub slash received")
        
        modify.getNotifier().notifyRoom(room, message.getMessage())
    }
}