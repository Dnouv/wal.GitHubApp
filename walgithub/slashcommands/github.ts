import {
    IRead,
    IModify,
    IHttp,
    IPersistence,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { getWebhookUrl } from "../lib/helpers/getWebhookUrl";
import { sendNotification } from "../lib/helpers/sendNotifcation";
import { AppPersistence } from "../lib/persistence";
import { getRepoName, GithubSDK } from "../lib/sdk";
import { WalGitHubApp } from "../WalGitHubApp";

enum Command {
    Connect = "connect",
    SetToken = "set-token",
}

export class GithubCommand implements ISlashCommand {
    public constructor(private readonly app: WalGitHubApp) {}

    public command: string = "github";
    public i18nDescription: string = "github command description";
    public i18nParamsExample: string = "github-command-example";
    public providesPreview: boolean = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        const [command] = context.getArguments();

        switch (command) {
            case Command.Connect:
                await this.processConnectCommand(
                    context,
                    read,
                    modify,
                    http,
                    persis
                );
                break;

            case Command.SetToken:
                await this.processSetTokenCommand(context, read, modify, http, persis);
        }
    }

    private async processConnectCommand(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        const [, repoUrl] = context.getArguments();
        const userRoom = await read.getRoomReader().getDirectByUsernames([context.getSender().username, "rocket.cat"])

        if (!repoUrl) {
            await sendNotification(
                "Usage: `/github connect REPO_URL`",
                read,
                modify,
                context.getSender(),
                context.getRoom()
            );
            return;
        }

        if (repoUrl==="123") {
            await sendNotification(
                "Hey, there! This is the first time you are posting a message on the `#general` channel. The moderator of this channel requires that you pass this capture test before posting the very first message. Thank you for your understanding. Please react with 👍 on this message to pass this test.",
                read,
                modify,
                context.getSender(),
                userRoom
            );
            return;
        }

        const repoName = getRepoName(repoUrl);

        if (!repoName) {
            await sendNotification(
                "Invalid GitHub repo address",
                read,
                modify,
                context.getSender(),
                context.getRoom()
            );
            return;
        }

        const persistence = new AppPersistence(persis, read.getPersistenceReader())
        const accessToken = await persistence.getUserAccessToken(context.getSender())
        console.log(",,,,,,,,,,,before token", context.getArguments())
        if(!accessToken) {
            await sendNotification(
                'You haven\'t configured your acces key yer. Please run `/github set-token YOUR_SECRET_ACCESS_TOKEN`',
                read, modify, context.getSender(), context.getRoom()
            )
            return;
        }

        const sdk = new GithubSDK(http, accessToken);

        try {
            await sdk.createWebHook(repoName, await getWebhookUrl(this.app));
        } catch (err) {
            console.error(err);
            await sendNotification(
                "Error connecting to the repo",
                read,
                modify,
                context.getSender(),
                context.getRoom()
            );
            return;
        }

        await sendNotification(
            "Successfully connected repo",
            read,
            modify,
            context.getSender(),
            context.getRoom()
        );
    }

    private async processSetTokenCommand(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const [, accessToken] = context.getArguments();

        console.log("...........arg", context.getArguments())

        if(!accessToken) {
            await sendNotification('Usage `/github sset-token ACCESS_TOKEN`', read, modify, context.getSender(), context.getRoom());
            return
        }

        const persistance = new AppPersistence(persis, read.getPersistenceReader());

        await persistance.setUserAccessToken(accessToken, context.getSender());

        await sendNotification('Successfully stored your key', read, modify, context.getSender(), context.getRoom())
    }
}
