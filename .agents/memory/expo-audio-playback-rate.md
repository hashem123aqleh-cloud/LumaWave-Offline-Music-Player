---
name: Expo Audio playback rate
description: Playback-rate updates must wait until the Expo Audio player is loaded on web.
---

Expo Audio's web player does not have an underlying media element before a track loads, and the native player exposes the playback-rate property as read-only at runtime. Apply the saved rate with `player.setPlaybackRate(...)` only after the player's loaded status is true.

**Why:** The native and web player implementations expose similar types but differ in initialization timing and property mutability.

**How to apply:** Any future playback-rate or media-element property updates should be guarded by the loaded status.