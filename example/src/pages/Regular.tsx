import React, { FC, useEffect } from "react";
import { Hardlink, useNav } from "typed-router";
import { root } from "../routes";

export const Regular: FC = () => {
  const nav = useNav();

  useEffect(() => {
    nav.go(root.path.paths.subPath({ id: 3, mode: "new" }))
  }, []);


  return <div>
    <Hardlink to={root.path.paths({ id: 1 })}>LINK</Hardlink>
    regular
  </div>;
}

export const RegularWithId: FC<{id: number}> = ({ id }) => {
  return <div>
    <Hardlink to={root.path.paths({ id: 1 })}>LINK</Hardlink>
    regular {id}
  </div>;
}

export const RegularWithSubId: FC<{id: number}> = ({ id }) => {
  return <div>
    <Hardlink to={root.path.paths({ id: 1 })}>LINK</Hardlink>
    sub
    regular {id}
  </div>;
}