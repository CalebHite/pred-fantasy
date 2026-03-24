/**
 * Validation utilities
 */

/**
 * Validate nickname
 */
export const validateNickname = (nickname: string): { valid: boolean; error?: string } => {
  if (!nickname || nickname.trim().length === 0) {
    return { valid: false, error: 'Nickname is required' };
  }

  if (nickname.length < 3) {
    return { valid: false, error: 'Nickname must be at least 3 characters' };
  }

  if (nickname.length > 20) {
    return { valid: false, error: 'Nickname must be less than 20 characters' };
  }

  // Only allow alphanumeric, spaces, and common symbols
  const validChars = /^[a-zA-Z0-9 _-]+$/;
  if (!validChars.test(nickname)) {
    return { valid: false, error: 'Nickname contains invalid characters' };
  }

  return { valid: true };
};

/**
 * Validate buy-in amount
 */
export const validateBuyIn = (amount: number): { valid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Buy-in must be greater than 0' };
  }

  if (amount > 1000) {
    return { valid: false, error: 'Buy-in must be less than 1000' };
  }

  return { valid: true };
};

/**
 * Validate max participants
 */
export const validateMaxParticipants = (max?: number): { valid: boolean; error?: string } => {
  if (max === undefined) return { valid: true };

  if (max < 2) {
    return { valid: false, error: 'At least 2 participants required' };
  }

  if (max > 100) {
    return { valid: false, error: 'Maximum 100 participants allowed' };
  }

  return { valid: true };
};

/**
 * Validate resolution time
 */
export const validateResolutionTime = (time: Date): { valid: boolean; error?: string } => {
  const now = new Date();
  const minTime = new Date(now.getTime() + 60 * 60 * 1000); // At least 1 hour from now

  if (time < minTime) {
    return { valid: false, error: 'Resolution time must be at least 1 hour from now' };
  }

  const maxTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Max 1 year
  if (time > maxTime) {
    return { valid: false, error: 'Resolution time must be within 1 year' };
  }

  return { valid: true };
};
