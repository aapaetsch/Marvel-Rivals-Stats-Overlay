export interface FinalHitsPlayerProps {
  // Player identification
  uid: string;  // Added UID for consistent tracking
  name: string;
  characterName?: string | null;
  avatarUrl: string | null;
  
  // Final hits tracking
  finalHitsOnPlayer?: number | null;
  finalHitsOnYou?: number | null;
}

export interface FinalHitsBarProps {
  // Define any props you want to pass to the component here
  // For example, you might want to pass a list of players or stats
  players: FinalHitsPlayerProps[] | null;
  // Add more props as needed
  // locationX: number;
  // locationY: number;
}
