import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    isPrivate: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),

  posts: defineTable({
    authorId: v.string(),
    caption: v.string(),
    media: v.array(v.object({
      objectKey: v.string(),
      url: v.string(),
      mediaType: v.union(v.literal("image"), v.literal("video")),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      durationMs: v.optional(v.number()),
    })),
    visibility: v.union(v.literal("public"), v.literal("followers"), v.literal("private")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author_created", ["authorId", "createdAt"])
    .index("by_created", ["createdAt"]),

  follows: defineTable({
    followerId: v.string(),
    followingId: v.string(),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_pair", ["followerId", "followingId"]),

  reactions: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
    kind: v.union(v.literal("like"), v.literal("save")),
    createdAt: v.number(),
  })
    .index("by_post_kind", ["postId", "kind"])
    .index("by_user_post_kind", ["userId", "postId", "kind"]),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.string(),
    body: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_post_created", ["postId", "createdAt"]),

  stories: defineTable({
    authorId: v.string(),
    objectKey: v.string(),
    mediaUrl: v.string(),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    caption: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_author_expiry", ["authorId", "expiresAt"]),

  conversations: defineTable({
    participantIds: v.array(v.string()),
    lastMessageAt: v.number(),
    createdAt: v.number(),
  }).index("by_last_message", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    body: v.optional(v.string()),
    attachmentKey: v.optional(v.string()),
    attachmentUrl: v.optional(v.string()),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
  }).index("by_conversation_created", ["conversationId", "createdAt"]),

  notifications: defineTable({
    recipientId: v.string(),
    actorId: v.string(),
    kind: v.string(),
    entityId: v.optional(v.string()),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_recipient_created", ["recipientId", "createdAt"]),

  liveRooms: defineTable({
    hostId: v.string(),
    title: v.string(),
    status: v.union(v.literal("scheduled"), v.literal("live"), v.literal("ended")),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_status_created", ["status", "createdAt"]),
});
