import { buildDocsFromContext } from './build-docs-from-context';
import type { KnowledgeBase } from './build-knowledge-base';
import { embedTexts } from './embed-texts';
import type { UserContext } from './user-context';

export const buildKnowledge = async (ctx: UserContext): Promise<KnowledgeBase> => {
  const docs = buildDocsFromContext(ctx);
  const vectors = await embedTexts(docs);
  return { docs, vectors };
};


