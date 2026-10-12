/**
 * Code non utilisable et migration vers plunk définitivement
 * code trop verbeux et trop long et inutile
 */

import { LoopsClient, APIError } from "loops";

const loops = new LoopsClient(process.env.LOOPS_API_KEY as string);

export const sendEmail = async (to: string, url: string) => {
  try {
    const resp = await loops.sendTransactionalEmail({
      transactionalId: process.env.LOOPS_TEMPLATE_ID as string,
      email: to,
      addToAudience: true,
      dataVariables: {
        url,
        browser: "unknown",
        os: "unknown",
        date: new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });

    if (!resp.success) {
      throw new Error("Loops: Email send failed");
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(`Loops API: ${JSON.stringify(error.json)}`);
    }
    throw error;
  }
};
