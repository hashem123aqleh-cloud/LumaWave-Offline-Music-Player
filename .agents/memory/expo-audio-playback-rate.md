---
name: Expo Audio playback rate
description: Playback-rate updates must wait until the Expo Audio player is loaded on web.
---

Expo Audio's web player does not have an underlying media element before a track loads, so assigning `playbackRate` during initial provider mount throws. Apply the saved rate only after the player's loaded status is true.

**Why:** The native and web player implementations expose the same property but differ in initialization timing.

**How to apply:** Any future playback-rate or media-element property updates should be guarded by the loaded status.