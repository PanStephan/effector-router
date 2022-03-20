import { Redirection, UnkRoute } from "./dsl";
import { matchPath } from "./matcher";
import { parsePath } from "./parsing";
import { AddressableRouteInfo } from "./addressable";

export type ResolutionResult = {
    state: "resolved"
    target: UnkRoute
    props: object
    redirected: boolean
} | {
    state: "unresolved"
    hash: string
    errorDescription: string
};

export const resolveRedirection = <C>(
    hash: string,
    redir: Redirection<never, never>,
    root: AddressableRouteInfo<never>,
    resolvedProps: unknown
): ResolutionResult => {
    const routeWithSymbol = root.$allChildren.find(x => x.$route.symbol?.value === redir.target.value)?.$route;

    if (routeWithSymbol) {
        if (routeWithSymbol.definition === "component") {
            return {
                state: "resolved",
                target: routeWithSymbol,
                props: redir.convert(resolvedProps as never),
                redirected: true
            };
        } else
            return resolveRedirection(hash, routeWithSymbol.redirection, root, resolvedProps);
    } else {
        return {
            state: "unresolved",
            hash: hash,
            errorDescription:
                `Unresolved redirection to "${hash}" - could not find route with symbol ` +
                `(expected symbol - "${redir.target.description}", check your mark()'s)`
        };
    }
};

export const resolveRouteFromHash = (
    hash: string, root: AddressableRouteInfo<never>
): ResolutionResult => {
    const matchResult = matchPath(parsePath((hash || "#/").substring(1)), root.$route);
    if (!matchResult)
        return {
            state: "unresolved",
            hash: hash,
            errorDescription: `Unmatched path ${hash}, check your routes (or just ignore)`
        };

    const [resolvedRoute, resolvedProps] = matchResult;

    if (resolvedRoute.definition === "component")
        return {
            state: "resolved",
            props: resolvedProps,
            target: resolvedRoute,
            redirected: false
        };
    else
        return resolveRedirection(hash, resolvedRoute.redirection, root, resolvedProps);
};

export const buildFullPath = (
    route: UnkRoute, root: AddressableRouteInfo<never>, props: object
): string | undefined => {
    return root.$allChildren.find(x => x.$route === route)?.(props as never);
};