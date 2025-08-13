import { StatusCodes } from 'http-status-codes';

interface ServerErrorProps<Meta extends Record<string, unknown>> {
  message: string;
  uiMessage?: string;
  code?: string;
  status?: StatusCodes;
  meta?: Meta;
}

export default class ServerError<
  Meta extends Record<string, unknown> = Record<string, unknown>
> extends Error {
  code?: string;
  status: StatusCodes;
  uiMessage?: string;
  meta?: Meta;

  constructor(props: ServerErrorProps<Meta>) {
    super(props.message);
    this.name = 'ServerError';
    this.code = props.code ?? 'GENERIC_ERROR';
    this.status = props.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
    this.uiMessage = props.uiMessage;
    this.meta = props.meta;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      uiMessage: this.uiMessage,
    };
  }
}
