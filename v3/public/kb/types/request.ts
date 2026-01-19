export type TOauth2RegistrationCallbackRequestQuery = {
  salt: string;
  encryptedData: string;
};

export type TOauth2AuthorizationCallbackRequestQuery = {
  code: string;
  client_id?: string;
};
