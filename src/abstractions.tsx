import React, { createContext, FC, useContext, useEffect, useState } from "react";
import { Store, Event, createEvent, createStore } from "effector";
import { buildFullPath, ResolutionResult, resolveRouteFromHash } from "./resolver";
import { AddressableRouteInfo, FullPath } from "./addressable";
import { UnkRoute } from "./dsl";

export type NavContext = {
    root: AddressableRouteInfo<never>
    unresolvedRoutePlaceholder?: FC
    href: string
    path: string
    resolved: ResolutionResult
    go(route: FullPath, replace?: boolean): void
    goBack(): void
};

const NavigatorContext = createContext<NavContext | null>(null);

export const useNav = (): NavContext => {
    const n = useContext(NavigatorContext);

    if (!n) {
        throw new Error("Attempt to navigate outside NavigatorContext");
    }

    return n;
};

interface NavigatorStore extends Store<{ context: NavContext | null }> {
    updateContext: Event<NavContext>
}

export const createNavigatorStore = (): NavigatorStore => {
    const updateContext = createEvent<NavContext>("update navigation context");
    const store = createStore({ context: null }) as NavigatorStore;
    store.on(updateContext, (s, c) => ({ ...s, context: c }));
    store.updateContext = updateContext;
    return store;
};

interface NavigatorProps {
    root: AddressableRouteInfo<never>
    store?: NavigatorStore
    unresolvedRoutePlaceholder?: FC
}

export const Navigator: FC<NavigatorProps> = x => {
    const [currentHash, setCurrentHash] = useState(location.hash);

    const context: NavContext = {
        root: x.root,
        href: location.pathname,
        path: currentHash.substring(1),
        resolved: resolveRouteFromHash(currentHash, x.root),
        unresolvedRoutePlaceholder: x.unresolvedRoutePlaceholder,
        go(route, replace) {
            const hash = "#" + route;
            if (currentHash == hash) return;

            const resolved = resolveRouteFromHash(hash, x.root);
            if (resolved.state === "resolved") {
                const newHash = resolved.redirected
                    ? "#" + buildFullPath(resolved.target, x.root, resolved.props)
                    : hash;

                if (currentHash == newHash) return;

                if (replace)
                    history.replaceState(undefined, "", newHash);
                else
                    history.pushState(undefined, "", newHash);
            } else {
                throw new Error(`Attempted to navigate to unresolved route "${ route }"`);
            }

            setCurrentHash(location.hash);
        },
        goBack() {
            history.back();
        }
    };

    x.store?.updateContext(context);

    useEffect(() => {
        const updateState = (): void => {
            const resolved = resolveRouteFromHash(location.hash, x.root);

            if (resolved.state === "unresolved") {
                console.error(resolved.errorDescription);
                setCurrentHash(location.hash);
                return;
            }

            const { target, props, redirected } = resolved;

            if (redirected) {
                const newPath = buildFullPath(target, x.root, props);
                history.replaceState(undefined, "", "#" + newPath);
            }

            setCurrentHash(location.hash);
        };

        window.addEventListener("popstate", updateState);

        updateState();

        return () => {
            window.removeEventListener("popstate", updateState);
        };
    }, [x]);

    return <NavigatorContext.Provider value={context}>{ x.children }</NavigatorContext.Provider>;
};

export const NavigatorView: FC = () => {
    const n = useContext(NavigatorContext);

    if (!n) return <>NavigatorView outside Navigator</>;

    if (n.resolved.state === "unresolved") {
        const U = n.unresolvedRoutePlaceholder;
        return U ? <U /> : <>
            Unresolved component on location { n.path }
        </>;
    } else if (n.resolved.target.definition !== "component") {
        return <>
            Got redirection instead of component on location { n.path }
        </>; // should never happen
    } else {
        const { target: { component: ResolvedComponent }, props } = n.resolved;

        return <>
            <ResolvedComponent {...props as never} />
        </>;
    }
};

export const resolveAllParents = (route: UnkRoute, root: AddressableRouteInfo<never>): UnkRoute[] => {
    return root.$allChildren.find(x => x.$route === route)?.$parentChain ?? [];
};

export const isParentContainRoute = (
    parent: UnkRoute,
    route: UnkRoute | undefined,
    root: AddressableRouteInfo<never>
): boolean => {
    return !!route && (parent === route ||
        (root.$allChildren.find(x => x.$route === route)?.$parentChain?.includes(parent) ?? false));
};