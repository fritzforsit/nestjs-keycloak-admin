import { KeycloakService } from '../service'
import { RequestManager } from './request-manager'
import { TicketForm, TicketDecisionResponse, TicketDeniedResponse, TicketPermissionResponse } from '../@types/uma.ticket'

export class PermissionManager {
  private readonly requestManager: RequestManager

  constructor(client: KeycloakService, endpoint: string) {
    this.requestManager = new RequestManager(client, endpoint)
  }

  async requestTicket(
    ticket: TicketForm
  ): Promise<TicketDecisionResponse | TicketDeniedResponse | TicketPermissionResponse[]> {
    if (!ticket.grant_type) {
      ticket.grant_type = 'urn:ietf:params:oauth:grant-type:uma-ticket'
    }

    const params = new URLSearchParams()
    params.append('grant_type', ticket.grant_type)
    params.append('audience', ticket.audience)
    params.append('response_mode', ticket.response_mode || 'decision')

    if (ticket.resourceId) {
      const permission =
        ticket.scope ? `${ticket.resourceId}#${ticket.scope}` : `${ticket.resourceId}`
      params.append('permission', permission)
    }

    const { data } = await this.requestManager.post<
      TicketDecisionResponse | TicketDeniedResponse | TicketPermissionResponse[]
    >(`/`, params, {
      headers: {
        authorization: `Bearer ${ticket.token}`,
      },
    })

    return data
  }
}
