import React from "react";
import { buildAddressable, flatRoute, route, routeSymbol, PT } from "typed-router";
import { Regular, RegularWithId, RegularWithSubId } from "../pages/Regular";

const rootSymbol = routeSymbol("Symbol to /");

const rawRoot = flatRoute()
  .redirect(rootSymbol, x => x)
  .with({
    path: route("path")
      .named("regular")
      .as(Regular)
      .with({
        paths: route(":id", { id: PT.number })
          .as(RegularWithId)
          .with({
            subPath: route("subPath")
              .inherits<{ id: number }>()
              .withQuery({ mode: PT.string })
              .as(RegularWithSubId)
          })
      })
  });

export const [root] = buildAddressable(rawRoot);
