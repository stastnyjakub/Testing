export type TWSSMessage = {
  event: EWSSMessageEvent;
  accessToken: string;
  data: any;
};

export enum EWSSMessageEvent {
  INVALIDATE = 'invalidate',
}
