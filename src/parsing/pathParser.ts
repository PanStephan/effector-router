const pathRegex = /^\/([^\/\?&=]+|(?!\/))((?:\/[^\/\?&=]+)*(?:\?[^\/\?&=]+=[^\/\?&=]*(?:&[^\/\?&=]+=[^\/\?&=]*)*)?)$/;

export type ParsedPath = { segments: string[]; queryArgs: Record<string, string> };

export const parsePath = (path: string): ParsedPath => {
    let remaining = path;
    const segments: string[] = [];

    do {
        let match = pathRegex.exec(remaining);
        // todo make it better
        if (!match) {
            match = pathRegex.exec(remaining.slice(0, -1));
            if (!match)
                throw new Error(`Failed to parse path ${path}`);
        }

        const seg = match[1];
        if (seg.length)
            segments.push(decodeURIComponent(seg));

        if (match[2]) {
            if (match[2][0] === "?") {
                const queryArgs = Object.fromEntries(
                    match[2].substring(1).split("&").map(x => x.split("=").map(x => decodeURIComponent(x)))
                );

                return { segments, queryArgs };
            } else {
                remaining = match[2];
                continue;
            }
        }

        return { segments, queryArgs: {} };

    } while (true);
};