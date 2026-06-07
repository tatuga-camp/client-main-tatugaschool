import { RubricWithTree } from "../../../interfaces";
import { RequestCreateRubricService } from "../../../services";

/**
 * Map a fully-loaded rubric tree onto a create request for a different subject.
 * Copies structure only (criteria + levels); ids, grades, and assignment links
 * are intentionally dropped so the copy starts as a fresh, unattached rubric.
 */
export function buildCopyRequest(
  tree: RubricWithTree,
  targetSubjectId: string,
): RequestCreateRubricService {
  return {
    title: tree.title,
    description: tree.description,
    subjectId: targetSubjectId,
    criteria: tree.criteria.map((criterion) => ({
      title: criterion.title,
      description: criterion.description,
      weight: criterion.weight,
      order: criterion.order,
      levels: criterion.levels.map((level) => ({
        title: level.title,
        description: level.description,
        points: level.points,
        order: level.order,
      })),
    })),
  };
}
