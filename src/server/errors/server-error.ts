import { StatusCodes } from 'http-status-codes';

interface ServerErrorProps {
  message: string;
  uiMessage?: string;
  code?: string;
  status?: StatusCodes;
}

export default class ServerError extends Error {
  code?: string;
  status: StatusCodes;
  uiMessage?: string;

  constructor(props: ServerErrorProps) {
    super(props.message);
    this.name = 'ServerError';
    this.code = props.code ?? 'GENERIC_ERROR';
    this.status = props.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
    this.uiMessage = props.uiMessage;
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
