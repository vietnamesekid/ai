import { asArray, type Arrayable } from '@ai-sdk/provider-utils';

type AnyCallback<EVENT> = (event: EVENT) => PromiseLike<unknown> | unknown;

/**
 * Notifies all provided callbacks with the given event in parallel.
 * Errors in callbacks do not break the generation flow.
 */
export async function notify<EVENT>(options: {
  event: EVENT;
  callbacks?: Arrayable<AnyCallback<EVENT> | undefined | null>;
}): Promise<void> {
  await Promise.all(
    asArray(options.callbacks).map(async callback => {
      try {
        await callback?.(options.event);
      } catch {}
    }),
  );
}

type CallbackWithResult<EVENT, RESULT> = (
  event: EVENT,
) => PromiseLike<RESULT | void> | RESULT | void;

/**
 * Invokes callbacks sequentially and returns the first non-null/undefined result.
 * Errors in callbacks do not break the generation flow.
 * Used for control hooks where a callback can signal an action (e.g. denial).
 */
export async function notifyWithResult<EVENT, RESULT>(options: {
  event: EVENT;
  callbacks?: Arrayable<CallbackWithResult<EVENT, RESULT> | undefined | null>;
}): Promise<RESULT | undefined> {
  for (const callback of asArray(options.callbacks)) {
    try {
      const result = await callback?.(options.event);
      if (result != null) {
        return result;
      }
    } catch {}
  }
}
