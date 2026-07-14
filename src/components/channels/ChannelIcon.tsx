import type { IconType } from "react-icons";
import { SiInstagram, SiTiktok, SiFacebook, SiYoutube } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";

// Maps a Channel.icon slug (as seeded in prisma/seed.ts) to its brand logo
// component and brand color. Prefers Simple Icons (si); where a brand was
// removed from that set, falls back to the Font Awesome (fa) equivalent so
// every channel still shows a real logo rather than a text chip.
//
// Audited against the installed react-icons:
//   instagram -> SiInstagram   tiktok -> SiTiktok
//   facebook  -> SiFacebook    youtube -> SiYoutube
//   linkedin  -> FaLinkedin    (si dropped LinkedIn over trademark)
const ICONS: Record<string, { Icon: IconType; color: string }> = {
  instagram: { Icon: SiInstagram, color: "#E4405F" },
  tiktok: { Icon: SiTiktok, color: "#000000" },
  facebook: { Icon: SiFacebook, color: "#1877F2" },
  youtube: { Icon: SiYoutube, color: "#FF0000" },
  linkedin: { Icon: FaLinkedin, color: "#0A66C2" },
};

export default function ChannelIcon({
  icon,
  name,
  size = 16,
  colored = true,
  className,
  fallback = "chip",
}: {
  icon: string;
  name: string;
  size?: number;
  colored?: boolean;
  className?: string;
  // How to render when the slug has no icon: a small name chip (default), or
  // nothing (for places that already print the channel name alongside).
  fallback?: "chip" | "none";
}) {
  const entry = ICONS[icon];

  if (!entry) {
    if (fallback === "none") return null;
    return (
      <span
        title={name}
        className="inline-flex items-center rounded-full border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-medium leading-none text-ink-muted"
      >
        {name}
      </span>
    );
  }

  const { Icon, color } = entry;
  return (
    <Icon
      title={name}
      aria-label={name}
      size={size}
      className={className}
      style={colored ? { color } : undefined}
    />
  );
}
