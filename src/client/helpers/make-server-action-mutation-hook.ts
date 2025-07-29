import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';
import {
  ServerError,
  GenericAction,
  InferActionInput,
  InferActionOutput,
  InferActionError,
} from '../../server';

// Function overload approach para mejor inferencia de tipos
function makeServerActionMutationHook<TAction extends GenericAction>(options: {
  key: string;
  action: TAction;
}) {
  const { key, action } = options;
  const makeKey = (context?: Record<string, unknown>) => ({
    key,
    ...(context ? { context } : {}),
  });

  function useAction(hookOptions?: {
    context?: Record<string, unknown>;
    options?: SWRMutationConfiguration<
      InferActionOutput<TAction>,
      InferActionError<TAction>
    >;
  }) {
    const { context, options: swrOptions } = hookOptions || {};
    const currentKey = makeKey(context);

    return useSWRMutation(
      currentKey,
      async (_: string, { arg }: { arg: InferActionInput<TAction> }) => {
        const result = await (
          action as (ctx: InferActionInput<TAction>) => ReturnType<TAction>
        )(arg);

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

export default makeServerActionMutationHook;
