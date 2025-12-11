export type FeedItem = {
  id: string;
  authorName: string;
  handle: string;
  verified?: boolean;
  caption?: string;
  image?: any;
  avatarInitials?: string;
  avatarColor?: string;
  coverColor?: string;
  likes?: number;
  comments?: number;
  reposts?: number;
  liked?: boolean;
  reposted?: boolean;
};

export const SAMPLE_FEED: FeedItem[] = [
  {
    id: "1",
    authorName: "Kenneth Quiller II",
    handle: "love",
    verified: true,
    caption: "🙌 God 🙌",
    avatarInitials: "KQ",
    avatarColor: "#0EA5E9",
    coverColor: "#F1EEDA",
    image: require("../../../assets/feed/sample_picture_01.jpg"),
    likes: 1,
    comments: 0,
    reposts: 0,
    liked: false,
    reposted: false,
  },
  {
    id: "2",
    authorName: "Kenneth Quiller II",
    handle: "love",
    verified: true,
    caption: "🙌 God 🙌",
    avatarInitials: "KQ",
    avatarColor: "#6366F1",
    coverColor: "#F9F5E9",
    image: require("../../../assets/feed/sample_picture_01.jpg"),
    likes: 3,
    comments: 2,
    reposts: 1,
    liked: true,
    reposted: false,
  },
  {
    id: "3",
    authorName: "Kenneth Quiller II",
    handle: "love",
    verified: true,
    caption: "Sketching the day away.",
    avatarInitials: "KQ",
    avatarColor: "#F59E0B",
    coverColor: "#F5F3E8",
    image: require("../../../assets/feed/sample_picture_01.jpg"),
    likes: 12,
    comments: 4,
    reposts: 2,
    liked: false,
    reposted: true,
  },
  {
    id: "4",
    authorName: "Kenneth Quiller II",
    handle: "love",
    verified: true,
    caption: "Early draft — thoughts?",
    avatarInitials: "KQ",
    avatarColor: "#22C55E",
    coverColor: "#F7F8ED",
    image: require("../../../assets/feed/sample_picture_01.jpg"),
    likes: 7,
    comments: 1,
    reposts: 0,
    liked: false,
    reposted: false,
  },
  {
    id: "5",
    authorName: "Kenneth Quiller II",
    handle: "love",
    verified: true,
    caption: "Color study for the next piece.",
    avatarInitials: "KQ",
    avatarColor: "#EC4899",
    coverColor: "#F8EFF7",
    image: require("../../../assets/feed/sample_picture_01.jpg"),
    likes: 20,
    comments: 5,
    reposts: 3,
    liked: true,
    reposted: true,
  },
];
