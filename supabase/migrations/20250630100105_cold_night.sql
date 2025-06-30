/*
  # Fix Multiplayer Room Permissions

  1. Updates
    - Fix RLS policies for multiplayer_rooms table
    - Add more permissive policies for room creation and management
    - Ensure proper access control for room participants
    
  2. Security
    - Maintain security while allowing proper room creation
    - Add policies for room owners
*/

-- Drop existing policies on multiplayer_rooms
DROP POLICY IF EXISTS "Anyone can read rooms" ON multiplayer_rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON multiplayer_rooms;

-- Create more permissive policies for multiplayer_rooms
CREATE POLICY "Anyone can read rooms"
  ON multiplayer_rooms FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON multiplayer_rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Room owners can update rooms"
  ON multiplayer_rooms FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM room_participants
    WHERE room_id = multiplayer_rooms.id
    AND user_id = auth.uid()
    AND position = 1 -- Position 1 is the room owner
  ));

-- Add owner_id column to multiplayer_rooms
ALTER TABLE multiplayer_rooms ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES users(id);

-- Add join_requests table for room join management
CREATE TABLE IF NOT EXISTS room_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES multiplayer_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS on join requests
ALTER TABLE room_join_requests ENABLE ROW LEVEL SECURITY;

-- Policies for join requests
CREATE POLICY "Users can create join requests"
  ON room_join_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read join requests for their rooms"
  ON room_join_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM multiplayer_rooms
      WHERE id = room_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Room owners can update join requests"
  ON room_join_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM multiplayer_rooms
      WHERE id = room_id AND owner_id = auth.uid()
    )
  );