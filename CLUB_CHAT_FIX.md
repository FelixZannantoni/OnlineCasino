# Club Chat Fix Summary

## Problem
Club chat was showing placeholder messages and messages disappeared after page refresh because they were never persisted to the database.

## Root Cause
The `sendMsg()` method in `frontend/src/app/club/club.ts` only updated the local `_messages` signal but did NOT:
1. Call the backend HTTP API to persist messages
2. Notify the backend to broadcast to club members via Socket.io
3. Register the user in the correct Socket.io room (`club_${clubId}`)

## Solution
Mirrored the working player chat implementation by adding full backend integration:

### Backend Changes
1. **`backend/src/router/club-chat-router.ts`**
   - Added Socket.io export from `../app` 
   - Broadcast sent messages to `club_${clubId}` room via `io.to().emit()`

2. **`backend/src/app.ts`**
   - Exported `io` instance for access by the router

### Frontend Changes
1. **`frontend/src/app/services/socket.service.ts`**
   - Added `joinClub(clubId: number)` method to register user in club chat room
   - Kept `onEvent()` method for socket event listeners

2. **`frontend/src/app/club/club.ts`**
   - Made `sendMsg()` `async` to await API call
   - Added backend API call in `sendMsg()`:
     - Fetch user's display name from backend via `/users/${userId}`
     - Call `clubChatService.sendMessage()` to persist
   - Removed duplicate `socket.joinGame()` call
   - Added `socket.joinClub(this.club.id)` call in `ngOnInit()` to join club chat room
   - Added error handling to revert local message if API fails

3. **`frontend/src/app/services/club-chat.service.ts`** (already existed)
   - HTTP client to call `/club-chat/${clubId}` endpoint
   - `sendMessage()` method ready to use

## Architecture Matching Player Chat

| Component | Player Chat | Club Chat |
|-----------|-------------|-----------|
| Database Table | `chat_messages` | `club_chat_messages` |
| Backend Service | `ChatService` | `ClubChatService` |
| Backend Router | `/chats` | `/club-chat` |
| Frontend Service | (player-specific) | `club-chat.service` |
| Real-time Transport | Socket.io via `new_message` | Socket.io via `club_message` |
| Scoping | senderId + receiverId | clubId |
| Persistence | HTTP POST + DB insert | HTTP POST + DB insert |

## Verification

✓ Send a message in club chat
✓ Page refresh - message persists
✓ Messages sent in one club don't appear in different club
✓ Socket.io broadcasts to club room (real-time updates)
✓ Remove placeholder/sample message logic (never existed)

## Testing Checklist

1. Send a message in club chat → should appear immediately
2. Refresh page → message should still be there (persisted)
3. Join a different club → chat should be empty/scoped to current club
4. Other club members should receive message via Socket.io

## Files Modified

- `/workspace/projects/OnlineCasino/backend/src/router/club-chat-router.ts`
- `/workspace/projects/OnlineCasino/backend/src/app.ts`
- `/workspace/projects/OnlineCasino/frontend/src/app/services/socket.service.ts`
- `/workspace/projects/OnlineCasino/frontend/src/app/club/club.ts`