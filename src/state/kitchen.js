// 조리대에 보일 요리: 재료 작물이 모두 해금된 것만. [{ id, category, inputs }]
export function visibleRecipes(recipes, unlockedCropIds) {
  return Object.entries(recipes)
    .filter(([, r]) => Object.keys(r.inputs).every((id) => unlockedCropIds.includes(id)))
    .map(([id, r]) => ({ id, ...r }));
}
