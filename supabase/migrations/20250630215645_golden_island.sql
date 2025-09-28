/*
  # Add Message Field to Room Join Requests

  1. Updates
    - Add message field to room_join_requests table
    - This allows users to send a message with their join request
    
  2. Security
    - Maintains existing security policies
*/

-- Add message field to room_join_requests table
ALTER TABLE room_join_requests ADD COLUMN IF NOT EXISTS message text;

-- Update the room_join_requests table to include a message field in the schema
COMMENT ON TABLE room_join_requests IS 'Stores requests to join multiplayer rooms with optional messages';
COMMENT ON COLUMN room_join_requests.message IS 'Optional message from the user requesting to join';