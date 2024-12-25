interface InterrogationOption {
  id: string;
  text: string;
  requiresEvidence?: string;  // Evidence ID needed to unlock this option
  requiresTrust?: number;     // Minimum trust level needed
  outcomes: InterrogationOutcome[];
}

interface InterrogationOutcome {
  condition: string;
  responseText: string;
  trustChange: number;
  revealsSecret?: string;
  unlocksTestimony?: string;
  leadsToEvidence?: string;
} 