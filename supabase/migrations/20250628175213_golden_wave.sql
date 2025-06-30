/*
  # Add RPC Functions for Multiplayer Room Management

  1. Functions
    - `increment_room_players` - Safely increment room player count
    - `decrement_room_players` - Safely decrement room player count
    
  2. Security
    - Functions use proper transaction handling
    - Prevent race conditions in player count updates
*/

-- Function to safely increment room player count
CREATE OR REPLACE FUNCTION increment_room_players(room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE multiplayer_rooms 
  SET current_players = current_players + 1 
  WHERE id = room_id;
END;
$$;

-- Function to safely decrement room player count
CREATE OR REPLACE FUNCTION decrement_room_players(room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE multiplayer_rooms 
  SET current_players = GREATEST(0, current_players - 1)
  WHERE id = room_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_room_players(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_room_players(uuid) TO authenticated;