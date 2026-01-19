export type TMailSender = {
  name: string;
  surname: string;
  email: string;
  phone?: string;
  profilePicture?: string;
};

export type TBaseMail = {
  to: string[];
  sender: TMailSender;
  attachments: { path: string; name?: string }[];
  body?: string;
  lang?: string;
};

export type TMail = TBaseMail & {
  subject: string;
  body: string;
  internal?: boolean;
  bcc?: string[];
};
