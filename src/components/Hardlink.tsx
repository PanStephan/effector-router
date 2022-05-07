import React, { CSSProperties, FC } from "react";
import { useNav } from "../abstractions";
import { FullPath } from "../addressable";

type HardlinkProps = {
  to: FullPath;
  className?: string;
  style?: CSSProperties
}
type A = {
  a: string
  b: string
}

export const Hardlink: FC<HardlinkProps> = x => {
    const nav = useNav();
    if (!nav) return <a href={x.to}>{ x.children }</a>;

    return <a href={nav.href + "#" + x.to}
              className={x.className}
              style={x.style}
              onClick={e => {
                  e.preventDefault();
                  nav.go(x.to);
              }}>
        { x.children }
    </a>;
};