import Image from "next/image";
import { Monogram } from "./Visual";

/**
 * Company marks.
 *
 * A logo is a fixed colour asset and this site has two themes, so each mark sits
 * on a tile of its own choosing rather than on the page. A dark logo takes a
 * white tile, a white logo takes a dark one, and both survive a theme switch
 * because the tile is not a theme colour. That is also how a terminal draws
 * them, for the same reason.
 *
 * A company with no file falls back to the drawn monogram, so partial coverage
 * degrades to what the site did before rather than to a hole. Adding a mark is
 * dropping a file into public/logos and adding one line here.
 */
const LOGOS: Record<string, { file: string; tile: "light" | "dark" }> = {
  RELIANCE: { file: "RELIANCE.png", tile: "light" },
  ADANIENT: { file: "ADANIENT.svg", tile: "light" },
  BHARTIARTL: { file: "BHARTIARTL.svg", tile: "light" },
  TATACOMM: { file: "TATACOMM.svg", tile: "dark" },
  ANANTRAJ: { file: "ANANTRAJ.png", tile: "light" },
  SIFY: { file: "SIFY.png", tile: "dark" },
  E2E: { file: "E2E.png", tile: "light" },
  NETWEB: { file: "NETWEB.png", tile: "dark" },
  CUMMINSIND: { file: "CUMMINSIND.svg", tile: "light" },
  POWERINDIA: { file: "POWERINDIA.svg", tile: "light" },
};

const SIZES = { sm: 18, md: 24, lg: 34 } as const;

export function Logo({
  ticker,
  name,
  size = "sm",
  tone,
}: {
  ticker: string;
  /** The accessible name, and the source of the fallback mark. */
  name: string;
  size?: keyof typeof SIZES;
  /** Reaches the fallback monogram only. A real logo carries its own colour. */
  tone?: string;
}) {
  const px = SIZES[size];
  const entry = LOGOS[ticker];
  if (!entry) return <Monogram name={name} size={px} tone={tone} />;

  // Height is fixed and width is left alone. Almost every one of these marks is
  // a wordmark, and a wordmark squeezed into a square is unreadable at the size
  // a table row allows.
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[5px]"
      style={{
        height: px,
        // Tighter in a table row, where the mark sits beside a company name in a
        // fixed column and a wide wordmark pushes the name onto three lines.
        maxWidth: px * (size === "sm" ? 3 : 5),
        background: entry.tile === "light" ? "#ffffff" : "#12161c",
        padding: `${Math.round(px * 0.1)}px ${Math.round(px * 0.22)}px`,
      }}
    >
      <Image
        src={`/logos/${entry.file}`}
        alt={name}
        width={px * 8}
        height={px * 2}
        className="h-full w-auto object-contain"
        unoptimized={entry.file.endsWith(".svg")}
        // Eager, against the default. These are 22 pixel marks in a data table
        // and the whole set is under 200 kilobytes; lazy loading them makes a
        // table of companies pop in row by row as it is scrolled.
        loading="eager"
      />
    </span>
  );
}
