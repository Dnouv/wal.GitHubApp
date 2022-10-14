import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { WebhookEndpoint } from './endpoints/WebhookEndpoints';
import { GithubCommand } from './slashcommands/github';

export class WalGitHubApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new WebhookEndpoint(this)
            ]
        })

        configuration.settings.provideSetting({
            id: "date-select",
            public: true,
            required: false,
            type: SettingType.NUMBER,
            packageValue: "test",
            i18nLabel: "Account age threshold",
            i18nDescription: "report messages from users signed up no longer than this number of days"
        })

        configuration.settings.provideSetting({
            id: "message-limi",
            public: true,
            required: false,
            type: SettingType.NUMBER,
            packageValue: "test",
            i18nLabel: "Message limit",
            i18nDescription: "report messages from a speciific user if they send more than this number of messages"
        })

        configuration.settings.provideSetting({
            id: "word-set",
            public: true,
            required: false,
            type: SettingType.CODE,
            packageValue: "test",
            i18nLabel: "Flagged words",
            i18nDescription: "report the message if it contains any of these words"
        })

        
        configuration.settings.provideSetting({
            id: "scripted-moderator",
            public: true,
            required: false,
            type: SettingType.BOOLEAN,
            packageValue: "test",
            i18nLabel: "Enable Scripted Moderator",
            i18nDescription: "Enables the auto moderator"
        })

        configuration.settings.provideSetting({
            id: "moderator-script-dropdown",
            public: true,
            required: false,
            type: SettingType.SELECT,
            values: [{i18nLabel: "Pass all Reported messages", key:"1"}, {i18nLabel: "Delete all the users who has their messages reported", key:"2"}],
            packageValue: "test",
            i18nLabel: "Scripted Moderator Rules",
            i18nDescription: "Set of rules for handling the Reported messages"
        })

        configuration.slashCommands.provideSlashCommand(new GithubCommand(this))
    } 
}
