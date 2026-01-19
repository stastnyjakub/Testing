import { CloudTasksClient } from '@google-cloud/tasks';

import { routes } from '@/config/routes';
import env from '@/env';
import { loggerService } from '@/logging/logging.service';

export const queueSendInvitation = async (customerUserInvitationId: number) => {
  if (env().SERVER_URL.includes('localhost')) {
    loggerService.info(
      `Skipping Google Cloud Tasks queue for 'localhost' environment. Customer User Invitation ID: ${customerUserInvitationId}`,
    );
    return;
  }

  const tasksClient = new CloudTasksClient();
  const parent = tasksClient.queuePath(env().GCLOUD_PROJECT_ID, 'europe-west3', 'customer-user-invitation');
  const [response] = await tasksClient.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: 'POST',
        url: `${env().SERVER_URL}${routes.v3.customerUser.invitation.send}`,
        headers: {
          'x-api-key': env().JOB_API_KEY,
        },
        body: JSON.stringify({
          customerUserInvitationId,
        }),
      },
    },
  });
  return response;
};

export * from './getInvitation/getInvitation.service';
export * from './registrationToken/registrationToken.service';
export * from './createInvitation/createInvitation.service';
export * from './sendInvitation/sendInvitation.service';
export * from './updateInvitation/updateInvitation.service';
