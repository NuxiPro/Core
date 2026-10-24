import { plunk } from './plunk';

// Le logger sera branché ici si besoin d'un retry ou d'un fallback.
export const sendEmail = async (to: string, url: string) => {
  return plunk.sendMagicLink(to, url);
};
