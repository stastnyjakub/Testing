import { TMailSender } from '@/mail/mail.interface';
import { Lang } from '@/types';

import { TwigTemplate } from './twigTemplate';

export type TGenerateGeneralEmailBodyArgs = {
  lang: Lang;
  title: string;
  message: string;
  sender: TMailSender;
};
export const generateGeneralEmailBody = async ({ message, lang, title, sender }: TGenerateGeneralEmailBodyArgs) => {
  const twigTemplate = new TwigTemplate(lang);
  await twigTemplate.setTemplate('templates/email/general/index.twig');
  const transformedMessage = message.replace(/\n/g, '<br/>');
  const emailBody = await twigTemplate.render({
    title,
    dispatcher: sender,
    message: transformedMessage,
  });
  return emailBody;
};
