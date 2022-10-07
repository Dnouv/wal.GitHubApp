import { IApiEndpointMetadata } from "@rocket.chat/apps-engine/definition/api";
import { WalGitHubApp } from "../../WalGitHubApp";

export async function getWebhookUrl(app: WalGitHubApp): Promise<string> {
    const accessors = app.getAccessors();

    const webhookEndpoint = accessors.providedApiEndpoints.find((endpoint) => endpoint.path === 'webhook') as IApiEndpointMetadata;
    const siteUrl = await accessors.environmentReader.getServerSettings().getValueById('Site_Url');

    return siteUrl + webhookEndpoint.computedPath;
}