import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** `false` during SSR and the hydration pass, `true` afterwards — without setState in an effect. */
export function useMounted(): boolean {
    return useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false,
    );
}
