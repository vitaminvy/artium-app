import type { BlogListingData, BlogArticle } from "./types";

const articles: BlogArticle[] = [
  {
    id: "cerulean-vernissage",
    title: "Cerulean Vernissage: Inside the Quiet Rise of Coastal Studios",
    coverImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
    excerpt:
      "Sea-facing studios are rethinking how daylight flows through their spaces. We visited three collectives experimenting with glass, pigment, and sound.",
    authorName: "Amaya Sloan",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    publishedAt: "2025-12-14T08:30:00Z",
    readTimeMinutes: 5,
    tag: "Spotlight",
    category: "Studios",
    content: [
      "Between fog banks and tidal light, a new generation of painters are choosing to work closer to the shoreline. The shift is not only aesthetic—it changes how collectors encounter the work.",
      "Large glass planes and muted acoustic treatments are defining features of these spaces. Artists describe a calmness that lets them experiment with bolder palettes.",
      "Community nights, once rare in remote areas, now book weeks in advance as visitors look for slower, more intentional viewing sessions.",
      "Studios are also adopting modular lighting rigs to follow the changing sky. This lets artists test how pigments react from dawn to late evening without moving the work.",
      "For collectors, the slower pace is intentional: viewings are capped at six guests, with time blocked for conversations about process and provenance.",
      "Several artists reported that the proximity to water subtly shifts their palette choices toward mineral blues and moss greens, even when working on monochrome pieces.",
      "Acoustics matter: felt-lined walls and soft partitions keep the sound of waves present but not overpowering, creating a meditative atmosphere for long work sessions.",
      "The resulting shows feel like retreats—short, focused, and deeply contextual—inviting viewers to stay longer and revisit the same piece across different light conditions.",
    ],
  },
  {
    id: "woven-cartographies",
    title: "Woven Cartographies: Mapping Cities With Textiles",
    coverImage:
      "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1600&q=80",
    excerpt:
      "Cartographers are collaborating with fiber artists to translate transit lines, migration data, and memory maps into tactile wall pieces.",
    authorName: "Linh Duong",
    authorAvatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80",
    publishedAt: "2025-12-10T15:45:00Z",
    readTimeMinutes: 7,
    tag: "Process",
    category: "Textiles",
    content: [
      "From jacquard looms to hand-stitched overlays, the latest textile maps lean on both algorithmic data and intuition. The result is a hybrid language of place.",
      "Cities like Hanoi and Rotterdam are commissioning public pieces to help residents see infrastructure as something lived, not abstract.",
      "Collectors are responding to the intimate scale and storied surfaces, especially when paired with archival photographs.",
    ],
  },
  {
    id: "kinetic-resonance",
    title: "Kinetic Resonance: Sculptors Borrow from Sound Engineers",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    excerpt:
      "What happens when sculpture responds to the decibel levels in a room? A new wave of kinetic artists is tuning their work to ambient frequencies.",
    authorName: "Marco Estevez",
    authorAvatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
    publishedAt: "2025-12-05T11:10:00Z",
    readTimeMinutes: 6,
    tag: "Feature",
    category: "Installation",
    content: [
      "Piezo microphones and lightweight alloys allow sculptures to sway or pulse with subtle changes in sound. The interaction feels both intimate and futuristic.",
      "Acoustic consultants are becoming unexpected collaborators, helping artists tune resonance without overwhelming a room.",
      "Museums are testing these works in quieter galleries to let viewers notice micro-movements over longer visits.",
    ],
  },
  {
    id: "slow-curation",
    title: "Slow Curation: Why Micro Shows Are Selling Out",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    excerpt:
      "Micro exhibitions with six to eight works are giving collectors space to linger and learn the full provenance story behind each piece.",
    authorName: "Quinn Harper",
    authorAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    publishedAt: "2025-11-30T09:00:00Z",
    readTimeMinutes: 4,
    tag: "Editorial",
    category: "Market",
    content: [
      "Galleries are leaning into the format to highlight depth over breadth. The result is often a richer, more personal buying experience.",
      "With fewer works on display, lighting and text become essential storytelling tools. Curators are designing slower paths through the space.",
      "Artists report stronger conversations with visitors, who often return with friends for a second look before purchasing.",
    ],
  },
  {
    id: "chromatic-journal",
    title: "Chromatic Journal: Diaries in Color Fields",
    coverImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    excerpt:
      "Instead of writing, some artists are painting a daily rectangle of color to log their mood. The resulting grids read like emotional calendars.",
    authorName: "Sara van Bussel",
    authorAvatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
    publishedAt: "2025-11-24T13:22:00Z",
    readTimeMinutes: 5,
    tag: "Practice",
    category: "Painting",
    content: [
      "Collectors drawn to color field work appreciate the diaristic layer these pieces add. Each block anchors a memory or an event.",
      "Studios are displaying the works in long ribbons to show seasonal shifts. The chromatic rhythm becomes almost musical.",
      "Several artists have begun pairing the paintings with short audio notes accessed via QR code, giving viewers more context.",
    ],
  },
  {
    id: "material-memory",
    title: "Material Memory: Salvaged Steel, New Narratives",
    coverImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80",
    excerpt:
      "Disused industrial steel is resurfacing in galleries as sculptors weld personal histories into reclaimed beams and rivets.",
    authorName: "Kendall Warson",
    authorAvatar:
      "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=300&q=80",
    publishedAt: "2025-11-18T10:05:00Z",
    readTimeMinutes: 8,
    tag: "Deep Dive",
    category: "Sculpture",
    content: [
      "What once felt cold now reads as archival. Artists are engraving stories into the steel to acknowledge its previous life.",
      "Foundry partnerships make it easier to source materials responsibly. Some studios now host tours to show the transformation process.",
      "Curators are pairing these works with large-scale photographs of the original sites, inviting viewers to consider the chain of labor.",
    ],
  },
  {
    id: "desert-projection",
    title: "Desert Projection: Light Works After Sundown",
    coverImage:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80",
    excerpt:
      "Pop-up light installations in arid landscapes are drawing travelers for single-night experiences where sand becomes the canvas.",
    authorName: "Ivy Chen",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    publishedAt: "2025-11-12T19:40:00Z",
    readTimeMinutes: 6,
    tag: "Travel",
    category: "Light",
    content: [
      "Artists are timing projections with twilight, letting silhouettes of dunes act as moving screens. The effect shifts by the minute.",
      "Temporary works mean low impact on the landscape, but organizers still coordinate with local stewards to minimize traces.",
      "The format is inspiring collectors to commission site-specific experiences instead of objects, capturing them through film and sound.",
    ],
  },
];

export const blogMockData: BlogListingData = {
  featured: articles.slice(0, 4),
  latest: articles.slice(0, 4),
  popular: [articles[2], articles[0], articles[5], articles[3]],
  all: articles,
};
