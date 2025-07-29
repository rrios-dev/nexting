import { SWRConfiguration } from 'swr';
import useSWRImmutable from 'swr/immutable';
import {
  ServerError,
  GenericAction,
  InferActionInput,
  InferActionOutput,
  InferActionError,
} from '../../server';

// Function overload approach para mejor inferencia de tipos
function makeServerActionImmutableHook<TAction extends GenericAction>(options: {
  key: string;
  action: TAction;
}) {
  const { key, action } = options;
  const makeKey = <T extends InferActionInput<TAction>>(context?: T) => ({
    key,
    ...(context ? { context } : {}),
  });
  function useAction(hookOptions: {
    skip?: boolean;
    context: InferActionInput<TAction>;
    options?: SWRConfiguration<
      InferActionOutput<TAction>,
      InferActionError<TAction>
    >;
  }) {
    const { context, options: swrOptions, skip = false } = hookOptions;

    const currentKey = skip
      ? null
      : makeKey(context);

    return useSWRImmutable<
      InferActionOutput<TAction>,
      InferActionError<TAction>,
      typeof currentKey
    >(
      currentKey,
      async (args) => {
        const result = await (
          action as (ctx: InferActionInput<TAction>) => ReturnType<TAction>
        )(args.context as InferActionInput<TAction>);

        if (result.status === 'error') throw new ServerError(result.error);

        if (result.status !== 'success')
          throw new ServerError({
            message: 'Unknown error',
            code: 'UNKNOWN_ERROR',
          });

        return result.data as InferActionOutput<TAction>;
      },
      swrOptions,
    );
  };

  return {
    useAction,
    makeKey,
  };
}

export default makeServerActionImmutableHook;
