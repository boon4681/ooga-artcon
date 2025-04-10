import { useReducer } from "react";

type State = {
    loaded: boolean;
    error: boolean;
    complete: boolean;
};
type Markers<T extends string> = Record<T, State>;
type Action<T> = {
    key: T;
    state: Partial<State>;
};

export function useImageOnLoad<T extends string>(
    ...markings: ReadonlyArray<T>
) {
    const [markers, setMarker] = useReducer(
        (prevMarkers: Markers<T>, { key, state }: Action<T>) => ({
            ...prevMarkers,
            [key]: {
                ...prevMarkers[key],
                ...state,
            },
        }),
        markings.reduce((markers: Markers<T>, currMarker: T) => {
            return {
                ...markers,
                [currMarker]: {
                    loaded: false,
                    complete: false,
                    error: false,
                },
            };
        }, {} as Markers<T>)
    );

    function markLoad(key: T) {
        setMarker({ key, state: { loaded: true, complete: true } });
    }

    function markError(key: T) {
        setMarker({ key, state: { error: true, complete: true } });
    }

    return {
        markers,
        markError,
        markLoad
    };
}