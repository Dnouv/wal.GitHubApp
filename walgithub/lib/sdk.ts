import { IHttp } from "@rocket.chat/apps-engine/definition/accessors"

const BaseHost = 'https://github.com/'
const BaseApiHost = 'https://api.github.com/repos/'

export class GithubSDK {
    constructor(private readonly http: IHttp, private readonly accessToken:string|undefined) {}

    public createWebHook(repoName: string, webhookUrl: string) {
        return this.post(BaseApiHost+repoName+'/hooks', {
            active: true,
            events: ['push'],
            config: {
                url: webhookUrl,
                content_type: 'json',
            }
        })
    }

   private post = async (url:string, data: any): Promise<void> => {
    const response = await this.http.post(url, {
        headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Rocket.Chat-Apps-Engine',
        },
        data,
    })

    if(!response.statusCode.toString().startsWith('2')) {
        throw response;
    }

    return JSON.parse(response.content || '{}')
   }
}

export function getRepoName(repoUrl: string): string {
    if(!repoUrl.startsWith(BaseHost)) {
        return '';
    }

    const apiUrl = repoUrl.substring(BaseHost.length);

    const secondSlashIndex = apiUrl.indexOf('/', apiUrl.indexOf('/')+1)

    return apiUrl.substr(0, secondSlashIndex === -1 ? undefined : secondSlashIndex);

}